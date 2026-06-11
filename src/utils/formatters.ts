// ============================================================
// Concert Ticket Jastip — Formatter Utilities
// ============================================================

/**
 * Format a number as Indonesian Rupiah currency.
 * Example: 1000000 → "Rp 1.000.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format an ISO 8601 string as an Indonesian long date.
 * Example: "2025-03-15T19:00:00" → "Sabtu, 15 Maret 2025"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format an ISO 8601 string as an Indonesian long date with time.
 * Example: "2025-03-15T19:00:00" → "Sabtu, 15 Maret 2025 • 19:00 WIB"
 *
 * Note: WIB (Waktu Indonesia Barat, UTC+7) is appended as a fixed suffix.
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);

  const datePart = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

  const timePart = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return `${datePart} • ${timePart} WIB`;
}

/**
 * Format an ISO 8601 string as a relative time description in Indonesian.
 *
 * Thresholds:
 *  - < 60 seconds  → "baru saja"
 *  - < 60 minutes  → "N menit yang lalu"
 *  - < 24 hours    → "N jam yang lalu"
 *  - ≥ 24 hours    → "N hari yang lalu"
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) {
    return 'baru saja';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} menit yang lalu`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari yang lalu`;
}
