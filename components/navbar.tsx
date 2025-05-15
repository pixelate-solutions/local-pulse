// components/navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed w-full z-50 backdrop-blur bg-white/30 shadow-sm">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="LocalPulse Logo" className="h-8 w-auto" />
          <span className="text-3xl font-extrabold text-gray-900">
            LocalPulse
          </span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-gray-800"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu items */}
        <ul
          className={`
            absolute md:static top-full left-0 w-full md:w-auto
            bg-white/90 md:bg-transparent
            transition-transform duration-200 ease-in-out
            transform ${open ? 'translate-y-0' : '-translate-y-[200%]'}
            md:translate-y-0
            md:flex md:items-center md:space-x-8
          `}
        >
          <li>
            <Link
              href="/#hero"
              className="block px-4 py-2 text-lg text-gray-700 hover:text-green-500"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/#features"
              className="block px-4 py-2 text-lg text-gray-700 hover:text-green-500"
              onClick={() => setOpen(false)}
            >
              Features
            </Link>
          </li>
          <li>
            <Link
              href="/#about"
              className="block px-4 py-2 text-lg text-gray-700 hover:text-green-500"
              onClick={() => setOpen(false)}
            >
              About
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
