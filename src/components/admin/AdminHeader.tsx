import { useState } from 'react';
import { Menu, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
}

export function AdminHeader({ onOpenMobileMenu }: AdminHeaderProps) {
  const { profile, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      toast.success('Berhasil keluar dari sesi administrator.');
    } catch (err: any) {
      toast.error('Gagal keluar sesi.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isMasterAdmin = profile?.role === 'master_admin';

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
          aria-label="Buka Menu Sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Portal Administrasi</span>
          <span>/</span>
          <span className="font-bold text-slate-800">
            {isMasterAdmin ? 'Master Admin Platform' : `Stan: ${profile?.group?.name || 'Kelompok'}`}
          </span>
        </div>
      </div>

      {/* Right: User Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* Role Pill */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
            isMasterAdmin
              ? 'bg-primary-50 text-primary-800 border border-primary-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <ShieldCheck size={12} />
          <span>{isMasterAdmin ? 'Master Admin' : 'Admin Stan'}</span>
        </span>

        {/* User Profile Info */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
            <User size={14} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">
              {profile?.full_name || 'Administrator'}
            </p>
            <p className="text-[10px] text-slate-400 leading-none mt-1">Sesi Aktif</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="h-9 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-md transition-colors flex items-center gap-1.5 ml-1"
          title="Keluar dari sesi"
        >
          <LogOut size={13} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
