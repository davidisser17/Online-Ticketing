import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { getOrderByNumberAndWhatsapp } from '@/services/orderService';
import { formatCurrency, formatDateTime, formatDate } from '@/utils/formatters';
import { useUiStore } from '@/store/uiStore';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import StatusLabel from '@/components/common/StatusLabel';
import type { Order } from '@/types';

// ── Schema ────────────────────────────────────────────────────────────────
const trackSchema = z.object({
  orderNumber: z.string().min(1, 'Nomor pesanan wajib diisi').max(20),
  whatsapp: z.string().regex(/^[0-9]{10,15}$/, 'WhatsApp harus 10–15 digit'),
});
type TrackFormValues = z.infer<typeof trackSchema>;

// ── OrderStatusTimeline ───────────────────────────────────────────────────
function OrderStatusTimeline({ history }: { history: Order['statusHistory'] }) {
  const sorted = [...history]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Riwayat Status</h3>
      <ol className="relative border-l border-gray-200 space-y-4 pl-4">
        {sorted.map((entry, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[18px] w-3 h-3 rounded-full bg-primary-500 border-2 border-white ring-1 ring-primary-300" />
            <div className="space-y-0.5">
              <StatusLabel status={entry.status} />
              <p className="text-xs text-gray-400">{formatDateTime(entry.timestamp)}</p>
              {entry.note && <p className="text-xs text-gray-500 italic">{entry.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── TicketDeliveryInfo ────────────────────────────────────────────────────
function TicketDeliveryInfo({ order }: { order: Order }) {
  if (order.status !== 'Selesai') return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
      <h3 className="text-sm font-semibold text-green-800">Informasi Tiket</h3>
      {order.ticketUrl && (
        <a
          href={order.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-900 underline"
        >
          🎟️ Unduh Tiket Digital
        </a>
      )}
      {order.pickupInfo && (
        <div className="text-sm text-green-700 space-y-1">
          <p>📍 <span className="font-medium">Lokasi Pengambilan:</span> {order.pickupInfo.location}</p>
          <p>📅 <span className="font-medium">Tanggal:</span> {formatDate(order.pickupInfo.date)}</p>
          <p>🕐 <span className="font-medium">Jam:</span> {order.pickupInfo.time}</p>
        </div>
      )}
    </div>
  );
}

// ── OrderResultCard ───────────────────────────────────────────────────────
function OrderResultCard({ order }: { order: Order }) {
  return (
    <div className="space-y-5">
      {/* Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Detail Pesanan</h2>
        <StatusLabel status={order.status} className="text-sm px-3 py-1" />
      </div>

      {/* Concert & order info */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-lg font-bold text-gray-900">
            🎵 {order.concert?.artistName ?? 'Konser'}
          </p>
          {order.concert?.date && (
            <p className="text-sm text-gray-500">
              📅 {formatDateTime(order.concert.date)}
            </p>
          )}
          {order.concert?.venueName && (
            <p className="text-sm text-gray-500">
              📍 {order.concert.venueName}
            </p>
          )}
        </div>
        <hr className="border-gray-100" />
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-gray-500">Kategori Tiket</span>
          <span className="font-medium text-gray-800 text-right">
            {order.ticketCategory?.name ?? '—'}
          </span>
          <span className="text-gray-500">Jumlah Tiket</span>
          <span className="font-medium text-gray-800 text-right">{order.ticketQty}</span>
          <span className="text-gray-500">Total Biaya</span>
          <span className="font-semibold text-primary-600 text-right">
            {formatCurrency(order.grandTotal)}
          </span>
          <span className="text-gray-500">No. Pesanan</span>
          <span className="font-mono text-xs text-gray-700 text-right">{order.orderNumber}</span>
        </div>
      </div>

      {/* Ticket delivery info */}
      <TicketDeliveryInfo order={order} />

      {/* Status timeline */}
      {order.statusHistory.length > 0 && (
        <OrderStatusTimeline history={order.statusHistory} />
      )}
    </div>
  );
}

// ── TrackOrderPage ────────────────────────────────────────────────────────
export default function TrackOrderPage() {
  const addToast = useUiStore((s) => s.addToast);
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackFormValues>({ resolver: zodResolver(trackSchema) });

  const mutation = useMutation({
    mutationFn: ({ orderNumber, whatsapp }: TrackFormValues) =>
      getOrderByNumberAndWhatsapp(orderNumber, whatsapp),
    onSuccess: (res) => {
      setOrder(res.data.data);
      setNotFound(false);
    },
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setNotFound(true);
        setOrder(null);
      } else {
        addToast({ type: 'error', message: 'Gagal mencari pesanan. Coba lagi.' });
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lacak Pesanan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Masukkan nomor pesanan dan nomor WhatsApp untuk melihat status pesanan Anda.
          </p>
        </div>

        {/* Search form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
            noValidate
            className="space-y-4"
          >
            <Input
              label="Nomor Pesanan"
              placeholder="Contoh: JT202506001"
              maxLength={20}
              error={errors.orderNumber?.message}
              {...register('orderNumber')}
            />
            <Input
              label="Nomor WhatsApp"
              type="tel"
              placeholder="08xxxxxxxxxx"
              error={errors.whatsapp?.message}
              {...register('whatsapp')}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={mutation.isPending}
            >
              Cek Pesanan
            </Button>
          </form>

          {/* Not found state */}
          {notFound && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              Pesanan tidak dapat ditemukan. Periksa kembali nomor pesanan dan nomor WhatsApp Anda.
            </div>
          )}
        </div>

        {/* Results */}
        {order && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <OrderResultCard order={order} />
          </div>
        )}
      </div>
    </div>
  );
}
