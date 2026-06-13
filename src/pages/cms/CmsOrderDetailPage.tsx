import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderById, updateOrderStatus } from '@/services/orderService';
import { useUiStore } from '@/store/uiStore';
import { formatCurrency, formatDateTime, formatDate } from '@/utils/formatters';
import { ORDER_STATUS_TRANSITIONS } from '@/utils/constants';
import StatusLabel from '@/components/common/StatusLabel';
import Button from '@/components/common/Button';
import ErrorState from '@/components/common/ErrorState';
import Textarea from '@/components/common/Textarea';
import type { OrderStatus } from '@/types';

export default function CmsOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  const [note, setNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cms-order', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
    staleTime: 0,
  });

  const updateMutation = useMutation({
    mutationFn: () => updateOrderStatus(id!, selectedStatus as OrderStatus, note || undefined),
    onSuccess: () => {
      addToast({ type: 'success', message: 'Status pesanan berhasil diperbarui.' });
      setNote('');
      setSelectedStatus('');
      void qc.invalidateQueries({ queryKey: ['cms-order', id] });
      void qc.invalidateQueries({ queryKey: ['cms-orders'] });
    },
    onError: () => addToast({ type: 'error', message: 'Gagal memperbarui status.' }),
  });

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"/>)}</div>;
  }
  if (isError || !data) {
    return <ErrorState message="Gagal memuat detail pesanan." onRetry={() => void refetch()} />;
  }

  const order = data.data.data;
  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back */}
      <Link to="/cms/orders" className="text-sm text-primary-600 hover:underline">← Kembali ke Daftar Pesanan</Link>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 font-mono">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
        </div>
        <StatusLabel status={order.status} className="text-sm px-3 py-1" />
      </div>

      {/* Concert info */}
      {order.concert && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-2">
          <h2 className="font-semibold text-gray-700 text-sm">Informasi Konser</h2>
          <p className="font-bold text-gray-900">🎵 {order.concert.artistName}</p>
          <p className="text-sm text-gray-500">📅 {formatDateTime(order.concert.date)}</p>
          <p className="text-sm text-gray-500">📍 {order.concert.venueName}, {order.concert.city}</p>
        </div>
      )}

      {/* Customer info */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm">Data Pelanggan</h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-gray-500">Nama</span>
          <span className="font-medium text-gray-800">{order.customerName}</span>
          <span className="text-gray-500">WhatsApp</span>
          <a href={`https://wa.me/${order.customerWhatsapp}`} target="_blank" rel="noopener noreferrer"
            className="font-medium text-green-600 hover:underline">{order.customerWhatsapp}</a>
          <span className="text-gray-500">Email</span>
          <span className="font-medium text-gray-800">{order.customerEmail}</span>
        </div>
      </div>

      {/* Order detail */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm">Detail Pesanan</h2>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-gray-500">Kategori Tiket</span>
          <span className="font-medium text-gray-800">{order.ticketCategory?.name ?? '—'}</span>
          <span className="text-gray-500">Jumlah Tiket</span>
          <span className="font-medium text-gray-800">{order.ticketQty}</span>
          <span className="text-gray-500">Subtotal Tiket</span>
          <span className="font-medium text-gray-800">{formatCurrency(order.subtotalTicket)}</span>
          <span className="text-gray-500">Biaya Jastip</span>
          <span className="font-medium text-gray-800">{formatCurrency(order.totalJastipFee)}</span>
          <span className="text-gray-500 font-semibold">Grand Total</span>
          <span className="font-bold text-primary-600 text-base">{formatCurrency(order.grandTotal)}</span>
        </div>
        {order.notes && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 mt-2">
            <span className="font-medium">Catatan:</span> {order.notes}
          </div>
        )}
      </div>

      {/* Ticket delivery */}
      {order.status === 'Selesai' && (order.ticketUrl || order.pickupInfo) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-2">
          <h2 className="font-semibold text-green-800 text-sm">Info Tiket</h2>
          {order.ticketUrl && (
            <a href={order.ticketUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm text-green-700 underline">🎟️ {order.ticketUrl}</a>
          )}
          {order.pickupInfo && (
            <div className="text-sm text-green-700 space-y-0.5">
              <p>📍 {order.pickupInfo.location}</p>
              <p>📅 {formatDate(order.pickupInfo.date)} • {order.pickupInfo.time}</p>
            </div>
          )}
        </div>
      )}

      {/* Update status */}
      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm">Update Status</h2>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  selectedStatus === s
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {selectedStatus && (
            <>
              <Textarea
                label="Catatan (opsional)"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Tiket sudah dikirim via WhatsApp"
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={updateMutation.isPending}
                  onClick={() => updateMutation.mutate()}
                >
                  Simpan Status
                </Button>
                <Button variant="secondary" size="sm" onClick={() => { setSelectedStatus(''); setNote(''); }}>
                  Batal
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Status history */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm">Riwayat Status</h2>
        <ol className="relative border-l border-gray-200 space-y-4 pl-4">
          {[...order.statusHistory]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((entry, i) => (
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
    </div>
  );
}
