import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-11 px-6 text-base gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-primary-800 text-white hover:bg-primary-700 active:bg-primary-900 focus:ring-primary-600 shadow-sm',
    accent:
      'bg-accent-500 text-slate-950 font-semibold hover:bg-accent-600 active:bg-accent-700 focus:ring-accent-500 shadow-sm',
    outline:
      'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-400',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-400',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 shadow-sm',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin shrink-0" />}
      {children}
    </button>
  );
}
