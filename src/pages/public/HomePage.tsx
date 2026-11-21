import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Store, ShieldCheck, Sparkles, Clock } from 'lucide-react';
import { usePublishedGroups } from '@/hooks/useGroups';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { POStatusBadge } from '@/components/shared/POStatusBadge';
import { GroupCardSkeleton } from '@/components/shared/LoadingSkeleton';

export function HomePage() {
  const { data: groups, isLoading } = usePublishedGroups();
  const { data: settings } = useSiteSettings();

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-950 via-primary-900 to-primary-950 text-white overflow-hidden py-16 sm:py-24">
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#BFD6F3_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-800/80 border border-primary-700/60 text-xs font-semibold text-accent-400">
            <Sparkles size={13} />
            <span>Bazaar Kewirausahaan Siswa Sekolah</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none text-balance">
            {settings?.hero_title || 'Dukung Usaha Mandiri & Karya Siswa Sekolah Kita'}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {settings?.hero_subtitle ||
              'Pesan aneka kuliner lezat, minuman segar, dan produk unik karya kelompok kelas secara praktis melalui Pre-Order online.'}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/groups"
              className="w-full sm:w-auto h-12 px-7 text-sm font-semibold text-slate-950 bg-accent-500 hover:bg-accent-400 active:bg-accent-600 rounded-md transition-all inline-flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingBag size={18} />
              <span>Jelajahi Stan & Menu</span>
            </Link>
            <a
              href="#panduan"
              className="w-full sm:w-auto h-12 px-6 text-sm font-medium text-slate-200 bg-primary-900/60 hover:bg-primary-800/80 border border-primary-700/60 rounded-md transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Cara Pemesanan</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto border-t border-primary-800/60 text-left">
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                {groups?.length || 0}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Stan Kelas Aktif</p>
            </div>
            <div className="p-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-accent-400 tabular-nums">100%</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Tanpa Wajib Akun</p>
            </div>
            <div className="p-3 col-span-2 sm:col-span-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tabular-nums">Aman</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Pencatatan Terverifikasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Groups Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-1">
              <Store size={14} />
              <span>Stan Kewirausahaan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Pilihan Stan Kelompok
            </h2>
          </div>
          <Link
            to="/groups"
            className="text-sm font-semibold text-primary-800 hover:text-primary-700 inline-flex items-center gap-1 group"
          >
            <span>Lihat Semua Stan</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Group Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <GroupCardSkeleton key={i} />
            ))}
          </div>
        ) : !groups || groups.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-lg space-y-2">
            <Store size={36} className="mx-auto text-slate-400" />
            <h3 className="text-base font-semibold text-slate-800">Belum Ada Stan Dibuka</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Stan kelompok siswa akan segera ditampilkan saat periode Pre-Order resmi dibuka.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="group bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
              >
                {/* 4:5 Aspect Ratio Poster Container */}
                <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                  {group.poster_url ? (
                    <img
                      src={group.poster_url}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <Store size={48} strokeWidth={1.5} className="mb-2 text-slate-300" />
                      <span className="text-xs font-medium">Poster Stan Kelas</span>
                    </div>
                  )}

                  {/* PO Status Badge (Top Right) */}
                  <div className="absolute top-3 right-3 z-10 shadow-xs">
                    <POStatusBadge status={group.po_status} />
                  </div>

                  {/* Logo Bubble (Bottom Left) */}
                  {group.logo_url && (
                    <div className="absolute bottom-3 left-3 w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white">
                      <img
                        src={group.logo_url}
                        alt={`Logo ${group.name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-primary-800 transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {group.description || 'Kunjungi stan kami untuk memesan menu favorit Anda.'}
                    </p>
                  </div>

                  <Link
                    to={`/groups/${group.slug || group.id}`}
                    className="w-full h-10 px-4 text-xs font-semibold text-primary-900 bg-primary-50 hover:bg-primary-100 active:bg-primary-200 border border-primary-200 rounded-md transition-colors flex items-center justify-center gap-1.5 mt-auto"
                  >
                    <span>Kunjungi Stan & Pesan</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it works (3 Steps) */}
      <section id="panduan" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-600 bg-accent-50 px-3 py-1 rounded-full border border-accent-200">
              Alur Transaksi
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              3 Langkah Mudah Pre-Order
            </h2>
            <p className="text-sm text-slate-500">
              Pesan menu favorit dari teman sekelas tanpa perlu membuat akun pendaftaran.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-800 flex items-center justify-center font-bold text-lg border border-primary-100 mx-auto sm:mx-0">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Pilih Stan & Menu</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pilih stan kelompok kelas dan sesuaikan kombinasi varian seperti ukuran porsi atau pilihan rasa sesuai selera Anda.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-lg bg-accent-50 text-accent-700 flex items-center justify-center font-bold text-lg border border-accent-100 mx-auto sm:mx-0">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Isi Data & Pesan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cukup isi Nama Lengkap, Kelas, dan pilih metode bayar (Tunai saat ambil atau Transfer Bank manual ke rekening perwakilan stan).
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-100 mx-auto sm:mx-0">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Simpan Bukti & Ambil</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dapatkan Kode Pesanan unik beserta Token Keamanan. Ambil pesanan di stan kelas saat pelaksanaan expo bazaar sekolah.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
