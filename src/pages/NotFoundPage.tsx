import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-8xl font-bold text-primary-600">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">
        Halaman Tidak Ditemukan
      </h2>
      <p className="mt-2 text-gray-500">
        Maaf, halaman yang kamu cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
