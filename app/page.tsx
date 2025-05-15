"use client"

import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import Features from '@/components/features';
import CTA from '@/components/cta';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <Navbar />
      <main className="pt-20">
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}