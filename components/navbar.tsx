"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const handleScroll = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  };

  return (
    <header className="fixed w-full z-50 backdrop-blur bg-white/30">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="LocalPulse Logo" className="h-8 w-auto" />
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">LocalPulse</span>
        </Link>
        <div className="md:hidden">
          <button onClick={() => setOpen(!open)} className="p-2 text-gray-800">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <ul
          className={`md:flex md:items-center md:space-x-8 absolute md:static top-full left-0 w-full md:w-auto bg-white/90 md:bg-transparent transition-transform transform ${
            open ? 'translate-y-0' : '-translate-y-[200%]'
          } md:translate-y-0`}
        >
          <li>
            <Link href="#hero" onClick={handleScroll('hero')} className="block px-4 py-2 hover:text-green-500">
              Home
            </Link>
          </li>
          <li>
            <a href="#features" onClick={handleScroll('features')} className="block px-4 py-2 hover:text-green-500">
              Features
            </a>
          </li>
          <li>
            <a href="#about" onClick={handleScroll('about')} className="block px-4 py-2 hover:text-green-500">
              About
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;