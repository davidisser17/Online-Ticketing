import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { logout as logoutApi } from '@/services/authService';

const navItems = [
  { to: '/cms', label: 'Dashboard', icon: '📊', end: true },
  { to: '/cms/concerts', label: 'Konser', icon: '🎵', end: false },
  { to: '/cms/orders', label: 'Pesanan', icon: '📋', end: false },
];

export default function CmsSidebar() {
  const { user, logout } = useAuthStore();
  const addToast = useUiStore((s) => s.addToast);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await logoutApi(); } catch { /* ignore */ }
    logout();
    navigate('/cms/login', { replace: true });
    addToast({ type: 'info', message: 'Berhasil logout.' });
  };

  return (
    <nav className="w-64 bg-gray-900 text-white h-full flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-lg font-bold tracking-tight">🎟️ JastipTiket</span>
        <p className="text-xs text-gray-400 mt-0.5">CMS Admin Panel</p>
      </div>

      {/* Nav links */}
      <ul className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* User + logout */}
      <div className="px-4 py-4 border-t border-gray-700 space-y-2">
        <p className="text-xs text-gray-400 truncate px-1">
          Masuk sebagai <span className="font-semibold text-gray-200">{user?.username}</span>
        </p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </nav>
  );
}
