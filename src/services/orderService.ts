// ============================================================
// Concert Ticket Jastip — Order Service (Firestore)
// ============================================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Order, OrderStatus } from '@/types';

const COLLECTION = 'orders';

// ── Helpers ───────────────────────────────────────────────────────────────

function fromFirestore(id: string, data: Record<string, unknown>): Order {
  return {
    ...(data as Omit<Order, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : String(data.createdAt ?? ''),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : String(data.updatedAt ?? ''),
  };
}

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `JT${y}${m}${d}${rand}`;
}

// ── DTOs ──────────────────────────────────────────────────────────────────

export interface CreateOrderDto {
  concertId: string;
  ticketCategoryId: string;
  ticketQty: number;
  customerName: string;
  customerWhatsapp: string;
  customerEmail: string;
  customerNik?: string;
  customerBirthPlace?: string;
  customerBirthDate?: string;
  notes?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  concertId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ── Public ────────────────────────────────────────────────────────────────

export async function createOrder(
  data: CreateOrderDto,
): Promise<{ data: { data: Order } }> {
  // Ambil data konser
  const concertSnap = await getDoc(doc(db, 'concerts', data.concertId));
  if (!concertSnap.exists()) throw new Error('Konser tidak ditemukan');

  const concert = concertSnap.data() as Record<string, unknown> & {
    remainingQuota: number;
    jastipFee: number;
    ticketCategories: Array<{ id: string; name: string; price: number }>;
  };

  if (concert.remainingQuota < data.ticketQty) {
    throw Object.assign(new Error('Kuota tidak mencukupi'), { code: 'QUOTA_EXCEEDED' });
  }

  const category = concert.ticketCategories.find(
    (tc) => tc.id === data.ticketCategoryId,
  );
  if (!category) throw new Error('Kategori tiket tidak ditemukan');

  const subtotal = category.price * data.ticketQty;
  const jastipFee = (concert.jastipFee as number) * data.ticketQty;
  const orderNumber = generateOrderNumber();

  const orderData = {
    orderNumber,
    concertId: data.concertId,
    customerName: data.customerName,
    customerWhatsapp: data.customerWhatsapp,
    customerEmail: data.customerEmail,
    customerNik: data.customerNik ?? null,
    customerBirthPlace: data.customerBirthPlace ?? null,
    customerBirthDate: data.customerBirthDate ?? null,
    ticketCategoryId: data.ticketCategoryId,
    ticketCategory: category,
    ticketQty: data.ticketQty,
    subtotalTicket: subtotal,
    totalJastipFee: jastipFee,
    grandTotal: subtotal + jastipFee,
    status: 'Menunggu Pembayaran' as OrderStatus,
    notes: data.notes ?? null,
    statusHistory: [
      {
        status: 'Menunggu Pembayaran' as OrderStatus,
        timestamp: new Date().toISOString(),
        note: 'Pesanan masuk antrian',
      },
    ],
    ticketUrl: null,
    pickupInfo: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, COLLECTION), orderData);

  // Kurangi remainingQuota dan tambah interestCount di konser
  await updateDoc(doc(db, 'concerts', data.concertId), {
    remainingQuota: concert.remainingQuota - data.ticketQty,
    interestCount: increment(1),
    updatedAt: serverTimestamp(),
  });

  const snap = await getDoc(ref);
  const order = fromFirestore(snap.id, snap.data() as Record<string, unknown>);

  // Attach concert snapshot untuk tampilan
  order.concert = {
    id: data.concertId,
    ...(concertSnap.data() as object),
  } as Order['concert'];

  return { data: { data: order } };
}

export async function getOrderByNumberAndWhatsapp(
  orderNumber: string,
  whatsapp: string,
): Promise<{ data: { data: Order } }> {
  const q = query(
    collection(db, COLLECTION),
    where('orderNumber', '==', orderNumber),
    where('customerWhatsapp', '==', whatsapp),
  );
  const snap = await getDocs(q);

  if (snap.empty) {
    const err = Object.assign(new Error('Pesanan tidak ditemukan'), {
      response: { status: 404 },
    });
    throw err;
  }

  const d = snap.docs[0];
  const order = fromFirestore(d.id, d.data() as Record<string, unknown>);

  // Attach concert data
  if (order.concertId) {
    const concertSnap = await getDoc(doc(db, 'concerts', order.concertId));
    if (concertSnap.exists()) {
      order.concert = { id: concertSnap.id, ...(concertSnap.data() as object) } as Order['concert'];
    }
  }

  return { data: { data: order } };
}

export async function getPaymentToken(
  orderId: string,
): Promise<{ data: { data: { snapToken: string; orderId: string } } }> {
  // Di production ini butuh backend untuk generate Midtrans token.
  // Untuk demo, return mock token yang akan trigger simulasi UI.
  return {
    data: {
      data: {
        snapToken: `mock-snap-token-${orderId}-${Date.now()}`,
        orderId,
      },
    },
  };
}

// ── CMS ───────────────────────────────────────────────────────────────────

export async function getAllOrders(
  filters?: OrderFilters,
): Promise<{ data: { data: Order[] } }> {
  let q;

  if (filters?.status) {
    // where saja tanpa orderBy untuk menghindari kebutuhan composite index
    q = query(
      collection(db, COLLECTION),
      where('status', '==', filters.status),
    );
  } else {
    q = query(collection(db, COLLECTION));
  }

  const snap = await getDocs(q);
  let orders = snap.docs
    .map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>))
    // Sort terbaru dulu di client-side
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Client-side search filter
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.customerWhatsapp.includes(s),
    );
  }

  return { data: { data: orders } };
}

export async function getOrderById(
  id: string,
): Promise<{ data: { data: Order } }> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) throw new Error('Pesanan tidak ditemukan');

  const order = fromFirestore(snap.id, snap.data() as Record<string, unknown>);

  // Attach concert data
  if (order.concertId) {
    const concertSnap = await getDoc(doc(db, 'concerts', order.concertId));
    if (concertSnap.exists()) {
      order.concert = { id: concertSnap.id, ...(concertSnap.data() as object) } as Order['concert'];
    }
  }

  return { data: { data: order } };
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string,
): Promise<{ data: { data: Order } }> {
  const ref = doc(db, COLLECTION, id);
  const historyEntry = {
    status,
    timestamp: new Date().toISOString(),
    note: note ?? null,
  };

  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
    statusHistory: arrayUnion(historyEntry),
  });

  return getOrderById(id);
}
