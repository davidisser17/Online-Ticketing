// ============================================================
// Concert Ticket Jastip — MSW Browser Handlers
// ============================================================

import { http, HttpResponse, delay } from 'msw';
import {
  MOCK_CONCERTS,
  MOCK_ORDERS,
  MOCK_INTERESTS,
  MOCK_ADMIN,
} from './data';
import type { Order, OrderStatus } from '@/types';

const BASE = 'http://localhost:3000/api';

// state yang bisa berubah selama sesi mock
let concerts = [...MOCK_CONCERTS];
let orders: Order[] = [...MOCK_ORDERS];
let interests = [...MOCK_INTERESTS];

export const handlers = [
  // ── Auth ────────────────────────────────────────────────────────────────

  http.post(`${BASE}/cms/auth/login`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as { username: string; password: string };
    if (body.username === MOCK_ADMIN.username && body.password === MOCK_ADMIN.password) {
      return HttpResponse.json({
        success: true,
        data: { token: MOCK_ADMIN.token, user: MOCK_ADMIN.user },
        message: 'Login berhasil',
      });
    }
    return HttpResponse.json(
      { success: false, message: 'Username atau password salah' },
      { status: 401 },
    );
  }),

  http.post(`${BASE}/cms/auth/logout`, async () => {
    await delay(200);
    return HttpResponse.json({ success: true, message: 'Logout berhasil' });
  }),

  // ── Concerts (public) ───────────────────────────────────────────────────

  http.get(`${BASE}/concerts`, async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const statusFilter = url.searchParams.getAll('status[]');
    let result = concerts;
    if (statusFilter.length > 0) {
      result = concerts.filter((c) => statusFilter.includes(c.status));
    }
    return HttpResponse.json({ success: true, data: result });
  }),

  http.get(`${BASE}/concerts/:id`, async ({ params }) => {
    await delay(400);
    const concert = concerts.find((c) => c.id === params.id);
    if (!concert) {
      return HttpResponse.json(
        { success: false, message: 'Konser tidak ditemukan' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: concert });
  }),

  // ── Interest ────────────────────────────────────────────────────────────

  http.post(`${BASE}/concerts/:id/interests`, async ({ params, request }) => {
    await delay(500);
    const body = (await request.json()) as {
      fullName: string;
      whatsapp: string;
      email: string;
    };

    const existing = interests.find(
      (i) => i.concertId === params.id &&
        (i.whatsapp === body.whatsapp || i.email === body.email),
    );
    if (existing) {
      return HttpResponse.json(
        {
          success: false,
          message: 'WhatsApp atau email sudah terdaftar untuk konser ini',
          errors: {
            whatsapp: existing.whatsapp === body.whatsapp ? ['Nomor sudah terdaftar'] : [],
            email: existing.email === body.email ? ['Email sudah terdaftar'] : [],
          },
        },
        { status: 409 },
      );
    }

    const newInterest = {
      id: `int-${Date.now()}`,
      concertId: params.id as string,
      ...body,
      createdAt: new Date().toISOString(),
    };
    interests.push(newInterest);

    // naikkan interestCount di concert
    concerts = concerts.map((c) =>
      c.id === params.id ? { ...c, interestCount: c.interestCount + 1 } : c,
    );

    return HttpResponse.json({ success: true, data: newInterest }, { status: 201 });
  }),

  // ── Orders (public) ─────────────────────────────────────────────────────

  http.post(`${BASE}/orders`, async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as {
      concertId: string;
      ticketCategoryId: string;
      ticketQty: number;
      customerName: string;
      customerWhatsapp: string;
      customerEmail: string;
      notes?: string;
    };

    const concert = concerts.find((c) => c.id === body.concertId);
    if (!concert) {
      return HttpResponse.json(
        { success: false, message: 'Konser tidak ditemukan' },
        { status: 404 },
      );
    }
    if (concert.remainingQuota < body.ticketQty) {
      return HttpResponse.json(
        { success: false, message: 'Kuota tidak mencukupi' },
        { status: 422 },
      );
    }

    const category = concert.ticketCategories.find(
      (tc) => tc.id === body.ticketCategoryId,
    );
    if (!category) {
      return HttpResponse.json(
        { success: false, message: 'Kategori tiket tidak ditemukan' },
        { status: 404 },
      );
    }

    const subtotal = category.price * body.ticketQty;
    const jastipFee = concert.jastipFee * body.ticketQty;
    const orderId = `order-${Date.now()}`;
    const orderNumber = `JT${Date.now().toString().slice(-9)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      concertId: body.concertId,
      concert,
      customerName: body.customerName,
      customerWhatsapp: body.customerWhatsapp,
      customerEmail: body.customerEmail,
      ticketCategoryId: body.ticketCategoryId,
      ticketCategory: category,
      ticketQty: body.ticketQty,
      subtotalTicket: subtotal,
      totalJastipFee: jastipFee,
      grandTotal: subtotal + jastipFee,
      status: 'Menunggu Pembayaran',
      notes: body.notes,
      statusHistory: [
        {
          status: 'Menunggu Pembayaran',
          timestamp: new Date().toISOString(),
          note: 'Pesanan dibuat',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(newOrder);

    // kurangi remainingQuota
    concerts = concerts.map((c) =>
      c.id === body.concertId
        ? { ...c, remainingQuota: c.remainingQuota - body.ticketQty }
        : c,
    );

    return HttpResponse.json({ success: true, data: newOrder }, { status: 201 });
  }),

  http.get(`${BASE}/orders/track`, async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const orderNumber = url.searchParams.get('orderNumber');
    const whatsapp = url.searchParams.get('whatsapp');

    const order = orders.find(
      (o) => o.orderNumber === orderNumber && o.customerWhatsapp === whatsapp,
    );
    if (!order) {
      return HttpResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: order });
  }),

  http.post(`${BASE}/orders/:id/payment-token`, async ({ params }) => {
    await delay(600);
    const order = orders.find((o) => o.id === params.id);
    if (!order) {
      return HttpResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan' },
        { status: 404 },
      );
    }
    // Simulate Midtrans snap token
    return HttpResponse.json({
      success: true,
      data: {
        snapToken: `mock-snap-token-${params.id}-${Date.now()}`,
        orderId: params.id,
      },
    });
  }),

  // ── CMS — Orders ────────────────────────────────────────────────────────

  http.get(`${BASE}/cms/orders`, async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as OrderStatus | null;
    const search = url.searchParams.get('search')?.toLowerCase();

    let result = [...orders];
    if (status) result = result.filter((o) => o.status === status);
    if (search) {
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(search) ||
          o.customerName.toLowerCase().includes(search) ||
          o.customerWhatsapp.includes(search),
      );
    }

    // sort terbaru dulu
    result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return HttpResponse.json({ success: true, data: result });
  }),

  http.get(`${BASE}/cms/orders/:id`, async ({ params }) => {
    await delay(400);
    const order = orders.find((o) => o.id === params.id);
    if (!order) {
      return HttpResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: order });
  }),

  http.patch(`${BASE}/cms/orders/:id/status`, async ({ params, request }) => {
    await delay(500);
    const body = (await request.json()) as { status: OrderStatus; note?: string };
    const idx = orders.findIndex((o) => o.id === params.id);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: 'Pesanan tidak ditemukan' },
        { status: 404 },
      );
    }

    const updated: Order = {
      ...orders[idx],
      status: body.status,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...orders[idx].statusHistory,
        {
          status: body.status,
          timestamp: new Date().toISOString(),
          note: body.note,
        },
      ],
    };
    orders[idx] = updated;
    return HttpResponse.json({ success: true, data: updated });
  }),

  // ── CMS — Concerts ──────────────────────────────────────────────────────

  http.get(`${BASE}/cms/concerts`, async () => {
    await delay(400);
    return HttpResponse.json({ success: true, data: concerts });
  }),

  http.post(`${BASE}/cms/concerts`, async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as Partial<typeof MOCK_CONCERTS[0]>;
    const newConcert = {
      ...body,
      id: `concert-${Date.now()}`,
      interestCount: 0,
      remainingQuota: body.quota ?? 0,
      status: 'Akan Datang' as const,
      posterUrls: body.posterUrls ?? [],
      ticketCategories: body.ticketCategories ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as typeof MOCK_CONCERTS[0];
    concerts.push(newConcert);
    return HttpResponse.json({ success: true, data: newConcert }, { status: 201 });
  }),

  http.put(`${BASE}/cms/concerts/:id`, async ({ params, request }) => {
    await delay(600);
    const body = (await request.json()) as Partial<typeof MOCK_CONCERTS[0]>;
    const idx = concerts.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: 'Konser tidak ditemukan' },
        { status: 404 },
      );
    }
    concerts[idx] = { ...concerts[idx], ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: concerts[idx] });
  }),

  http.delete(`${BASE}/cms/concerts/:id`, async ({ params }) => {
    await delay(500);
    const idx = concerts.findIndex((c) => c.id === params.id);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: 'Konser tidak ditemukan' },
        { status: 404 },
      );
    }
    concerts.splice(idx, 1);
    return HttpResponse.json({ success: true, message: 'Konser dihapus' });
  }),
];
