import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPaymentToken } from '@/services/orderService';
import Button from '@/components/common/Button';
import ErrorState from '@/components/common/ErrorState';

// ── Window type augmentation ──────────────────────────────────────────────
declare global {
  interface Window {
    snap: {
      pay: (token: string, callbacks: Record<string, () => void>) => void;
    };
  }
}

// ── Snap script loader ────────────────────────────────────────────────────
const loadSnapScript = (clientKey: string, snapUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector('[data-snap-script]')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = snapUrl;
    script.setAttribute('data-client-key', clientKey);
    script.setAttribute('data-snap-script', 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Gagal memuat Snap.js'));
    document.head.appendChild(script);
  });
};

// ── Payment statuses ──────────────────────────────────────────────────────
type PaymentStatus = 'loading' | 'ready' | 'pending' | 'closed' | 'error' | 'token-error' | 'mock';

const isMockToken = (token: string) => token.startsWith('mock-snap-token-');

// ── PaymentPage ───────────────────────────────────────────────────────────
export default function PaymentPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const snapOpened = useRef(false);

  const {
    data,
    isError: isTokenError,
    refetch,
  } = useQuery({
    queryKey: ['payment-token', orderId],
    queryFn: () => getPaymentToken(orderId!),
    enabled: !!orderId,
    retry: false,
  });

  const snapToken = data?.data.data.snapToken;

  const openSnap = (token: string) => {
    window.snap.pay(token, {
      onSuccess: () => navigate(`/payment/${orderId}/success`),
      onPending: () => setStatus('pending'),
      onError: () => setStatus('error'),
      onClose: () => setStatus('closed'),
    });
  };

  useEffect(() => {
    if (isTokenError) {
      setStatus('token-error');
      return;
    }
    if (!snapToken) return;

    setStatus('ready');
    if (snapOpened.current) return;

    // ── Dev mode: mock token → tampilkan simulasi pembayaran ──────────────
    if (import.meta.env.DEV && isMockToken(snapToken)) {
      snapOpened.current = true;
      setStatus('mock');
      return;
    }

    const snapUrl = import.meta.env.VITE_MIDTRANS_SNAP_URL as string;
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY as string;

    loadSnapScript(clientKey, snapUrl)
      .then(() => {
        snapOpened.current = true;
        openSnap(snapToken);
      })
      .catch(() => setStatus('error'));
  }, [snapToken, isTokenError]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Loading / Ready */}
        {(status === 'loading' || status === 'ready') && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="animate-spin w-12 h-12 text-primary-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-gray-600">
              {status === 'loading' ? 'Memuat halaman pembayaran...' : 'Membuka halaman pembayaran...'}
            </p>
            {status === 'ready' && snapToken && (
              <Button variant="primary" onClick={() => openSnap(snapToken)}>
                Buka Pembayaran
              </Button>
            )}
          </div>
        )}

        {/* Pending */}
        {status === 'pending' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Pembayaran Sedang Diproses</h2>
            <p className="text-sm text-gray-500">Selesaikan pembayaran sesuai instruksi yang diberikan.</p>
            <Link to="/track" className="inline-block text-primary-600 hover:underline text-sm font-medium">
              Cek Status Pesanan →
            </Link>
          </div>
        )}

        {/* Closed */}
        {status === 'closed' && snapToken && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Pembayaran Belum Diselesaikan</h2>
            <p className="text-sm text-gray-500">Pesanan Anda masih aktif. Selesaikan pembayaran sebelum waktu habis.</p>
            <Button variant="primary" onClick={() => openSnap(snapToken)}>
              Buka Kembali Pembayaran
            </Button>
          </div>
        )}

        {/* Error */}
        {status === 'error' && snapToken && (
          <div className="space-y-4">
            <ErrorState
              message="Pembayaran gagal. Silakan coba lagi."
              onRetry={() => openSnap(snapToken)}
              retryLabel="Coba Lagi"
            />
          </div>
        )}

        {/* Token Error */}
        {status === 'token-error' && (
          <ErrorState
            message="Gagal memuat halaman pembayaran. Silakan coba lagi."
            onRetry={() => {
              setStatus('loading');
              void refetch();
            }}
            retryLabel="Coba Lagi"
          />
        )}

        {/* Mock / Dev mode payment simulation */}
        {status === 'mock' && (
          <div className="space-y-5">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded mb-2">
                🧪 DEV MODE — Simulasi Pembayaran
              </span>
              <h2 className="text-xl font-semibold text-gray-900">Pilih Hasil Pembayaran</h2>
              <p className="text-sm text-gray-500 mt-1">
                Midtrans tidak tersedia di mode mock. Simulasikan hasil pembayaran untuk melanjutkan testing.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => navigate(`/payment/${orderId}/success`)}
              >
                ✅ Simulasi Pembayaran Berhasil
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => setStatus('pending')}
              >
                ⏳ Simulasi Pembayaran Pending
              </Button>
              <Button
                variant="danger"
                size="md"
                className="w-full"
                onClick={() => setStatus('closed')}
              >
                ✖ Simulasi Tutup Tanpa Bayar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
