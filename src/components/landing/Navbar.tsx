import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/common/Button';

// ============================================================
// Navbar — Landing Page
// ============================================================

/**
 * Responsive sticky navbar for the public-facing landing pages.
 *
 * - Desktop: logo left, nav links right
 * - Mobile: logo left, hamburger right → dropdown menu
 */
const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <nav
        aria-label="Navigasi utama"
        className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14"
      >
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold text-primary-600 hover:opacity-90 transition-opacity"
          onClick={closeMenu}
        >
          🎵 JastipTiket
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
          >
            Beranda
          </Link>
          <Link
            to="/track"
            className={buttonVariants({ variant: 'primary', size: 'sm' })}
          >
            Lacak Pesanan
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="sm:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={toggleMenu}
        >
          {menuOpen ? (
            /* X icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* Hamburger icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3"
        >
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            onClick={closeMenu}
          >
            Beranda
          </Link>
          <Link
            to="/track"
            className={buttonVariants({ variant: 'primary', size: 'sm' })}
            onClick={closeMenu}
          >
            Lacak Pesanan
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
