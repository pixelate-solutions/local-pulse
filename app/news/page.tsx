// app/news/page.tsx

import Navbar from '@/components/navbar'
import NewsClient from './NewsClient'

export default function NewsPage({
  searchParams,
}: {
  searchParams: { zip?: string; option?: string }
}) {
  // pull them out of the server‐side props
  const zip    = typeof searchParams.zip    === 'string' ? searchParams.zip    : ''
  const option = typeof searchParams.option === 'string' ? searchParams.option : ''

  return (
    <>
      <Navbar />
      <NewsClient zip={zip} option={option} />
    </>
  )
}
