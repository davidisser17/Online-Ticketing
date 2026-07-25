import React from 'react';
import { Link } from 'react-router-dom';

// ============================================================
// Navbar — Landing Page
// ============================================================

const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <nav
        aria-label="Navigasi utama"
        className="max-w-6xl mx-auto flex items-center px-4 h-14"
      >
        <Link
          to="/"
          className="text-xl font-bold text-primary-600 hover:opacity-90 transition-opacity"
        >
          🎵 JastipTiket
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
