import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token, isExpired } = useAuthStore();

  if (!token || isExpired()) {
    return <Navigate to="/cms/login" replace />;
  }

  return <>{children}</>;
}
