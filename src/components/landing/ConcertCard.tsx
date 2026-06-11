import { Link } from 'react-router-dom';
import StatusLabel from '@/components/common/StatusLabel';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import type { Concert } from '@/types';

// ============================================================
// ConcertCard — Landing Page
// ============================================================

interface ConcertCardProps {
  concert: Concert;
}

// ── Icon helpers ──────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

// ── ConcertCard ───────────────────────────────────────────────────────────

export default function ConcertCard({ concert }: ConcertCardProps) {
  const lowestPrice =
    concert.ticketCategories.length > 0
      ? Math.min(...concert.ticketCategories.map((tc) => tc.price))
      : 0;

  const posterUrl = concert.posterUrls?.[0] ?? null;

  return (
    <Link
      to={`/concert/${concert.id}`}
      className="block rounded-xl overflow-hidden shadow-md border border-gray-100 bg-white hover:shadow-lg transition-shadow cursor-pointer"
      aria-label={`Lihat detail konser ${concert.artistName}`}
    >
      {/* Image area */}
      <div className="relative h-48">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`Poster konser ${concert.artistName}`}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-4xl" aria-hidden="true">🎵</span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <StatusLabel status={concert.status} />
        </div>
      </div>

      {/* Content area */}
      <div className="p-4 space-y-2">
        {/* Artist name */}
        <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-1">
          {concert.artistName}
        </h3>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <CalendarIcon />
          <span className="line-clamp-1">{formatDateTime(concert.date)}</span>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPinIcon />
          <span className="line-clamp-1">
            {concert.venueName}, {concert.city}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-2 space-y-1">
          {/* Price */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Mulai dari</span>
            <span className="font-semibold text-primary-600">
              {formatCurrency(lowestPrice)}
            </span>
          </div>

          {/* Jastip fee */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Biaya Jastip</span>
            <span className="font-medium text-gray-700">
              {formatCurrency(concert.jastipFee)}
            </span>
          </div>
        </div>

        {/* Interest count */}
        <div className="flex items-center gap-1.5 text-sm text-gray-400 pt-0.5">
          <UsersIcon />
          <span>{concert.interestCount} peminat</span>
        </div>
      </div>
    </Link>
  );
}
