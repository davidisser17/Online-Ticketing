import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UiState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: number) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  toasts: [],

  addToast: (toast: Omit<Toast, 'id'>): void => {
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Date.now() }],
    }));
  },

  removeToast: (id: number): void => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
