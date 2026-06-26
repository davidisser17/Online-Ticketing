// ============================================================
// Concert Ticket Jastip — TypeScript Interfaces
// ============================================================

// ------ Concert -----------------------------------------------

export type ConcertStatus = 'Akan Datang' | 'Berlangsung' | 'Selesai';

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
}

export interface Concert {
  id: string;
  artistName: string;
  description?: string;
  /** ISO 8601 datetime string */
  date: string;
  venueName: string;
  venueAddress: string;
  city: string;
  jastipFee: number;
  quota: number;
  remainingQuota: number;
  maxTicketsPerOrder: number;
  status: ConcertStatus;
  ticketCategories: TicketCategory[];
  posterUrls: string[];
  interestCount: number;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

// ------ Order -------------------------------------------------

export type OrderStatus =
  | 'Menunggu Pembayaran'
  | 'Dibayar'
  | 'Diproses'
  | 'Selesai'
  | 'Dibatalkan';

export interface StatusHistoryEntry {
  status: OrderStatus;
  /** ISO 8601 datetime string */
  timestamp: string;
  note?: string;
}

export interface PickupInfo {
  location: string;
  /** ISO 8601 date string */
  date: string;
  time: string;
}

export interface Order {
  id: string;
  /** Unique alphanumeric order number shown to customers */
  orderNumber: string;
  concertId: string;
  concert?: Concert;
  customerName: string;
  customerWhatsapp: string;
  customerEmail: string;
  customerNik?: string;
  customerBirthPlace?: string;
  customerBirthDate?: string;
  ticketCategoryId: string;
  ticketCategory?: TicketCategory;
  ticketQty: number;
  subtotalTicket: number;
  totalJastipFee: number;
  grandTotal: number;
  status: OrderStatus;
  notes?: string;
  statusHistory: StatusHistoryEntry[];
  ticketUrl?: string;
  pickupInfo?: PickupInfo;
  createdAt: string;
  updatedAt: string;
}

// ------ Interest ----------------------------------------------

export interface Interest {
  id: string;
  concertId: string;
  fullName: string;
  whatsapp: string;
  email: string;
  createdAt: string;
}

// ------ Auth --------------------------------------------------

export interface AdminUser {
  id: string;
  username: string;
}

export interface AuthState {
  token: string | null;
  user: AdminUser | null;
  isExpired: () => boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

// ------ API Envelope ------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ------ Payment -----------------------------------------------

export interface PaymentToken {
  snapToken: string;
  orderId: string;
}
