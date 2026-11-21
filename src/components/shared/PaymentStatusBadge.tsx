import { BadgeCheck, AlertCircle } from 'lucide-react';
import type { PaymentStatusType } from '@/types/database.types';

interface PaymentStatusBadgeProps {
  status: PaymentStatusType;
  className?: string;
}

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  if (status === 'paid') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 ${className}`}
      >
        <BadgeCheck size={12} strokeWidth={2.5} />
        Lunas
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 ${className}`}
    >
      <AlertCircle size={12} strokeWidth={2.5} />
      Belum Bayar
    </span>
  );
}
