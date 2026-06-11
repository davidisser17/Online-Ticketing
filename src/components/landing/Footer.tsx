import React from 'react';
import { Link } from 'react-router-dom';

// ============================================================
// Footer — Landing Page
// ============================================================

/**
 * Simple footer for all public-facing pages.
 * Dark background, brand logo, tagline, copyright, and nav links.
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto py-10 px-4 flex flex-col items-center gap-4 text-center">
        {/* Brand */}
        <span className="text-xl font-bold text-white">🎵 JastipTiket</span>

        {/* Tagline */}
        <p className="text-sm max-w-sm">
          Layanan jasa titip tiket konser terpercaya. Pesan dengan mudah, pantau
          status pesanan secara real-time.
        </p>

        {/* Nav links */}
        <nav aria-label="Footer navigasi" className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm hover:text-white transition-colors"
          >
            Beranda
          </Link>
          <Link
            to="/track"
            className="text-sm hover:text-white transition-colors"
          >
            Lacak Pesanan
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-gray-500">
          &copy; {currentYear} JastipTiket. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
