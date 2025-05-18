// app/news/page.tsx

import Navbar from '@/components/navbar'
import NewsClient from './NewsClient'

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  // pull zip & option out safely
  const rawZip    = searchParams.zip
  const rawOption = searchParams.option

  const zip = Array.isArray(rawZip) ? rawZip[0] : rawZip ?? ''
  const option = Array.isArray(rawOption) ? rawOption[0] : rawOption ?? ''

  return (
    <>
      <Navbar />
      <NewsClient zip={zip} option={option} />
    </>
  )
}
