import { Clock, CheckCircle2, PackageCheck, XCircle } from 'lucide-react';
import type { OrderStatusType } from '@/types/database.types';

interface OrderStatusBadgeProps {
  status: OrderStatusType;
  className?: string;
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = {
    new: {
      label: 'Pesanan Baru',
      cls: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
    },
    confirmed: {
      label: 'Dikonfirmasi',
      cls: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: CheckCircle2,
    },
    completed: {
      label: 'Selesai',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: PackageCheck,
    },
    cancelled: {
      label: 'Dibatalkan',
      cls: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
    },
  }[status] || {
    label: status,
    cls: 'bg-slate-50 text-slate-600 border-slate-200',
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.cls} ${className}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}
