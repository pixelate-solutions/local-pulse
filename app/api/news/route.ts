// app/api/news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import zipcodes, { ZipCode } from 'zipcodes';
import { lookupZip } from '@/lib/zip';
import { localDomainsByState, nationalDomains } from '@/lib/localDomains';
import RSSParser from 'rss-parser';

const parser = new RSSParser();

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const zip    = (searchParams.get('zip') ?? '').trim();
  const radius = parseInt(searchParams.get('radius') ?? '', 10);

  if (!/^\d{5}(?:[-\s]?\d{4})?$/.test(zip))
    return NextResponse.json({ error: 'Invalid ZIP' }, { status: 400 });

  const allowedRadii = [10,25,50,100,200];
  if (!allowedRadii.includes(radius))
    return NextResponse.json({ error: 'Invalid radius' }, { status: 400 });

  const center = lookupZip(zip);
  if (!center)
    return NextResponse.json({ error: 'ZIP not found' }, { status: 404 });

  // gather nearby cities…
  const rawZips = zipcodes.radius(zip, radius).filter((z): z is string => typeof z === 'string');
  const seenCities = new Set<string>();
  const cities: string[] = [];
  for (const z of rawZips) {
    const loc = zipcodes.lookup(z);
    if (!loc) continue;
    const cs = `${loc.city}, ${loc.state}`;
    if (!seenCities.has(cs)) {
      seenCities.add(cs);
      cities.push(cs);
    }
    if (cities.length >= 10) break;
  }
  if (cities.length === 0)
    return NextResponse.json({ error: 'No nearby cities found' }, { status: 404 });

  // build site: filter
  const local = localDomainsByState[center.state] || [];
  const allDomains = [...local, ...nationalDomains];
  const siteFilter = allDomains.map(d => `site:${d}`).join(' OR ');

  // build query
  const cityQuery = cities.map(c => `"${c}"`).join(' OR ');
  const fullQuery = `${cityQuery} AND (${siteFilter}) when:30d`;
  const feedUrl = `https://news.google.com/rss/search?${new URLSearchParams({
    q:    fullQuery,
    hl:   'en-US',
    gl:   'US',
    ceid: 'US:en',
  })}`;

  // fetch & parse
  let feed;
  try {
    feed = await parser.parseURL(feedUrl);
  } catch (err) {
    console.error('Google News RSS error:', err);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 502 });
  }

  // shape articles with fallback description
  const items = (feed.items || []).slice(0,20);
  const articles = items.map(item => {
    // raw HTML content from various fields
    const raw =
      item.contentSnippet ||
      item.content ||
      // @ts-ignore: content:encoded
      item['content:encoded'] ||
      '';
    const description = raw ? stripHtml(raw).slice(0, 250) : '';
    return {
      title:       item.title       ?? '',
      url:         item.link        ?? '',
      source:      item.source      ?? feed.title ?? '',
      publishedAt: item.isoDate     ?? item.pubDate ?? '',
      description,
    };
  });

  return NextResponse.json({
    zip,
    center:      { city: center.city, state: center.state },
    radiusMiles: radius,
    queryCities: cities,
    articles,
  });
}
