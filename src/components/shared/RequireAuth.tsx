import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShieldAlert, LogOut } from 'lucide-react';
import type { RoleType } from '@/types/database.types';

interface RequireAuthProps {
  role?: RoleType;
  children?: React.ReactNode;
}

export function RequireAuth({ role, children }: RequireAuthProps) {
  const { user, profile, isLoading, signOut } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-canvas p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memeriksa hak akses autentikasi...</p>
        </div>
      </div>
    );
  }

  // Not authenticated: redirect to login
  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role restriction check
  if (role && profile.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-canvas p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert size={36} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">Akses Ditolak (403)</h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Akun Anda ({profile.full_name}) terdaftar sebagai peran{' '}
              <strong className="text-slate-800 uppercase">{profile.role}</strong> dan tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={profile.role === 'master_admin' ? '/admin' : '/dashboard'}
              className="w-full h-10 px-4 text-xs font-semibold text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors inline-flex items-center justify-center gap-1.5"
            >
              Kembali ke Dashboard Anda
            </a>
            <button
              onClick={() => signOut()}
              className="w-full h-10 px-4 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For group admin: ensure group is assigned
  if (profile.role === 'group_admin' && !profile.group_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-canvas p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 shadow-sm">
          <ShieldAlert size={36} className="text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Belum Ada Stan yang Ditugaskan</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Akun administrator Anda belum ditugaskan ke kelompok stan tertentu. Silakan hubungi Master Admin untuk menghubungkan akun Anda ke stan kelas.
          </p>
          <button
            onClick={() => signOut()}
            className="h-10 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            Keluar Sesi
          </button>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
