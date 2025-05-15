'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

// Define available topics
const topics = [
  'News',
  'Sports',
  'Technology',
  'Health',
  'Education',
  'Entertainment',
  'Business',
  'Politics',
  'Science',
];

// Define available radius options (miles)
const radii = [10, 25, 50, 100, 200];

export default function Hero() {
  const [zip, setZip] = useState('');
  const [topic, setTopic] = useState('');
  const [radius, setRadius] = useState<number | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const validateZip = (v: string) =>
    /^\d{5}(?:[-\s]?\d{4})?$/.test(v);

  const handleExplore = () => {
    if (!validateZip(zip.trim())) {
      setError('Please enter a valid ZIP code (e.g. 12345 or 12345-6789).');
      return;
    }
    if (radius == null) {
      setError('Please select a radius.');
      return;
    }
    setError('');
    const qs = new URLSearchParams({
      zip: zip.trim(),
      topic,
      radius: radius.toString(),
    });
    router.push(`/news?${qs}`);
  };

  return (
    <section id="hero" className="relative bg-gray-50 lg:pt-10">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center">
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Your Community, Your Voice
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            LocalPulse is where neighbors share news, events, and stories happening around you.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl lg:pr-4">
          {/* Left: ZIP input */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter ZIP code"
              className="w-full h-12 !text-lg placeholder:text-lg"
              value={zip}
              onChange={(e) => {
                setZip(e.target.value);
                setError('');
              }}
            />
          </div>

          {/* Right: stacked topic, radius, and button */}
          <div className="flex-1 flex flex-col space-y-4">
            <Select
              value={radius?.toString() ?? ''}
              onValueChange={(v) => {
                setRadius(parseInt(v, 10));
                setError('');
              }}
            >
              <SelectTrigger className="w-full h-12 text-lg hover:cursor-pointer">
                <SelectValue placeholder="Radius (mi)" />
              </SelectTrigger>
              <SelectContent>
                {radii.map((r) => (
                  <SelectItem key={r} value={r.toString()}>
                    {r} miles
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            
          </div>
          </div>
          <div className='pr-4 pt-4'>
            <Button
                onClick={handleExplore}
                className="w-full h-12 text-xl bg-gradient-to-br from-green-500 to-green-700 hover:scale-[101%] hover:shadow-lg hover:cursor-pointer"
              >
                Explore
            </Button>
          </div>

          {error && <p className="mt-2 text-red-500">{error}</p>}
        </div>

        <div className="flex-1 mt-10 lg:mt-0">
          <img
            src="/neighborhood.jpg"
            alt="Community illustration"
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
