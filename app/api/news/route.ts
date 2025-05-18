// app/api/news/route.ts

import { NextRequest, NextResponse } from 'next/server'
import zipcodes, { ZipCode } from 'zipcodes'
import { lookupZip } from '@/lib/zip'
import { localDomainsByState } from '@/lib/localDomains'

/** GNews article shape */
interface GNewsArticle {
  title: string
  url: string
  source?: { name: string }
  publishedAt: string
  description?: string
}

/** Extended error for status checks */
type GNewsError = Error & {
  status?: number
  isLimit?: boolean
}

/** haversine distance in miles */
function toRad(deg: number) {
  return (deg * Math.PI) / 180
}
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2
  const R = 3958.8 // Earth radius in miles
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** Sleep for given milliseconds */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Fetches up to 10 articles from GNews for the given query and token.
 */
async function fetchGNewsFor(
  query: string,
  token: string
): Promise<GNewsArticle[]> {
  const from = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  )
    .toISOString()
    .slice(0, 10)

  const params = new URLSearchParams({
    token,
    q: query,
    lang: 'en',
    country: 'us',
    max: '10',
    from,
  })

  const res = await fetch(
    `https://gnews.io/api/v4/search?${params}`
  )
  const body = await res.text().catch(() => '')
  if (!res.ok) {
    const err = new Error(`GNews ${res.status}: ${body}`) as GNewsError
    err.status = res.status
    throw err
  }

  const json = JSON.parse(body) as {
    articles?: unknown
  }

  if (!Array.isArray(json.articles)) {
    return []
  }

  // coerce & validate each field
  return (json.articles as unknown[]).map((item) => {
    const a = item as Record<string, unknown>;

    // Safely pull out source.name without using `any`
    let sourceName = '';
    if (
      typeof a.source === 'object' &&
      a.source !== null &&
      'name' in a.source &&
      typeof (a.source as Record<string, unknown>).name === 'string'
    ) {
      sourceName = (a.source as Record<string, string>).name;
    }

    return {
      title: typeof a.title === 'string' ? a.title : '',
      url: typeof a.url === 'string' ? a.url : '',
      source: { name: sourceName },
      publishedAt:
        typeof a.publishedAt === 'string' ? a.publishedAt : '',
      description:
        typeof a.description === 'string' ? a.description : '',
    };
  });
}

/**
 * Try each key in order until one succeeds or all fail with 429/403.
 */
async function fetchWithKeys(
  query: string,
  keys: string[]
): Promise<GNewsArticle[]> {
  for (const key of keys) {
    try {
      return await fetchGNewsFor(query, key)
    } catch (error: unknown) {
      const err = error as GNewsError
      if (err.status === 429 || err.status === 403) {
        // rate‐limit, try next key
        continue
      }
      throw err
    }
  }
  // all keys throttled
  const limitErr = new Error(
    'Daily limit reached'
  ) as GNewsError
  limitErr.isLimit = true
  throw limitErr
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const zip = (searchParams.get('zip') ?? '').trim()
  const option = (searchParams.get('option') ?? '').trim()

  // 1) validate inputs
  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      { error: 'Invalid ZIP' },
      { status: 400 }
    )
  }

  const allowedOptions = [
    'Very close',
    'Nearby',
    'Surroundings',
  ]
  if (!allowedOptions.includes(option)) {
    return NextResponse.json(
      { error: 'Invalid option' },
      { status: 400 }
    )
  }

  // 2) map option to radiusMiles & numCities
  let radiusMiles = 0,
    numCities = 0
  switch (option) {
    case 'Very close':
      radiusMiles = 10
      numCities = 3
      break
    case 'Nearby':
      radiusMiles = 50
      numCities = 6
      break
    case 'Surroundings':
      radiusMiles = 200
      numCities = 10
      break
  }

  // 3) lookup center location
  const center = lookupZip(zip)
  if (!center) {
    return NextResponse.json(
      { error: 'ZIP not found' },
      { status: 404 }
    )
  }
  const {
    city: centerCity,
    state: centerState,
    latitude: cLat,
    longitude: cLon,
  } = center

  // 4) collect & sort nearby zips by distance
  const rawZips = zipcodes
    .radius(zip, radiusMiles)
    .filter(
      (z): z is string => typeof z === 'string'
    )

  const withDist: {
    loc: ZipCode
    dist: number
  }[] = []
  for (const z of rawZips) {
    const loc = zipcodes.lookup(z)
    if (!loc) continue
    withDist.push({
      loc,
      dist: haversine(
        cLat,
        cLon,
        loc.latitude,
        loc.longitude
      ),
    })
  }
  withDist.sort((a, b) => a.dist - b.dist)

  // 5) pick up to 10 unique cities and gather states
  const seenCities = new Set<string>()
  const citiesWithDist: {
    label: string
    dist: number
  }[] = []
  const states = new Set<string>()

  for (const { loc, dist } of withDist) {
    const label = `${loc.city}, ${loc.state}`
    if (!seenCities.has(label)) {
      seenCities.add(label)
      citiesWithDist.push({ label, dist })
      states.add(loc.state)
    }
    if (citiesWithDist.length >= 10) break
  }
  if (citiesWithDist.length === 0) {
    return NextResponse.json(
      { error: 'No nearby cities found' },
      { status: 404 }
    )
  }

  // 6) load up to 5 keys from env
  const keys = [
    process.env.GNEWS_API_KEY1,
    process.env.GNEWS_API_KEY2,
    process.env.GNEWS_API_KEY3,
    process.env.GNEWS_API_KEY4,
    process.env.GNEWS_API_KEY5,
  ]
    .filter((k): k is string => Boolean(k))
  if (keys.length === 0) {
    return NextResponse.json(
      { error: 'No API keys configured' },
      { status: 500 }
    )
  }

  // 7) sequentially fetch per-city, spacing 1s apart
  const rawWithDist: {
    article: GNewsArticle
    dist: number
    time: number
  }[] = []
  for (let i = 0; i < numCities; i++) {
    const { label, dist } = citiesWithDist[i]
    const cityName = label.split(',')[0]
    try {
      const arts = await fetchWithKeys(cityName, keys)
      for (const a of arts) {
        rawWithDist.push({
          article: a,
          dist,
          time: new Date(
            a.publishedAt
          ).getTime(),
        })
      }
    } catch (error: unknown) {
      const e = error as GNewsError
      if (e.isLimit) {
        return NextResponse.json(
          {
            error:
              'Daily API limit reached. Please try again after midnight.',
          },
          { status: 429 }
        )
      }
      console.error(
        `GNews fetch for ${label} failed:`,
        e
      )
    }
    if (i < numCities - 1) await sleep(1000)
  }

  // 8) filter to truly local domains across all states
  const allowedDomains = Array.from(states).flatMap(
    (s) => localDomainsByState[s] || []
  )
  const deduped: {
    article: GNewsArticle
    dist: number
    time: number
  }[] = []
  const seenUrls = new Set<string>()

  for (const x of rawWithDist) {
    try {
      const host = new URL(
        x.article.url
      )
        .hostname.replace(/^www\./, '')
      if (
        !allowedDomains.some(
          (d) =>
            host === d || host.endsWith(`.${d}`)
        )
      )
        continue
    } catch {
      continue
    }
    if (seenUrls.has(x.article.url)) continue
    seenUrls.add(x.article.url)
    deduped.push(x)
  }

  // 9) select up to 20 spaced across distance bins
  const bins = 5
  const perBin = Math.ceil(20 / bins)
  const binSize = radiusMiles / bins
  const selected: GNewsArticle[] = []

  for (
    let i = 0;
    i < bins && selected.length < 20;
    i++
  ) {
    const low = i * binSize
    const high = (i + 1) * binSize
    const candidates = deduped
      .filter(
        (x) => x.dist >= low && x.dist < high
      )
      .sort((a, b) => b.time - a.time)

    for (
      let j = 0;
      j < perBin &&
      selected.length < 20 &&
      j < candidates.length;
      j++
    ) {
      selected.push(candidates[j].article)
    }
  }

  // Fill remaining by recency if under 20
  if (selected.length < 20) {
    const remaining = deduped
      .map((x) => x.article)
      .filter(
        (a) =>
          !selected.some(
            (s) => s.url === a.url
          )
      )
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime()
      )

    for (const a of remaining) {
      if (selected.length >= 20) break
      selected.push(a)
    }
  }

  // 10) shape response
  const articles = selected.map((a) => ({
    title: a.title,
    url: a.url,
    source: a.source?.name ?? '',
    publishedAt: a.publishedAt,
    description: a.description ?? '',
  }))

  return NextResponse.json({
    zip,
    center: { city: centerCity, state: centerState },
    option,
    queryCities: citiesWithDist.map((c) => c.label),
    articles,
  })
}
