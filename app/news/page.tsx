// app/news/page.tsx
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import NewsClient from './NewsClient'

// A tiny wrapper that reads the URL params (client‐side) and passes them down
function NewsWrapper() {
  const params = useSearchParams()
  const zip    = params.get('zip')    ?? ''
  const option = params.get('option') ?? ''
  return <NewsClient zip={zip} option={option} />
}

export default function Page() {
  return (
    <>
      <Navbar />

      {/* Suspense around anything that uses useSearchParams() */}
      <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
        <NewsWrapper />
      </Suspense>
    </>
  )
}
