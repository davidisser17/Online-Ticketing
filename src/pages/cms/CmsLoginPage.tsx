import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function CmsLoginPage() {
  const navigate = useNavigate();
  const { token, isExpired, login: storeLogin } = useAuthStore();
  const addToast = useUiStore((s) => s.addToast);

  // Redirect jika sudah login
  useEffect(() => {
    if (token && !isExpired()) navigate('/cms', { replace: true });
  }, [token, isExpired, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (res) => {
      const { token, user } = res.data.data;
      storeLogin(token, user);
      navigate('/cms', { replace: true });
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        addToast({ type: 'error', message: 'Username atau password salah.' });
      } else {
        addToast({ type: 'error', message: 'Gagal login. Coba lagi.' });
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / heading */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-4">
            <span className="text-2xl">🎟️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">JastipTiket CMS</h1>
          <p className="mt-1 text-sm text-gray-500">Masuk untuk mengelola konser & pesanan</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
            noValidate
            className="space-y-5"
          >
            <Input
              label="Username"
              placeholder="admin"
              autoComplete="username"
              error={errors.username?.message}
              {...register('username')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={mutation.isPending}
            >
              Masuk
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} JastipTiket. All rights reserved.
        </p>
      </div>
    </div>
  );
}
