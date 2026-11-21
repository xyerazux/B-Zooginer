import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'accent' | 'emerald' | 'rose';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'primary',
  className = '',
}: StatCardProps) {
  const iconStyles = {
    primary: 'bg-primary-50 text-primary-800 border-primary-100',
    accent: 'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  }[variant];

  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg p-5 shadow-2xs hover:border-slate-300 transition-colors flex items-start justify-between gap-4 ${className}`}
    >
      <div className="space-y-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </p>
        <p className="text-2xl font-extrabold text-slate-900 tabular-nums truncate">{value}</p>
        {subtext && <p className="text-xs text-slate-500 leading-tight pt-0.5">{subtext}</p>}
      </div>

      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${iconStyles}`}
      >
        <Icon size={20} strokeWidth={2} />
      </div>
    </div>
  );
}
