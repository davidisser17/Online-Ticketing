import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getConcertById } from '@/services/concertService';
import { createOrder } from '@/services/orderService';
import { validateEmail } from '@/utils/validators';
import { formatDateTime } from '@/utils/formatters';
import { useUiStore } from '@/store/uiStore';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';
import Button from '@/components/common/Button';
import ErrorState from '@/components/common/ErrorState';
import PriceSummary from '@/components/landing/PriceSummary';

// ============================================================
// Zod Schema
// ============================================================

const orderSchema = z.object({
  customerName: z.string().min(1, 'Nama wajib diisi').max(100),
  customerWhatsapp: z
    .string()
    .regex(/^[0-9]{10,15}$/, 'WhatsApp harus 10–15 digit'),
  customerEmail: z
    .string()
    .refine(validateEmail, 'Format email tidak valid'),
  ticketCategoryId: z.string().min(1, 'Pilih kategori tiket'),
  ticketQty: z.number().int().min(1),
  notes: z.string().max(500).optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

// ============================================================
// Skeleton for loading state
// ============================================================

function OrderFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </div>
      {/* Two-column layout skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-9 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
        <div>
          <div className="rounded-xl border border-gray-100 p-5 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <hr className="border-gray-200" />
            <div className="h-6 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// OrderFormPage
// ============================================================

export default function OrderFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useUiStore((s) => s.addToast);

  // ------ Data fetching -----------------------------------------------

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

  // ------ Form -----------------------------------------------------------

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      ticketQty: 1,
      ticketCategoryId: '',
    },
  });

  // ------ Live price watch -----------------------------------------------

  const ticketCategoryId = watch('ticketCategoryId');
  const ticketQty = watch('ticketQty') ?? 1;
  const selectedCategory = concert?.ticketCategories.find(
    (c) => c.id === ticketCategoryId,
  );
  const ticketPrice = selectedCategory?.price ?? 0;
  const jastipFee = concert?.jastipFee ?? 0;

  // ------ Submit mutation ------------------------------------------------

  const mutation = useMutation({
    mutationFn: (data: OrderFormValues) =>
      createOrder({ ...data, concertId: id! }),
    onSuccess: (res) => {
      const orderId = res.data.data.id;
      navigate(`/payment/${orderId}`);
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: { data?: { message?: string; data?: { remainingQuota?: number } } };
      };
      const msg = axiosError?.response?.data?.message ?? '';
      if (msg.includes('kuota')) {
        const remaining =
          axiosError?.response?.data?.data?.remainingQuota ?? '?';
        setError('ticketQty', {
          message: `Kuota tidak mencukupi. Tersisa ${remaining} kuota`,
        });
      } else {
        addToast({
          type: 'error',
          message: 'Gagal membuat pesanan. Silakan coba lagi.',
        });
      }
    },
  });

  function onSubmit(data: OrderFormValues) {
    mutation.mutate(data);
  }

  // ------ Render ---------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* ---- Loading ---- */}
        {isLoading && <OrderFormSkeleton />}

        {/* ---- Error ---- */}
        {isError && (
          <ErrorState
            message="Gagal memuat data konser. Silakan coba lagi."
            onRetry={() => refetch()}
          />
        )}

        {/* ---- Content ---- */}
        {concert && (
          <>
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-sm text-gray-500"
            >
              <Link to="/" className="hover:text-primary-600 transition-colors">
                Beranda
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                to={`/concerts/${concert.id}`}
                className="hover:text-primary-600 transition-colors"
              >
                {concert.artistName}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-gray-700 font-medium">Pesan Jastip</span>
            </nav>

            {/* Page header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pesan Jastip — {concert.artistName}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {formatDateTime(concert.date)}
              </p>
              <p className="text-sm text-gray-500">
                {concert.venueName}, {concert.city}
              </p>
            </div>

            {/* Two-column layout */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
            >
              {/* ---- Left: form fields ---- */}
              <div className="space-y-5">
                <Input
                  label="Nama Lengkap"
                  placeholder="Masukkan nama lengkap"
                  autoComplete="name"
                  error={errors.customerName?.message}
                  {...register('customerName')}
                />

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
                  max={Math.min(
                    concert.maxTicketsPerOrder,
                    concert.remainingQuota,
                  )}
                  error={errors.ticketQty?.message}
                  {...register('ticketQty', { valueAsNumber: true })}
                />

                <Textarea
                  label="Catatan"
                  placeholder="Tuliskan catatan tambahan (opsional)"
                  rows={3}
                  maxLength={500}
                  helperText="Opsional. Maks 500 karakter"
                  error={errors.notes?.message}
                  {...register('notes')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={mutation.isPending}
                  disabled={isSubmitting}
                >
                  Lanjut ke Pembayaran
                </Button>
              </div>

              {/* ---- Right: sticky price summary ---- */}
              <div className="md:sticky md:top-20">
                <PriceSummary
                  ticketPrice={ticketPrice}
                  jastipFee={jastipFee}
                  qty={ticketQty > 0 ? ticketQty : 1}
                />

                {/* Extra info */}
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
