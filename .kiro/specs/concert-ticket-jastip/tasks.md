# Implementation Plan: Concert Ticket Jastip — Frontend Landing Page

## Overview

Rencana implementasi frontend landing page untuk platform Concert Ticket Jastip menggunakan React JS + Tailwind CSS. Fokus pada halaman publik: daftar konser, detail konser, form minat, form pesanan, pembayaran Midtrans, dan pelacakan pesanan.

## Tasks

- [x] 1. Setup Project dan Konfigurasi Awal
  - [x] 1.1 Inisialisasi project Vite + React + TypeScript
    - Jalankan `npm create vite@latest . -- --template react-ts` untuk membuat project
    - Install dependencies utama: `react-router-dom@6`, `axios`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`
    - Install dependencies dev: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `msw`, `jsdom`, `fast-check`
    - Install Tailwind CSS: `tailwindcss`, `postcss`, `autoprefixer`
    - Konfigurasi `tailwind.config.js`, `postcss.config.js`, dan direktif Tailwind ke `src/index.css`
    - Konfigurasi `vite.config.ts` dengan alias path `@/` ke `src/`
    - _Persyaratan: 1.1, 2.1, 4.1_

  - [x] 1.2 Setup struktur folder, types, constants, env, dan testing
    - Pastikan struktur folder lengkap: `src/assets`, `src/components/common`, `src/components/landing`, `src/components/cms`, `src/hooks`, `src/layouts`, `src/pages/landing`, `src/pages/cms`, `src/services`, `src/store`, `src/utils`, `src/router`, `src/types`
    - Verifikasi `src/types/index.ts` (sudah ada)
    - Verifikasi `src/utils/constants.ts` (sudah ada)
    - Verifikasi `.env.example` (sudah ada)
    - Verifikasi `vitest.config.ts` dan `src/test/setup.ts` (sudah ada)
    - _Persyaratan: 1.1, 4.1, 9.1_

- [x] 2. Implementasi Utilities, Validators, dan State Management
  - [x] 2.1 Implementasi fungsi utilitas formatter
    - Buat `src/utils/formatters.ts` dengan `formatCurrency`, `formatDate`, `formatDateTime`, `formatRelativeTime`
    - _Persyaratan: 1.3, 2.2, 4.3_

  - [x] 2.2 Implementasi fungsi validasi dan kalkulasi
    - Buat `src/utils/validators.ts` dengan `validateWhatsApp`, `validateEmail`, `validateTicketQty`, `validateMediaFile`, `calculateOrderTotal`, `getValidTransitions`, `filterConcertsByStatus`
    - _Persyaratan: 3.3, 3.4, 4.2, 4.3, 4.5, 8.5, 8.7, 10.2_

  - [ ]* 2.3 Tulis property-based tests untuk semua validators (Properties 1–4, 6–8)
    - Buat `src/utils/__tests__/validators.property.test.ts`
    - Property 1: kalkulasi harga konsisten (100 iterasi)
    - Property 2: validasi WhatsApp (100 iterasi)
    - Property 3: validasi email (100 iterasi)
    - Property 4: transisi status pesanan valid (100 iterasi)
    - Property 6: batasan jumlah tiket (100 iterasi)
    - Property 7: filter konser aktif (100 iterasi)
    - Property 8: validasi file media (100 iterasi)
    - _Persyaratan: 3.3, 3.4, 4.2, 4.3, 4.5, 8.5, 8.7, 10.2_

  - [x] 2.4 Implementasi Zustand stores
    - Buat `src/store/authStore.ts` dengan token, user, isExpired(), login(), logout(), persist ke localStorage
    - Buat `src/store/uiStore.ts` dengan toasts[], addToast(), removeToast()
    - _Persyaratan: 9.2, 9.7, 9.8_

  - [x] 2.5 Implementasi Axios instance dan service layer
    - Buat `src/services/api.ts`: Axios instance, request interceptor (JWT), response interceptor (401/403/500/network)
    - Buat `src/services/concertService.ts`, `src/services/orderService.ts`, `src/services/interestService.ts`, `src/services/authService.ts`, `src/services/mediaService.ts`
    - _Persyaratan: 1.2, 9.2, 9.6, 9.8_

- [x] 3. Implementasi Design System (Common Components)
  - [x] 3.1 Buat komponen Button
    - `src/components/common/Button.tsx`: variants (primary/secondary/danger/ghost), sizes (sm/md/lg), states (default/disabled/loading)
    - _Persyaratan: 1.7, 2.4, 3.1, 4.1_

  - [x] 3.2 Buat komponen Input, Textarea, Select
    - `src/components/common/Input.tsx`, `Textarea.tsx`, `Select.tsx` dengan label, error message, integrasi React Hook Form
    - _Persyaratan: 3.1, 3.3, 3.4, 4.2_

  - [x] 3.3 Buat komponen Modal
    - `src/components/common/Modal.tsx`: overlay, ESC close, focus trap, scroll lock, accessibility attrs
    - _Persyaratan: 3.1, 7.8_

  - [x] 3.4 Buat komponen StatusLabel, SkeletonCard, Toast, EmptyState, ErrorState
    - `StatusLabel.tsx`, `SkeletonCard.tsx`, `Toast.tsx` + `ToastContainer.tsx`, `EmptyState.tsx`, `ErrorState.tsx`
    - _Persyaratan: 1.5, 1.6, 1.7, 1.8_

- [x] 4. Implementasi Router dan Layout
  - [x] 4.1 Setup React Router dan layouts
    - Buat `src/router/index.tsx` dengan semua route landing dan CMS
    - `ProtectedRoute`: cek token + isExpired(), redirect ke /cms/login
    - `src/layouts/LandingLayout.tsx`, `src/layouts/CmsLayout.tsx`
    - `src/App.tsx` dengan QueryClientProvider + RouterProvider + ToastContainer
    - `src/main.tsx`
    - _Persyaratan: 9.5, 9.8_

  - [x] 4.2 Buat Navbar dan Footer Landing Page
    - `src/components/landing/Navbar.tsx`: logo, nav links, link "Lacak Pesanan"
    - `src/components/landing/Footer.tsx`
    - _Persyaratan: 1.1, 6.1_

- [x] 5. Implementasi Landing Page — Daftar Konser
  - [x] 5.1 Buat ConcertCard
    - `src/components/landing/ConcertCard.tsx`: poster, artis, tanggal, venue, harga terendah, biaya jastip, peminat, StatusLabel, clickable ke /concert/:id
    - _Persyaratan: 1.3, 1.6_

  - [x] 5.2 Buat LandingPage
    - `src/pages/landing/LandingPage.tsx`: HeroSection + ConcertListSection
    - Query concerts dengan status aktif, staleTime 30s
    - Loading: 6 SkeletonCard, Success: ConcertCard grid + counter, Empty: EmptyState, Error: ErrorState + retry
    - _Persyaratan: 1.1, 1.2, 1.4, 1.5, 1.7, 1.8_

  - [ ]* 5.3 Tulis property-based test serialisasi data konser (Property 5)
    - `src/components/landing/__tests__/concert.property.test.ts`
    - Test round-trip JSON serialization untuk Concert objects (100 iterasi)
    - _Persyaratan: 1.3, 2.2_

  - [ ]* 5.4 Tulis unit tests untuk ConcertCard dan LandingPage
    - _Persyaratan: 1.1, 1.5, 1.6, 1.7, 1.8_

- [x] 6. Implementasi Landing Page — Detail Konser dan Form Minat
  - [x] 6.1 Buat ConcertDetailPage
    - `src/pages/landing/ConcertDetailPage.tsx`: hero, info, peta, kategori tiket, jastip info
    - Logika disable tombol: status Selesai atau kuota habis
    - Error state dengan retry
    - _Persyaratan: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 6.2 Buat InterestForm (modal)
    - `src/components/landing/InterestForm.tsx`: React Hook Form + Zod, validasi WA/email
    - Sukses: pesan konfirmasi + invalidate query peminat
    - Error: duplikat WA/email inline, network error toast
    - _Persyaratan: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [ ]* 6.3 Tulis unit tests untuk InterestForm
    - _Persyaratan: 3.3, 3.4, 3.5, 3.7_

- [x] 7. Implementasi Landing Page — Form Pesanan dan Pembayaran
  - [x] 7.1 Buat OrderFormPage dengan PriceSummary
    - `src/pages/landing/OrderFormPage.tsx` + `src/components/landing/PriceSummary.tsx`
    - React Hook Form + Zod, kalkulasi harga real-time, validasi kuota
    - Sukses: navigate ke /payment/:orderId
    - _Persyaratan: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 7.2 Tulis unit tests untuk OrderFormPage dan PriceSummary
    - _Persyaratan: 4.2, 4.3, 4.5, 4.6_

  - [x] 7.3 Buat PaymentPage dengan integrasi Midtrans Snap
    - `src/pages/landing/PaymentPage.tsx`: load Snap.js dinamis, open snap.pay(), handle semua callbacks
    - `src/pages/landing/PaymentSuccessPage.tsx`
    - _Persyaratan: 5.1, 5.2, 5.5, 5.9_

- [x] 8. Implementasi Landing Page — Pelacakan Pesanan
  - [x] 8.1 Buat TrackOrderPage
    - `src/pages/landing/TrackOrderPage.tsx`: form pencarian + tampilan hasil
    - OrderStatusBadge, OrderDetailCard, OrderStatusTimeline, TicketDeliveryInfo
    - _Persyaratan: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 8.2 Tulis unit tests untuk TrackOrderPage
    - _Persyaratan: 6.2, 6.3, 6.4_

- [~] 9. Checkpoint Akhir — Build dan verifikasi
  - Jalankan `npm run build` dan pastikan tidak ada error TypeScript
  - Jalankan `npm run test` dan pastikan semua tests lulus
  - Verifikasi semua halaman landing dapat diakses di browser

## Notes

- Task bertanda `*` adalah property-based / unit tests (opsional untuk MVP cepat)
- Workspace root: `/Users/entrustinv095/Documents/Online Ticketing `
- File yang sudah ada: `src/types/index.ts`, `src/utils/constants.ts`, `.env.example`, `vitest.config.ts`, `src/test/setup.ts`, struktur folder dasar
- Fokus pada Landing Page (Persyaratan 1–6)
