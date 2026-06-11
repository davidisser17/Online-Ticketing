import { CONCERT_STATUS_CLASSES, ORDER_STATUS_CLASSES, CONCERT_STATUSES } from '@/utils/constants';
import type { ConcertStatus, OrderStatus } from '@/types';

interface StatusLabelProps {
  status: ConcertStatus | OrderStatus;
  className?: string;
}

export default function StatusLabel({ status, className = '' }: StatusLabelProps) {
  const isConcertStatus = (CONCERT_STATUSES as string[]).includes(status);
  const colorClasses = isConcertStatus
    ? CONCERT_STATUS_CLASSES[status as ConcertStatus]
    : ORDER_STATUS_CLASSES[status as OrderStatus];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses} ${className}`}
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
}
