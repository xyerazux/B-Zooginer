import React from 'react';
import { Globe, Store, Shield } from 'lucide-react';
import type { OrderSourceType } from '@/types/database.types';

interface OrderSourceBadgeProps {
  source: OrderSourceType;
  className?: string;
}

export function OrderSourceBadge({ source, className = '' }: OrderSourceBadgeProps) {
  switch (source) {
    case 'public':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
        >
          <Globe size={11} className="text-blue-600" />
          <span>Publik / Web</span>
        </span>
      );
    case 'group_admin':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        >
          <Store size={11} className="text-emerald-600" />
          <span>Admin Stan</span>
        </span>
      );
    case 'master_admin':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        >
          <Shield size={11} className="text-amber-600" />
          <span>Master Admin</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          <span>{source}</span>
        </span>
      );
  }
}
