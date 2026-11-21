import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white border border-slate-200 rounded-lg ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 bg-primary-800 text-white rounded-md text-sm font-medium hover:bg-primary-700 active:bg-primary-900 transition-colors focus:ring-2 focus:ring-primary-600 focus:outline-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
