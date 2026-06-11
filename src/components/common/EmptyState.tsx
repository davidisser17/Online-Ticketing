import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

function DefaultIcon() {
  return (
    <svg
      className="w-12 h-12 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );
}

export default function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4">{icon ?? <DefaultIcon />}</div>
      {title && (
        <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      )}
      <p className="text-sm text-gray-500 max-w-xs">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
            bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2
            focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
