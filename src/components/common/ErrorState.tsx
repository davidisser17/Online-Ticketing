interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorState({
  message = 'Terjadi kesalahan. Silakan coba lagi.',
  onRetry,
  retryLabel = 'Coba Lagi',
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4">
        <svg
          className="w-12 h-12 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-600 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
            border border-red-300 text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2
            focus:ring-red-400 focus:ring-offset-2 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
