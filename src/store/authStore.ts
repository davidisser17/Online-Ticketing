// ============================================================
// Concert Ticket Jastip — Auth Store (Firebase-aware)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AdminUser, AuthState } from '../types';
import { AUTH_STORAGE_KEY } from '../utils/constants';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      isExpired: (): boolean => {
        const { token } = get();
        if (!token) return true;
        try {
          const parts = token.split('.');
          if (parts.length !== 3) return true;

          // Decode JWT payload (works for both Firebase ID tokens and mock tokens)
          const payload = JSON.parse(
            atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
          );
          if (typeof payload.exp !== 'number') return true;

          // Tambah 5 menit buffer agar tidak expired tiba-tiba saat request
          return payload.exp * 1000 < Date.now() + 5 * 60 * 1000;
        } catch {
          return true;
        }
      },

      login: (token: string, user: AdminUser): void => {
        set({ token, user });
      },

      logout: (): void => {
        set({ token: null, user: null });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
