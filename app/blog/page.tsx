"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const BlogPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const zipParam = searchParams.get('zip');
  const [zipcode, setZipcode] = useState<string | null>(null);

  useEffect(() => {
    if (zipParam) {
      setZipcode(zipParam);
    }
  }, [zipParam]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">
        Community Updates {zipcode ? `for ${zipcode}` : ''}
      </h1>
      {/* TODO: Replace below with your Sanity-powered blog posts */}
      <p>Here you’ll see the latest posts from your area.</p>
    </div>
  );
};

export default BlogPage;