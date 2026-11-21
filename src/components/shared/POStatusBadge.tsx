import { CheckCircle2, Clock, Ban } from 'lucide-react';
import type { PoStatusType } from '@/types/database.types';

interface POStatusBadgeProps {
  status: PoStatusType;
  className?: string;
}

export function POStatusBadge({ status, className = '' }: POStatusBadgeProps) {
  const config = {
    open: {
      label: 'PO Dibuka',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      icon: CheckCircle2,
    },
    coming_soon: {
      label: 'Segera Hadir',
      cls: 'bg-amber-50 text-amber-800 border-amber-300',
      icon: Clock,
    },
    closed: {
      label: 'PO Ditutup',
      cls: 'bg-slate-100 text-slate-600 border-slate-300',
      icon: Ban,
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
