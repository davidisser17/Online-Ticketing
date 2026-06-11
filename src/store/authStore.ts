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
          // JWT is three base64url segments separated by dots
          const parts = token.split('.');
          if (parts.length !== 3) return true;

          // Decode the payload (second segment)
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (typeof payload.exp !== 'number') return true;

          return payload.exp * 1000 < Date.now();
        } catch {
          // Malformed token — treat as expired
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
      // Only persist token and user; actions are re-created on hydration
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
