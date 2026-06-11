// ============================================================
// Concert Ticket Jastip — Axios instance
// ============================================================

import axios from 'axios';
import type { AxiosError } from 'axios';

const AUTH_STORAGE_KEY = 'auth-storage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// ── Request interceptor: attach JWT token ─────────────────────
apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed: { state?: { token?: string } } = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // If parsing fails, proceed without token
  }
  return config;
});

// ── Response interceptor: handle common HTTP errors ──────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        window.location.href = '/cms/login';
      } else if (status === 403) {
        console.warn('[API] Forbidden:', error);
      } else if (status === 500) {
        console.warn('[API] Server error:', error);
      }
    } else {
      // Network error (no response received)
      console.warn('[API] Network error:', error);
    }

    // Always re-throw so callers can handle it
    return Promise.reject(error);
  },
);

export default apiClient;
