// app/news/page.tsx
'use client';

import Navbar from '@/components/navbar';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface Article {
  title:       string;
  url:         string;
  source:      string;
  publishedAt: string;
  description: string;
}

interface Meta {
  center:      { city: string; state: string };
  option: string;
}

// Hook: countdown to a target Date
function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(target.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (timeLeft <= 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const totalSec = Math.floor(timeLeft / 1000);
  const hours   = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { hours, minutes, seconds };
}

export default function NewsPage() {
  const params      = useSearchParams();
  const zip         = params.get('zip')!;
  const option      = params.get('option')!;
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [meta,     setMeta    ] = useState<Meta | null>(null);
  const [error,    setError   ] = useState<string | null>(null);
  const [loading,  setLoading ] = useState(true);

  // compute next midnight UTC
  const now = new Date();
  const nextMidnightUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ));
  const { hours, minutes, seconds } = useCountdown(nextMidnightUTC);

  useEffect(() => {
    if (!zip || !option) return;
    setLoading(true);
    const url = `/api/news?zip=${zip}&option=${encodeURIComponent(option)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setArticles([]);
        } else {
          setMeta({ center: data.center, option: data.option });
          setArticles(data.articles);
        }
      })
      .catch(() => {
        setError('Unexpected error fetching news');
        setArticles([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [zip, option]);

  // 1) Fancy loading screen
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-green-500" />
            <p className="text-xl font-semibold text-green-600">
              Fetching the latest local stories...
            </p>
            <div className="w-48 h-1 bg-green-200 overflow-hidden rounded-full">
              <div className="h-full bg-green-500 animate-[loading_2s_linear_infinite]"></div>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes loading {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </>
    );
  }

  // 2) Daily limit reached with countdown
  if (error?.toLowerCase().includes('limit')) {
    return (
      <>
        <Navbar />
        <div className="pt-24 max-w-2xl mx-auto px-6 py-12 text-center">
          <Card className="border-l-4 border-red-500 bg-red-50">
            <CardContent>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Daily Search Limit Reached
              </h2>
              <p className="text-red-700 mb-6">
                You’ve used up today’s free searches. 🔒
              </p>
              <div className="text-green-600 font-mono text-lg">
                Next reset in: {String(hours).padStart(2,'0')}:
                              {String(minutes).padStart(2,'0')}:
                              {String(seconds).padStart(2,'0')} (HH:MM:SS UTC)
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // 3) Any other error
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

  // 4) Normal article display
  return (
    <>
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-6 py-12 bg-gray-50 rounded-lg">
        <h1 className="text-3xl font-bold mb-8 text-black border-l-4 border-green-500 pl-4">
          Local News for {meta!.center.city}, {meta!.center.state} ({zip} — {meta!.option})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min auto-flow-row-dense">
          {articles!.map((a, i) => {
            const span =
              i % 7 === 0 ? 'lg:col-span-2'
            : i % 5 === 0 ? 'sm:col-span-2'
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
