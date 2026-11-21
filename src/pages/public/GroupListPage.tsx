import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Store, ArrowRight, Filter } from 'lucide-react';
import { usePublishedGroups } from '@/hooks/useGroups';
import { POStatusBadge } from '@/components/shared/POStatusBadge';
import { GroupCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import type { PoStatusType } from '@/types/database.types';

export function GroupListPage() {
  const { data: groups, isLoading } = usePublishedGroups();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PoStatusType>('all');

  const filteredGroups = (groups || []).filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || group.po_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daftar Stan Kewirausahaan
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Jelajahi seluruh stan kelompok siswa dan temukan aneka menu kuliner serta produk kreatif favorit Anda.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama stan kelompok atau menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white transition-colors"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden lg:inline">
            Status:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`h-9 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-primary-800 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Stan
          </button>
          <button
            onClick={() => setStatusFilter('open')}
            className={`h-9 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'open'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            PO Dibuka
          </button>
          <button
            onClick={() => setStatusFilter('coming_soon')}
            className={`h-9 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'coming_soon'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Segera Hadir
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Stan Tidak Ditemukan"
          description={
            searchTerm
              ? `Tidak ditemukan stan dengan kata kunci "${searchTerm}". Silakan periksa kembali ejaan Anda.`
              : 'Belum ada stan dengan status penyaringan yang dipilih.'
          }
          actionText="Reset Pencarian"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="group bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
            >
              {/* 4:5 Aspect Ratio Poster */}
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

                {/* Status Badge */}
                <div className="absolute top-3 right-3 z-10 shadow-xs">
                  <POStatusBadge status={group.po_status} />
                </div>

                {/* Logo Avatar */}
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

              {/* Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-primary-800 transition-colors">
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {group.description || 'Kunjungi stan untuk melihat katalog menu lengkap.'}
                  </p>
                </div>

                <Link
                  to={`/groups/${group.slug || group.id}`}
                  className="w-full h-10 px-4 text-xs font-semibold text-primary-900 bg-primary-50 hover:bg-primary-100 active:bg-primary-200 border border-primary-200 rounded-md transition-colors flex items-center justify-center gap-1.5 mt-auto"
                >
                  <span>Buka Menu Stan</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
