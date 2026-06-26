import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getConcertById } from '@/services/concertService';
import { createOrder } from '@/services/orderService';
import { validateEmail } from '@/utils/validators';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useUiStore } from '@/store/uiStore';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import Button from '@/components/common/Button';
import ErrorState from '@/components/common/ErrorState';
import PriceSummary from '@/components/landing/PriceSummary';
import type { Order } from '@/types';

// ── Schema ────────────────────────────────────────────────────────────────

const orderSchema = z.object({
  customerName: z.string().min(1, 'Nama wajib diisi').max(100),
  customerWhatsapp: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'WhatsApp harus 10–15 digit'),
  customerEmail: z
    .string()
    .refine(validateEmail, 'Format email tidak valid'),
  customerNik: z
    .string()
    .regex(/^[0-9]{16}$/, 'NIK harus 16 digit angka'),
  customerBirthPlace: z.string().min(1, 'Tempat lahir wajib diisi').max(100),
  customerBirthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  ticketCategoryId: z.string().min(1, 'Pilih kategori tiket'),
  ticketQty: z.number().int().min(1),
  notes: z.string().max(500).optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

// ── OrderSuccessView ──────────────────────────────────────────────────────

function OrderSuccessView({ order }: { order: Order }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 text-center">

        {/* Icon sukses */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Judul */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Masuk Antrian!</h1>
          <p className="mt-2 text-gray-500">
            Pesanan Anda telah berhasil diterima dan sedang menunggu konfirmasi admin.
          </p>
        </div>

        {/* Info pesanan */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">No. Pesanan</span>
            <span className="font-mono font-semibold text-gray-800">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Konser</span>
            <span className="font-medium text-gray-800 text-right max-w-[180px]">
              {order.concert?.artistName ?? '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Kategori</span>
            <span className="font-medium text-gray-800">{order.ticketCategory?.name ?? '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Jumlah Tiket</span>
            <span className="font-medium text-gray-800">{order.ticketQty}</span>
          </div>
          <hr className="border-gray-100" />
          <div className="flex justify-between text-sm font-semibold">
            <span className="text-gray-700">Estimasi Total</span>
            <span className="text-primary-600">{formatCurrency(order.grandTotal)}</span>
          </div>
        </div>

        {/* Info menunggu admin */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left space-y-1.5">
          <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
            <span>📱</span> Tunggu Konfirmasi Admin
          </p>
          <p className="text-sm text-amber-700">
            Admin kami akan segera menghubungi Anda melalui <strong>WhatsApp {order.customerWhatsapp}</strong> untuk konfirmasi pembayaran dan detail pesanan.
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Simpan nomor pesanan Anda: <strong className="font-mono">{order.orderNumber}</strong>
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => navigate('/')}
          >
            🏠 Kembali ke Beranda
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="w-full text-gray-500"
            onClick={() => navigate('/track')}
          >
            Lacak Pesanan
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function OrderFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-7 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-9 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-100 p-5 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <hr className="border-gray-200" />
          <div className="h-6 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

// ── OrderFormPage ─────────────────────────────────────────────────────────

export default function OrderFormPage() {
  const { id } = useParams<{ id: string }>();
  const addToast = useUiStore((s) => s.addToast);

  const {
    data: concertData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['concert', id],
    queryFn: () => getConcertById(id!),
    enabled: !!id,
  });

  const concert = concertData?.data.data;

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { ticketQty: 1, ticketCategoryId: '' },
  });

  const ticketCategoryId = watch('ticketCategoryId');
  const ticketQty = watch('ticketQty') ?? 1;
  const selectedCategory = concert?.ticketCategories.find((c) => c.id === ticketCategoryId);
  const ticketPrice = selectedCategory?.price ?? 0;
  const jastipFee = concert?.jastipFee ?? 0;

  const mutation = useMutation({
    mutationFn: (data: OrderFormValues) => createOrder({ ...data, concertId: id! }),
    onError: (error: unknown) => {
      const msg = (error as { message?: string })?.message ?? '';
      if (msg.includes('Kuota')) {
        setError('ticketQty', { message: 'Kuota tidak mencukupi' });
      } else {
        addToast({ type: 'error', message: 'Gagal membuat pesanan. Silakan coba lagi.' });
      }
    },
  });

  // Tampilkan halaman sukses setelah order berhasil
  if (mutation.isSuccess && mutation.data?.data.data) {
    return <OrderSuccessView order={mutation.data.data.data} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {isLoading && <OrderFormSkeleton />}

        {isError && (
          <ErrorState
            message="Gagal memuat data konser. Silakan coba lagi."
            onRetry={() => refetch()}
          />
        )}

        {concert && (
          <>
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500">
              <Link to="/" className="hover:text-primary-600 transition-colors">Beranda</Link>
              <span>/</span>
              <Link to={`/concert/${concert.id}`} className="hover:text-primary-600 transition-colors">
                {concert.artistName}
              </Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">Pesan Jastip</span>
            </nav>

            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pesan Jastip — {concert.artistName}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{formatDateTime(concert.date)}</p>
              <p className="text-sm text-gray-500">{concert.venueName}, {concert.city}</p>
            </div>

            <form
              onSubmit={handleSubmit((v) => mutation.mutate(v))}
              noValidate
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
            >
              {/* Kiri: form fields */}
              <div className="space-y-5">

                {/* Data Diri */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Data Diri Pemesan
                  </p>
                  <div className="space-y-4">
                    <Input
                      label="Nama Lengkap"
                      placeholder="Sesuai KTP"
                      autoComplete="name"
                      error={errors.customerName?.message}
                      {...register('customerName')}
                    />
                    <Input
                      label="NIK (Nomor Induk Kependudukan)"
                      placeholder="16 digit angka"
                      maxLength={16}
                      inputMode="numeric"
                      error={errors.customerNik?.message}
                      {...register('customerNik')}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Tempat Lahir"
                        placeholder="Contoh: Jakarta"
                        error={errors.customerBirthPlace?.message}
                        {...register('customerBirthPlace')}
                      />
                      <Input
                        label="Tanggal Lahir"
                        type="date"
                        error={errors.customerBirthDate?.message}
                        {...register('customerBirthDate')}
                      />
                    </div>
                    <Input
                      label="Nomor WhatsApp"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      autoComplete="tel"
                      error={errors.customerWhatsapp?.message}
                      {...register('customerWhatsapp')}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="email@contoh.com"
                      autoComplete="email"
                      error={errors.customerEmail?.message}
                      {...register('customerEmail')}
                    />
                  </div>
                </div>

                {/* Detail Tiket */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Detail Tiket
                  </p>
                  <div className="space-y-4">
                    <Select
                      label="Kategori Tiket"
                      placeholder="— Pilih kategori —"
                      options={concert.ticketCategories.map((cat) => ({
                        value: cat.id,
                        label: `${cat.name} — Rp ${cat.price.toLocaleString('id-ID')}`,
                      }))}
                      error={errors.ticketCategoryId?.message}
                      {...register('ticketCategoryId')}
                    />
                    <Input
                      label="Jumlah Tiket"
                      type="number"
                      min={1}
                      max={Math.min(concert.maxTicketsPerOrder, concert.remainingQuota)}
                      error={errors.ticketQty?.message}
                      {...register('ticketQty', { valueAsNumber: true })}
                    />
                    <Textarea
                      label="Catatan (opsional)"
                      placeholder="Tuliskan catatan tambahan"
                      rows={3}
                      maxLength={500}
                      helperText="Maks 500 karakter"
                      error={errors.notes?.message}
                      {...register('notes')}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={mutation.isPending}
                  disabled={isSubmitting}
                >
                  Masuk Antrian
                </Button>

                {/* Info flow baru */}
                <p className="text-xs text-center text-gray-400">
                  Setelah submit, admin akan menghubungi Anda via WhatsApp untuk konfirmasi pembayaran.
                </p>
              </div>

              {/* Kanan: price summary */}
              <div className="md:sticky md:top-20">
                <PriceSummary
                  ticketPrice={ticketPrice}
                  jastipFee={jastipFee}
                  qty={ticketQty > 0 ? ticketQty : 1}
                />
                {concert.remainingQuota <= 10 && concert.remainingQuota > 0 && (
                  <p className="mt-3 text-xs text-amber-600 font-medium text-center">
                    ⚠️ Sisa {concert.remainingQuota} kuota tersedia
                  </p>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
