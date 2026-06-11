import type { ConcertStatus, OrderStatus } from '../types';

// ============================================================
// Concert Ticket Jastip — Application Constants
// ============================================================

// ------ Concert statuses -------------------------------------

export const CONCERT_STATUSES: ConcertStatus[] = [
  'Akan Datang',
  'Berlangsung',
  'Selesai',
];

/** Statuses shown on the public landing page */
export const ACTIVE_CONCERT_STATUSES: ConcertStatus[] = [
  'Akan Datang',
  'Berlangsung',
];

// ------ Order statuses ---------------------------------------

export const ORDER_STATUSES: OrderStatus[] = [
  'Menunggu Pembayaran',
  'Dibayar',
  'Diproses',
  'Selesai',
  'Dibatalkan',
];

/**
 * Valid forward transitions for each order status.
 * Terminal statuses ('Selesai', 'Dibatalkan') map to an empty array.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  'Menunggu Pembayaran': ['Dibatalkan'],
  Dibayar: ['Diproses', 'Dibatalkan'],
  Diproses: ['Selesai'],
  Selesai: [],
  Dibatalkan: [],
};

/** Statuses that contribute to revenue totals */
export const REVENUE_STATUSES: OrderStatus[] = ['Dibayar', 'Diproses', 'Selesai'];

// ------ File upload limits -----------------------------------

/** Maximum allowed file size for media uploads (5 MB in bytes) */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

/** Accepted MIME types for media uploads */
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

/** Maximum number of media files per concert */
export const MAX_FILES_PER_CONCERT = 20;

// ------ Form limits ------------------------------------------

export const MAX_NOTES_LENGTH = 500;
export const MAX_FULL_NAME_LENGTH = 100;
export const MIN_FULL_NAME_LENGTH = 1;
export const MAX_ORDER_NUMBER_LENGTH = 20;

/** WhatsApp number: exactly 10-15 digits */
export const WHATSAPP_MIN_DIGITS = 10;
export const WHATSAPP_MAX_DIGITS = 15;

// ------ Auth / session ---------------------------------------

/** Number of failed login attempts before the form is locked */
export const MAX_LOGIN_ATTEMPTS = 5;

/** Lockout duration in milliseconds (15 minutes) */
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

// ------ Query / cache ----------------------------------------

/** Stale time for public concert data (30 seconds) */
export const PUBLIC_DATA_STALE_TIME_MS = 30_000;

/** Stale time for CMS data - always fresh */
export const CMS_DATA_STALE_TIME_MS = 0;

// ------ Zustand persistence keys -----------------------------

export const AUTH_STORAGE_KEY = 'auth-storage';

// ------ Status label colours (Tailwind classes) --------------

export const CONCERT_STATUS_CLASSES: Record<ConcertStatus, string> = {
  'Akan Datang': 'bg-blue-100 text-blue-700',
  Berlangsung: 'bg-green-100 text-green-700',
  Selesai: 'bg-gray-100 text-gray-600',
};

export const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  'Menunggu Pembayaran': 'bg-yellow-100 text-yellow-700',
  Dibayar: 'bg-green-100 text-green-700',
  Diproses: 'bg-purple-100 text-purple-700',
  Selesai: 'bg-teal-100 text-teal-700',
  Dibatalkan: 'bg-red-100 text-red-700',
};
