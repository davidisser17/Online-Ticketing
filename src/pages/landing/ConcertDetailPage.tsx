import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StatusLabel from '@/components/common/StatusLabel';
import Button from '@/components/common/Button';
import ErrorState from '@/components/common/ErrorState';
import InterestForm from '@/components/landing/InterestForm';
import { getConcertById } from '@/services/concertService';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { PUBLIC_DATA_STALE_TIME_MS } from '@/utils/constants';
import type { Concert } from '@/types';

// ============================================================
// Icon helpers
// ============================================================

function CalendarIcon() {
  return (
    <svg
      className="w-5 h-5 shrink-0 text-primary-500"
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

function BuildingIcon() {
  return (
    <svg
      className="w-5 h-5 shrink-0 text-primary-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      className="w-5 h-5 shrink-0 text-primary-500"
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
      className="w-5 h-5 shrink-0 text-primary-500"
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

// ============================================================
// Loading Skeleton
// ============================================================

function ConcertDetailSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Memuat data konser">
      {/* Hero skeleton */}
      <div className="w-full h-72 bg-gray-200 rounded-none" />

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-5 bg-gray-200 rounded w-20" />
        </div>

        {/* Info card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-full" />
        </div>

        {/* Map skeleton */}
        <div className="h-48 bg-gray-200 rounded-xl" />

        {/* Table skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>

        {/* Jastip card skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-gray-200 rounded-lg" />
            <div className="h-16 bg-gray-200 rounded-lg" />
            <div className="h-16 bg-gray-200 rounded-lg" />
            <div className="h-16 bg-gray-200 rounded-lg" />
          </div>
        </div>

        {/* Button skeleton */}
        <div className="flex gap-3">
          <div className="h-12 bg-gray-200 rounded-lg flex-1" />
          <div className="h-12 bg-gray-200 rounded-lg flex-1" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ConcertDetailHero
// ============================================================

interface HeroProps {
  concert: Concert;
}

function ConcertDetailHero({ concert }: HeroProps) {
  const posterUrl = concert.posterUrls?.[0] ?? null;

  return (
    <div className="relative w-full max-h-72 overflow-hidden bg-gray-900">
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={`Poster konser ${concert.artistName}`}
          className="w-full max-h-72 object-cover"
        />
      ) : (
        <div className="w-full h-72 bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center">
          <span className="text-7xl" aria-hidden="true">🎵</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Artist name + status overlay */}
      <div className="absolute bottom-0 left-0 p-4 space-y-2">
        <h1 className="text-3xl font-bold text-white drop-shadow-md leading-tight">
          {concert.artistName}
        </h1>
        <StatusLabel status={concert.status} />
      </div>
    </div>
  );
}

// ============================================================
// ConcertInfoSection
// ============================================================

interface InfoSectionProps {
  concert: Concert;
}

function ConcertInfoSection({ concert }: InfoSectionProps) {
  const mapsQuery = encodeURIComponent(concert.venueAddress);
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapsQuery}&output=embed`;

  return (
    <div className="space-y-4">
      {/* Info card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Informasi Konser</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {/* Date/time */}
          <div className="flex items-start gap-3">
            <CalendarIcon />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Tanggal &amp; Waktu
              </p>
              <p className="text-sm text-gray-700 mt-0.5">
                {formatDateTime(concert.date)}
              </p>
            </div>
          </div>

          {/* Venue name */}
          <div className="flex items-start gap-3">
            <BuildingIcon />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Venue
              </p>
              <p className="text-sm text-gray-700 mt-0.5">{concert.venueName}</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3 md:col-span-2">
            <MapPinIcon />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                Alamat
              </p>
              <p className="text-sm text-gray-700 mt-0.5">{concert.venueAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps embed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <iframe
          title={`Peta lokasi ${concert.venueName}`}
          src={mapsEmbedUrl}
          width="100%"
          className="h-48 rounded-lg border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          aria-label={`Peta lokasi ${concert.venueName}`}
        />
      </div>
    </div>
  );
}

// ============================================================
// TicketCategoryTable
// ============================================================

interface TicketTableProps {
  ticketCategories: Concert['ticketCategories'];
}

function TicketCategoryTable({ ticketCategories }: TicketTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">Kategori Tiket</h2>
      </div>

      {ticketCategories.length === 0 ? (
        <p className="px-5 py-6 text-sm text-gray-400 text-center">
          Belum ada kategori tiket
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Kategori Tiket</th>
              <th className="px-5 py-3 text-right font-medium">Harga</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ticketCategories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-800 font-medium">{cat.name}</td>
                <td className="px-5 py-3 text-right text-primary-600 font-semibold">
                  {formatCurrency(cat.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ============================================================
// JastipInfoSection
// ============================================================

interface JastipInfoProps {
  concert: Concert;
}

function JastipInfoSection({ concert }: JastipInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      <h2 className="text-base font-semibold text-gray-800">Informasi Jastip</h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Jastip fee */}
        <div className="bg-primary-50 rounded-lg p-3">
          <p className="text-xs text-primary-500 font-medium">Biaya Jastip</p>
          <p className="text-sm font-bold text-primary-700 mt-1">
            {formatCurrency(concert.jastipFee)}
            <span className="text-xs font-normal text-primary-500 ml-1">/ tiket</span>
          </p>
        </div>

        {/* Quota */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 font-medium">Kuota Tersisa</p>
          <p className="text-sm font-bold text-gray-800 mt-1">
            {concert.remainingQuota}
            <span className="text-xs font-normal text-gray-500 ml-1">
              / {concert.quota}
            </span>
          </p>
        </div>

        {/* Max tickets */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 font-medium">Maks Tiket per Pesanan</p>
          <p className="text-sm font-bold text-gray-800 mt-1">
            {concert.maxTicketsPerOrder} tiket
          </p>
        </div>

        {/* Interest count */}
        <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
          <UsersIcon />
          <div>
            <p className="text-xs text-gray-500 font-medium">Peminat</p>
            <p className="text-sm font-bold text-gray-800">
              {concert.interestCount} peminat
            </p>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      {concert.terms && (
        <details className="border border-gray-200 rounded-lg overflow-hidden">
          <summary className="px-4 py-3 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 select-none list-none flex items-center justify-between">
            <span>Syarat &amp; Ketentuan</span>
            <svg
              className="w-4 h-4 text-gray-400 transition-transform details-chevron"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="px-4 py-3 text-sm text-gray-600 border-t border-gray-200 whitespace-pre-line bg-gray-50">
            {concert.terms}
          </div>
        </details>
      )}
    </div>
  );
}

// ============================================================
// Action Buttons
// ============================================================

interface ActionButtonsProps {
  concert: Concert;
  onInterestClick: () => void;
}

function ActionButtons({ concert, onInterestClick }: ActionButtonsProps) {
  const navigate = useNavigate();

  const isFinished = concert.status === 'Selesai';
  const isQuotaFull = concert.remainingQuota === 0;
  const isOrderDisabled = isFinished || isQuotaFull;
  const isInterestDisabled = isFinished;

  return (
    <div className="bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] md:shadow-none md:border-none md:bg-transparent">
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {/* Status badges */}
        {(isFinished || isQuotaFull) && (
          <div className="flex flex-wrap gap-2">
            {isFinished && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                Konser Telah Selesai
              </span>
            )}
            {!isFinished && isQuotaFull && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600">
                Kuota Penuh
              </span>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="lg"
            disabled={isOrderDisabled}
            className="flex-1"
            onClick={() => navigate(`/concert/${concert.id}/order`)}
            aria-label="Pesan jastip tiket konser ini"
          >
            Pesan Jastip
          </Button>
          <Button
            variant="secondary"
            size="lg"
            disabled={isInterestDisabled}
            className="flex-1"
            onClick={onInterestClick}
            aria-label="Daftarkan minat untuk konser ini"
          >
            Daftarkan Minat
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ConcertDetailPage
// ============================================================

export default function ConcertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showInterestModal, setShowInterestModal] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['concert', id],
    queryFn: () => getConcertById(id!),
    staleTime: PUBLIC_DATA_STALE_TIME_MS,
    enabled: !!id,
  });

  const concert: Concert | undefined = data?.data.data;

  // ── Loading ───────────────────────────────────────────────

  if (isLoading) {
    return <ConcertDetailSkeleton />;
  }

  // ── Error ─────────────────────────────────────────────────

  if (isError || !concert) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <ErrorState
          message="Gagal memuat data konser."
          onRetry={refetch}
        />
      </div>
    );
  }

  // ── Main content ──────────────────────────────────────────

  return (
    <div className="pb-32 md:pb-0">
      {/* Hero */}
      <ConcertDetailHero concert={concert} />

      {/* Body content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Description */}
        {concert.description && (
          <section>
            <h2 className="text-base font-semibold text-gray-800 mb-2">
              Tentang Konser
            </h2>
            <div className="prose prose-sm text-gray-600 max-w-none leading-relaxed whitespace-pre-line">
              {concert.description}
            </div>
          </section>
        )}

        {/* Concert info + map */}
        <ConcertInfoSection concert={concert} />

        {/* Ticket categories */}
        <TicketCategoryTable ticketCategories={concert.ticketCategories} />

        {/* Jastip info */}
        <JastipInfoSection concert={concert} />

        {/* Action buttons — normal flow on desktop */}
        <div className="hidden md:block">
          <ActionButtons
            concert={concert}
            onInterestClick={() => setShowInterestModal(true)}
          />
        </div>
      </div>

      {/* Action buttons — sticky bottom on mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-30">
        <ActionButtons
          concert={concert}
          onInterestClick={() => setShowInterestModal(true)}
        />
      </div>

      {/* InterestForm modal */}
      <InterestForm
        concertId={concert.id}
        concertName={concert.artistName}
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
      />
    </div>
  );
}
