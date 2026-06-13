import { useLocation } from 'react-router-dom';

const titleMap: Record<string, string> = {
  '/cms': 'Dashboard',
  '/cms/concerts': 'Kelola Konser',
  '/cms/concerts/new': 'Tambah Konser',
  '/cms/orders': 'Kelola Pesanan',
};

function getTitle(pathname: string): string {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.includes('/concerts/') && pathname.includes('/edit')) return 'Edit Konser';
  if (pathname.includes('/orders/')) return 'Detail Pesanan';
  return 'CMS';
}

export default function CmsTopbar() {
  const { pathname } = useLocation();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h2 className="text-base font-semibold text-gray-800">{getTitle(pathname)}</h2>
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary-600 hover:underline"
      >
        ↗ Lihat Landing Page
      </a>
    </header>
  );
}
