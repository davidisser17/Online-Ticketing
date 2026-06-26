import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LandingLayout from '@/layouts/LandingLayout';
import CmsLayout from '@/layouts/CmsLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// ── Lazy-loaded landing pages ──────────────────────────────────────────────
const LandingPage = React.lazy(() => import('@/pages/landing/LandingPage'));
const ConcertDetailPage = React.lazy(
  () => import('@/pages/landing/ConcertDetailPage'),
);
const OrderFormPage = React.lazy(() => import('@/pages/landing/OrderFormPage'));
const TrackOrderPage = React.lazy(
  () => import('@/pages/landing/TrackOrderPage'),
);

// ── Lazy-loaded CMS pages ──────────────────────────────────────────────────
const CmsLoginPage = React.lazy(() => import('@/pages/cms/CmsLoginPage'));
const CmsDashboard = React.lazy(() => import('@/pages/cms/CmsDashboard'));
const CmsConcertListPage = React.lazy(
  () => import('@/pages/cms/CmsConcertListPage'),
);
const CmsConcertFormPage = React.lazy(
  () => import('@/pages/cms/CmsConcertFormPage'),
);
const CmsOrderListPage = React.lazy(
  () => import('@/pages/cms/CmsOrderListPage'),
);
const CmsOrderDetailPage = React.lazy(
  () => import('@/pages/cms/CmsOrderDetailPage'),
);

// ── Catch-all ──────────────────────────────────────────────────────────────
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));

// ── Suspense wrapper ───────────────────────────────────────────────────────
function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}

// ── Router ─────────────────────────────────────────────────────────────────
// basename diperlukan untuk GitHub Pages deployment di /Online-Ticketing/
const basename = import.meta.env.PROD ? '/Online-Ticketing' : '/';

export const router = createBrowserRouter([
  // ── Landing routes ──────────────────────────────────────────────────────
  {
    element: <LandingLayout />,
    children: [
      {
        path: '/',
        element: (
          <Lazy>
            <LandingPage />
          </Lazy>
        ),
      },
      {
        path: '/concert/:id',
        element: (
          <Lazy>
            <ConcertDetailPage />
          </Lazy>
        ),
      },
      {
        path: '/concert/:id/order',
        element: (
          <Lazy>
            <OrderFormPage />
          </Lazy>
        ),
      },
      {
        path: '/track',
        element: (
          <Lazy>
            <TrackOrderPage />
          </Lazy>
        ),
      },
    ],
  },

  // ── CMS login (public — no layout guard) ────────────────────────────────
  {
    path: '/cms/login',
    element: (
      <Lazy>
        <CmsLoginPage />
      </Lazy>
    ),
  },

  // ── CMS protected routes ────────────────────────────────────────────────
  {
    path: '/cms',
    element: (
      <ProtectedRoute>
        <CmsLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/cms/" replace />,
      },
      {
        path: '',
        element: (
          <Lazy>
            <CmsDashboard />
          </Lazy>
        ),
      },
      {
        path: 'concerts',
        element: (
          <Lazy>
            <CmsConcertListPage />
          </Lazy>
        ),
      },
      {
        path: 'concerts/new',
        element: (
          <Lazy>
            <CmsConcertFormPage />
          </Lazy>
        ),
      },
      {
        path: 'concerts/:id/edit',
        element: (
          <Lazy>
            <CmsConcertFormPage />
          </Lazy>
        ),
      },
      {
        path: 'orders',
        element: (
          <Lazy>
            <CmsOrderListPage />
          </Lazy>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <Lazy>
            <CmsOrderDetailPage />
          </Lazy>
        ),
      },
    ],
  },

  // ── Catch-all ────────────────────────────────────────────────────────────
  {
    path: '*',
    element: (
      <Lazy>
        <NotFoundPage />
      </Lazy>
    ),
  },
], { basename });
