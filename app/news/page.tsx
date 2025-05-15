// app/news/page.tsx
'use client';

import Navbar from '@/components/navbar';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Article {
  title:       string;
  url:         string;
  source:      string;
  publishedAt: string;
  description: string;
}

interface Meta {
  center:      { city: string; state: string };
  radiusMiles: number;
}

export default function NewsPage() {
  const params      = useSearchParams();
  const zip         = params.get('zip')!;
  const radiusParam = params.get('radius');
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [meta,     setMeta    ] = useState<Meta | null>(null);
  const [error,    setError   ] = useState<string | null>(null);

  useEffect(() => {
    if (!zip || !radiusParam) return;
    const url = `/api/news?zip=${zip}&radius=${encodeURIComponent(radiusParam)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setArticles([]);
        } else {
          setMeta({
            center:      data.center,
            radiusMiles: data.radiusMiles,
          });
          setArticles(data.articles);
        }
      })
      .catch(() => {
        setError('Unexpected error fetching news');
        setArticles([]);
      });
  }, [zip, radiusParam]);

  if (error) {
    return (
      <>
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-6 py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }
  if (!articles || !meta) {
    return (
      <>
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-6 py-12">
          <p>Loading…</p>
        </div>
      </>
    );
  }

  const displayRadius = meta.radiusMiles;

  return (
    <>
      <Navbar />

      <div className="pt-24 max-w-7xl mx-auto px-6 py-12 bg-gray-50 rounded-lg">
        <h1 className="text-3xl font-bold mb-8 text-black border-l-4 border-green-500 pl-4">
          Community Updates for {meta.center.city}, {meta.center.state} ({zip}, ±{displayRadius} mi)
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min auto-flow-row-dense">
          {articles.map((a, i) => {
            const span =
              i % 7 === 0
                ? 'lg:col-span-2'
                : i % 5 === 0
                ? 'sm:col-span-2'
                : '';

            return (
              <a
                key={i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${span} block transform transition hover:scale-[103%] cursor-pointer`}
              >
                <Card className="h-full bg-white shadow-green-500/40 shadow-lg">
                  <CardContent className="h-full flex flex-col">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {a.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {new Date(a.publishedAt).toLocaleString()}
                    </p>
                    {a.description && (
                      <p className="text-gray-700 flex-grow">{a.description}</p>
                    )}
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}
