import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { registerInterest } from '@/services/interestService';
import { useUiStore } from '@/store/uiStore';

// ============================================================
// InterestForm — Validation Schema
// ============================================================

const schema = z.object({
  fullName: z
    .string()
    .min(1, 'Nama lengkap wajib diisi')
    .max(100, 'Nama terlalu panjang'),
  whatsapp: z
    .string()
    .regex(/^\d{10,15}$/, 'Nomor WhatsApp harus 10–15 digit angka'),
  email: z
    .string()
    .email('Format email tidak valid'),
});

type InterestFormValues = z.infer<typeof schema>;

// ============================================================
// Props
// ============================================================

interface InterestFormProps {
  concertId: string;
  concertName: string;
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================
// InterestForm Component
// ============================================================

export default function InterestForm({
  concertId,
  concertName,
  isOpen,
  onClose,
}: InterestFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InterestFormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: InterestFormValues) =>
      registerInterest(concertId, data),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['concert', concertId] });
    },
    onError: (error: unknown) => {
      // Try to detect duplicate WA/email from API response
      const axiosError = error as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const apiErrors = axiosError?.response?.data?.errors;
      if (apiErrors?.whatsapp) {
        setError('whatsapp', { message: apiErrors.whatsapp[0] });
      }
      if (apiErrors?.email) {
        setError('email', { message: apiErrors.email[0] });
      }
      if (!apiErrors) {
        addToast({
          type: 'error',
          message: 'Gagal mendaftar minat. Silakan coba lagi.',
        });
      }
    },
  });

  function handleClose() {
    reset();
    setSubmitted(false);
    onClose();
  }

  function onSubmit(data: InterestFormValues) {
    mutation.mutate(data);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Daftarkan Minat"
      size="md"
    >
      {submitted ? (
        <div className="py-6 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Minat Berhasil Didaftarkan!</p>
            <p className="text-sm text-gray-500 mt-1">
              Kami akan menghubungi Anda via WhatsApp jika tiket tersedia untuk{' '}
              <span className="font-medium">{concertName}</span>.
            </p>
          </div>
          <Button variant="primary" onClick={handleClose}>
            Tutup
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <p className="text-sm text-gray-500">
            Daftarkan minat Anda untuk konser{' '}
            <span className="font-medium text-gray-700">{concertName}</span>.
            Kami akan memberi tahu Anda ketika tiket tersedia.
          </p>

          <Input
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Nomor WhatsApp"
            placeholder="08xxxxxxxxxx"
            type="tel"
            error={errors.whatsapp?.message}
            {...register('whatsapp')}
          />

          <Input
            label="Email"
            placeholder="email@contoh.com"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={mutation.isPending}
              disabled={isSubmitting}
            >
              Daftar Minat
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
