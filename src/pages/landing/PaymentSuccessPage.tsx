import { useParams, Link } from 'react-router-dom';
import { buttonVariants } from '@/components/common/Button';

export default function PaymentSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Green check icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembayaran Berhasil! 🎉</h1>
          <p className="mt-2 text-sm text-gray-500">
            Pesanan Anda sedang diproses. Cek status terbaru di halaman pelacakan.
          </p>
          {orderId && (
            <p className="mt-2 text-xs text-gray-400">
              No. Pesanan: <span className="font-mono font-medium text-gray-600">{orderId}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/track"
            className={buttonVariants({ variant: 'primary', size: 'md' })}
          >
            Lacak Pesanan
          </Link>
          <Link
            to="/"
            className={buttonVariants({ variant: 'secondary', size: 'md' })}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
