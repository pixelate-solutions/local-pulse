"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Hero = () => {
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Validate ZIP: 5 digits or 9 digits (with optional hyphen or space)
  const validateZip = (value: string) => {
    const regex = /^\d{5}(?:[-\s]?\d{4})?$/;
    return regex.test(value);
  };

  const handleExplore = () => {
    if (!validateZip(zip.trim())) {
      setError('Please enter a valid zip code (e.g. 12345 or 12345-6789).');
      return;
    }
    // Navigate to /blog with zip as query param
    router.push(`/blog?zip=${encodeURIComponent(zip.trim())}`);
  };

  return (
    <section id="hero" className="relative bg-gray-50 lg:pt-10">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center">
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Your Community, Your Voice
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            LocalPulse is where neighbors share news, events, and stories happening around you. Join the conversation today!
          </p>
          <div className="flex space-x-4 text-xl">
            <Input
              type="text"
              placeholder="Enter your zip code"
              className="max-w-xs h-12 !text-lg placeholder:text-lg"
              value={zip}
              onChange={(e) => {
                setZip(e.target.value);
                if (error) setError('');
              }}
            />
            <Button className='hover:cursor-pointer h-12 text-xl bg-gradient-to-br to-green-700 from-green-500 hover:scale-[101%] hover:shadow-lg' onClick={handleExplore}>Explore</Button>
          </div>
          {error && <p className="mt-2 text-red-500">{error}</p>}
        </div>
        <div className="flex-1 mt-10 lg:mt-0">
          <img className="rounded-lg shadow-lg" src="/neighborhood.jpg" alt="Community illustration" />
        </div>
      </div>
    </section>
  );
};

export default Hero;