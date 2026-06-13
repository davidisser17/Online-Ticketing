import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '@/services/orderService';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { ORDER_STATUSES } from '@/utils/constants';
import StatusLabel from '@/components/common/StatusLabel';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import type { OrderStatus } from '@/types';

export default function CmsOrderListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cms-orders', statusFilter, search],
    queryFn: () => getAllOrders({
      status: statusFilter || undefined,
      search: search || undefined,
    }),
    staleTime: 0,
  });

  const orders = data?.data.data ?? [];

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-gray-900">Daftar Pesanan</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari nama, no. pesanan, WA..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Semua Status</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* States */}
      {isLoading && (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      )}
      {isError && <ErrorState message="Gagal memuat pesanan." onRetry={() => void refetch()} />}
      {!isLoading && !isError && orders.length === 0 && (
        <EmptyState title="Tidak ada pesanan" message="Tidak ada pesanan yang sesuai filter." />
      )}

      {/* Table */}
      {!isLoading && orders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">No. Pesanan</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Pelanggan</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Konser</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Tgl Pesan</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-gray-700">{order.orderNumber}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="font-medium text-gray-800">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerWhatsapp}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell truncate max-w-[160px]">
                    {order.concert?.artistName ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-700 hidden sm:table-cell">
                    {formatCurrency(order.grandTotal)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusLabel status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/cms/orders/${order.id}`}
                      className="text-sm text-primary-600 hover:underline font-medium"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
