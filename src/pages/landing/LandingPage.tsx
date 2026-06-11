import { useQuery } from '@tanstack/react-query';
import { getConcerts } from '@/services/concertService';
import { PUBLIC_DATA_STALE_TIME_MS } from '@/utils/constants';
import ConcertCard from '@/components/landing/ConcertCard';
import SkeletonCard from '@/components/common/SkeletonCard';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import type { Concert } from '@/types';

// ============================================================
// LandingPage
// ============================================================

// ── MicIcon for empty state ───────────────────────────────────────────────

function MicIcon() {
  return (
    <svg
      className="w-12 h-12 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M9 11V7a3 3 0 016 0v4a3 3 0 01-6 0z"
      />
    </svg>
  );
}

// ── HeroSection ───────────────────────────────────────────────────────────

function HeroSection() {
  const scrollToConcerts = () => {
    const section = document.getElementById('concerts');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-primary-600 to-primary-900 text-white py-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Jastip Tiket Konser Favoritmu
        </h1>
        <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
          Pesan tiket konser dengan mudah. Kami carikan, kamu nikmati.
        </p>
        <Button
          variant="secondary"
          size="lg"
          onClick={scrollToConcerts}
          className="bg-white text-primary-700 border-white hover:bg-primary-50 focus:ring-white"
        >
          Lihat Konser
        </Button>
      </div>
    </section>
  );
}

// ── ConcertListSection ────────────────────────────────────────────────────

function ConcertListSection() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['concerts', 'active'],
    queryFn: () => getConcerts({ status: ['Akan Datang', 'Berlangsung'] }),
    staleTime: PUBLIC_DATA_STALE_TIME_MS,
  });

  // The service returns AxiosResponse<ApiResponse<Concert[]>>
  // so the concerts live at data.data.data
  const concerts: Concert[] = data?.data.data ?? [];

  return (
    <section id="concerts" className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Konser Tersedia</h2>
          {!isLoading && !isError && (
            <p className="text-sm text-gray-500 mt-1">
              Menampilkan {concerts.length} konser
            </p>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <ErrorState
            message="Gagal memuat data konser. Silakan muat ulang halaman."
            onRetry={refetch}
            retryLabel="Muat Ulang"
          />
        )}

        {/* Empty state */}
        {!isLoading && !isError && concerts.length === 0 && (
          <EmptyState
            message="Belum ada konser tersedia saat ini"
            icon={<MicIcon />}
          />
        )}

        {/* Data state */}
        {!isLoading && !isError && concerts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {concerts.map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── LandingPage ───────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <ConcertListSection />
    </main>
  );
}
