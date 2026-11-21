import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, Search, Menu, X, Lock } from 'lucide-react';
import { TrackOrderModal } from './TrackOrderModal';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Beranda', href: '/' },
    { label: 'Daftar Stan', href: '/groups' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-md bg-primary-800 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-primary-700 transition-colors">
              <span>B</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-none">
                  B-Zooginer
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                Pre-Order Sekolah
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-primary-800 bg-primary-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsTrackModalOpen(true)}
              className="h-9 px-3.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-md transition-colors flex items-center gap-2 shadow-2xs"
            >
              <Search size={14} className="text-slate-500" />
              <span>Lacak Pesanan</span>
            </button>

            <Link
              to="/groups"
              className="h-9 px-4 text-xs font-semibold text-slate-950 bg-accent-500 hover:bg-accent-400 active:bg-accent-600 rounded-md transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <ShoppingBag size={14} />
              <span>Buka Menu</span>
            </Link>

            <Link
              to="/admin"
              className="text-slate-400 hover:text-slate-600 p-2 rounded-md hover:bg-slate-100 transition-colors"
              title="Portal Administrator"
              aria-label="Portal Administrator"
            >
              <Lock size={15} />
            </Link>
          </div>

          {/* Mobile Actions & Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsTrackModalOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100"
              aria-label="Lacak Pesanan"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-md hover:bg-slate-100"
              aria-label="Buka Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium ${
                    isActive(link.href)
                      ? 'text-primary-800 bg-primary-50 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsTrackModalOpen(true);
                }}
                className="w-full h-10 px-4 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center justify-center gap-2"
              >
                <Search size={16} />
                Lacak Status Pesanan
              </button>

              <Link
                to="/groups"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full h-10 px-4 text-sm font-semibold text-slate-950 bg-accent-500 hover:bg-accent-400 rounded-md flex items-center justify-center gap-2"
              >
                <Store size={16} />
                Jelajahi Stan Kelas
              </Link>

              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1.5"
              >
                <Lock size={12} />
                Portal Administrator Stan
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Track Order Modal */}
      <TrackOrderModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
      />
    </>
  );
}
