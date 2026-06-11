import { useEffect } from 'react';
import type { Toast as ToastType } from '@/store/uiStore';
import { useUiStore } from '@/store/uiStore';

// ── Per-type config ──────────────────────────────────────────

const TYPE_STYLES: Record<ToastType['type'], string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

function ToastIcon({ type }: { type: ToastType['type'] }) {
  if (type === 'success') {
    return (
      <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
      </svg>
    );
  }
  if (type === 'error') {
    return (
      <svg className="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  }
  if (type === 'warning') {
    return (
      <svg className="w-4 h-4 text-yellow-500 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 00-1 1v.5a1 1 0 002 0V11a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    );
  }
  // info
  return (
    <svg className="w-4 h-4 text-blue-500 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 000-2v-3a1 1 0 00-1-1h-1z" clipRule="evenodd" />
    </svg>
  );
}

// ── Toast item ───────────────────────────────────────────────

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: number) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const { removeToast } = useUiStore();

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex items-start gap-3 w-80 max-w-xs px-4 py-3 rounded-lg border shadow-md
        transition-all duration-300 ease-in-out
        ${TYPE_STYLES[toast.type]}`}
    >
      <ToastIcon type={toast.type} />
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Tutup notifikasi"
        className="shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
