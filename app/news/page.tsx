// app/news/page.tsx

import Navbar from '@/components/navbar'
import NewsClient from './NewsClient'

export default function Page({
  params,
  searchParams,
}: {
  params: {}                                // no dynamic segments here
  searchParams: {                           // Next’s built-in type for searchParams
    [key: string]: string | string[] | undefined
  }
}) {
  // safely coerce zip & option into single strings:
  const rawZip    = searchParams.zip
  const rawOption = searchParams.option

  const zip = Array.isArray(rawZip)
    ? rawZip[0]
    : rawZip ?? ''

  const option = Array.isArray(rawOption)
    ? rawOption[0]
    : rawOption ?? ''

  return (
    <>
      <Navbar />
      <NewsClient zip={zip} option={option} />
    </>
  )
}
