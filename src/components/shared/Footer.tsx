import { Link } from 'react-router-dom';
import { School, Heart, ShieldCheck, HelpCircle } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-950 text-slate-300 border-t border-primary-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-accent-500 text-slate-950 font-bold flex items-center justify-center text-base">
                B
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                B-Zooginer Platform
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Platform manajemen Pre-Order (PO) terpadu untuk mendukung bazar dan proyek kewirausahaan siswa sekolah. Belanja aneka kuliner lezat dan produk kreatif kelas tanpa hambatan.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="inline-flex items-center gap-1 bg-primary-900/80 px-2.5 py-1 rounded border border-primary-800">
                <ShieldCheck size={12} className="text-emerald-400" /> Transaksi Terpercaya
              </span>
              <span className="inline-flex items-center gap-1 bg-primary-900/80 px-2.5 py-1 rounded border border-primary-800">
                <School size={12} className="text-accent-400" /> Karya Siswa Mandiri
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">
              Tautan Cepat
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/groups" className="hover:text-white transition-colors">
                  Daftar Stan Kelompok
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Portal Admin Stan
                </Link>
              </li>
            </ul>
          </div>

          {/* Event & Operational Info */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase">
              Informasi Pengambilan
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pesanan diambil langsung di stan masing-masing kelompok kelas pada jam istirahat dan pelaksanaan expo sekolah.
            </p>
            <div className="pt-2">
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <HelpCircle size={13} className="text-accent-400 shrink-0" />
                Pertanyaan? Hubungi pengurus OSIS / panitia bazar kelas.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-primary-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {currentYear} B-Zooginer. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart size={12} className="text-rose-500 fill-rose-500 inline" /> untuk kemajuan wirausaha siswa.
          </p>
        </div>
      </div>
    </footer>
  );
}
