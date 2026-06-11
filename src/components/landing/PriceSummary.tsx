import { calculateOrderTotal } from '@/utils/validators';
import { formatCurrency } from '@/utils/formatters';

// ============================================================
// PriceSummary — Live order price breakdown card
// ============================================================

interface PriceSummaryProps {
  ticketPrice: number;
  jastipFee: number;
  qty: number;
}

export default function PriceSummary({
  ticketPrice,
  jastipFee,
  qty,
}: PriceSummaryProps) {
  const { subtotal, jastipTotal, grandTotal } = calculateOrderTotal(
    ticketPrice,
    jastipFee,
    qty,
  );

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Ringkasan Harga
      </h3>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Subtotal Tiket</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Biaya Jastip</span>
        <span>{formatCurrency(jastipTotal)}</span>
      </div>

      <hr className="border-gray-200" />

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          Total Pembayaran
        </span>
        <span className="text-xl font-bold text-primary-600">
          {formatCurrency(grandTotal)}
        </span>
      </div>
    </div>
  );
}
