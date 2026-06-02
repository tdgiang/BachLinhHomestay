import { cn } from '@/lib/utils';
import type { BookingStatus, PaymentStatus } from '@/types';

const BOOKING_LABELS: Record<BookingStatus, string> = {
  pending:    'Chờ xác nhận',
  confirmed:  'Đã xác nhận',
  checked_in: 'Đang ở',
  completed:  'Hoàn thành',
  cancelled:  'Đã hủy',
};

const BOOKING_COLORS: Record<BookingStatus, string> = {
  pending:    'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-100 text-blue-700 border-blue-200',
  checked_in: 'bg-green-100 text-green-700 border-green-200',
  completed:  'bg-gray-100 text-gray-600 border-gray-200',
  cancelled:  'bg-red-100 text-red-600 border-red-200',
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending:  'Chưa TT',
  paid:     'Đã TT',
  failed:   'Thất bại',
  refunded: 'Hoàn tiền',
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  pending:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  paid:     'bg-green-100 text-green-700 border-green-200',
  failed:   'bg-red-100 text-red-600 border-red-200',
  refunded: 'bg-purple-100 text-purple-700 border-purple-200',
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', BOOKING_COLORS[status])}>
      {BOOKING_LABELS[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', PAYMENT_COLORS[status])}>
      {PAYMENT_LABELS[status]}
    </span>
  );
}
