import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingBag,
  History,
  Utensils,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { profile } = useAuth();
  const location = useLocation();

  const isMasterAdmin = profile?.role === 'master_admin';

  const masterAdminNav = [
    { label: 'Ringkasan Platform', path: '/admin', icon: LayoutDashboard },
    { label: 'Kelola Stan Kelompok', path: '/admin/groups', icon: Store },
    { label: 'Kelola Akun Admin', path: '/admin/admins', icon: Users },
    { label: 'Semua Pesanan', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Log Aktivitas', path: '/admin/logs', icon: History },
  ];

  const groupAdminNav = [
    { label: 'Ringkasan Stan', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Produk Menu Stan', path: '/dashboard/products', icon: Utensils },
    { label: 'Pesanan Masuk Stan', path: '/dashboard/orders', icon: ShoppingBag },
  ];

  const navItems = isMasterAdmin ? masterAdminNav : groupAdminNav;

  const isActive = (path: string) => {
    if (path === '/admin' || path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-primary-800 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
            B
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base leading-none">
              B-Zooginer
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider mt-0.5">
              {isMasterAdmin ? 'Master Admin' : 'Admin Stan'}
            </span>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
          aria-label="Tutup Menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Group Info Pill (For Group Admin) */}
      {!isMasterAdmin && profile?.group && (
        <div className="p-4 mx-3 my-3 bg-primary-50/60 border border-primary-200/60 rounded-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-800 block">
            Stan Anda
          </span>
          <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
            {profile.group.name}
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Menu Navigasi
        </span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all ${
                active
                  ? 'bg-primary-50 text-primary-900 border-l-4 border-primary-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                size={16}
                className={active ? 'text-primary-800 shrink-0' : 'text-slate-400 shrink-0'}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Back to Public Storefront */}
      <div className="p-3 border-t border-slate-200">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <span>Lihat Toko Publik</span>
          <ExternalLink size={14} className="text-slate-400" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 h-screen fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-64 max-w-xs h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
