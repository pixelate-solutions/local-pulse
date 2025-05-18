import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { DemoPopup } from './demo-popup';

const CTA = () => {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <section id="cta" className="py-20 bg-green-600 text-white text-center relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-white opacity-10 rounded-full"></div>
      <div className="relative max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-4">Stay in the Loop</h2>
        <p className="mb-8 text-lg">Sign up and never miss the pulse of your community with our daily newsletter.</p>
        <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 hover:cursor-pointer"
        onClick={() => {setPopupOpen(true)}}>
          Join Free
        </Button>
      </div>
      <DemoPopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
    </section>
  )
};

export default CTA;