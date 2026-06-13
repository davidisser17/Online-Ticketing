import { useQuery } from '@tanstack/react-query';
import { getConcerts } from '@/services/concertService';
import { getAllOrders } from '@/services/orderService';
import { formatCurrency } from '@/utils/formatters';
import { REVENUE_STATUSES } from '@/utils/constants';
import type { Order } from '@/types';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default function CmsDashboard() {
  const { data: concertsData } = useQuery({
    queryKey: ['cms-concerts'],
    queryFn: () => getConcerts(),
  });
  const { data: ordersData } = useQuery({
    queryKey: ['cms-orders'],
    queryFn: () => getAllOrders(),
  });

  const concerts = concertsData?.data.data ?? [];
  const orders: Order[] = ordersData?.data.data ?? [];

  const totalRevenue = orders
    .filter((o) => REVENUE_STATUSES.includes(o.status))
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const pendingOrders = orders.filter((o) => o.status === 'Menunggu Pembayaran').length;
  const paidOrders = orders.filter((o) => o.status === 'Dibayar').length;
  const activeConcerts = concerts.filter((c) => c.status === 'Akan Datang' || c.status === 'Berlangsung').length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Pesanan" value={orders.length} icon="📋" color="bg-blue-50" />
        <StatCard label="Konser Aktif" value={activeConcerts} icon="🎵" color="bg-green-50" />
        <StatCard label="Menunggu Bayar" value={pendingOrders} icon="⏳" color="bg-yellow-50" />
        <StatCard label="Total Pendapatan" value={formatCurrency(totalRevenue)} icon="💰" color="bg-purple-50" />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Pesanan Terbaru</h3>
          <a href="/cms/orders" className="text-sm text-primary-600 hover:underline">Lihat semua →</a>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">Belum ada pesanan.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">{order.customerName}</p>
                  <p className="text-xs text-gray-400 font-mono">{order.orderNumber}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-700">{formatCurrency(order.grandTotal)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'Selesai' ? 'bg-teal-100 text-teal-700'
                    : order.status === 'Dibayar' ? 'bg-green-100 text-green-700'
                    : order.status === 'Diproses' ? 'bg-purple-100 text-purple-700'
                    : order.status === 'Dibatalkan' ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick action info for pending */}
      {paidOrders > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <div>
            <p className="font-semibold text-green-800 text-sm">{paidOrders} pesanan sudah dibayar dan perlu diproses</p>
            <a href="/cms/orders" className="text-xs text-green-700 underline">Kelola pesanan →</a>
          </div>
        </div>
      )}
    </div>
  );
}
