import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, Plus, Search, Globe, EyeOff, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAllGroups, useToggleGroupPublish, useCreateGroup } from '@/hooks/useAdmin';
import { POStatusBadge } from '@/components/shared/POStatusBadge';
import type { PoStatusType } from '@/types/database.types';

const createGroupSchema = z.object({
  name: z.string().min(3, 'Nama stan kelompok minimal 3 karakter'),
  slug: z
    .string()
    .min(3, 'Slug minimal 3 karakter')
    .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung (-)'),
  description: z.string().max(300, 'Deskripsi maksimal 300 karakter').optional(),
  po_status: z.enum(['open', 'coming_soon', 'closed'] as const),
});

type CreateGroupFormData = z.infer<typeof createGroupSchema>;

export function GroupManagementPage() {
  const { data: groups, isLoading } = useAllGroups();
  const togglePublishMutation = useToggleGroupPublish();
  const createGroupMutation = useCreateGroup();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      po_status: 'open',
      description: '',
    },
  });

  const filteredGroups = (groups || []).filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTogglePublish = async (groupId: string, currentStatus: boolean) => {
    try {
      await togglePublishMutation.mutateAsync({
        groupId,
        isPublished: !currentStatus,
      });
      toast.success(
        !currentStatus
          ? 'Stan berhasil diterbitkan untuk publik!'
          : 'Stan dinonaktifkan dari publik.'
      );
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status publikasi.');
    }
  };

  const onSubmitCreateGroup = async (data: CreateGroupFormData) => {
    try {
      await createGroupMutation.mutateAsync({
        name: data.name,
        slug: data.slug,
        description: data.description,
        po_status: data.po_status,
      });
      toast.success('Stan kelompok baru berhasil didaftarkan!');
      reset();
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat stan kelompok baru.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Manajemen Stan Kelompok Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola pendaftaran stan bazar, izin publikasi ke etalase publik, dan status penerimaan Pre-Order.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 text-xs font-semibold text-white bg-primary-800 hover:bg-primary-700 active:bg-primary-900 rounded-md transition-colors inline-flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Daftarkan Stan Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between gap-4 shadow-2xs">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama stan atau slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Groups Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Memuat daftar stan kelompok...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Tidak ada stan kelompok yang cocok dengan pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Stan</th>
                  <th className="py-3 px-4">Slug URL</th>
                  <th className="py-3 px-4">Status PO</th>
                  <th className="py-3 px-4">Status Publikasi</th>
                  <th className="py-3 px-4 text-right">Aksi Terbit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroups.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200">
                          {g.logo_url ? (
                            <img src={g.logo_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Store size={14} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{g.name}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{g.description || 'Tidak ada deskripsi'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      /groups/{g.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      <POStatusBadge status={g.po_status} />
                    </td>
                    <td className="py-3.5 px-4">
                      {g.is_published ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Globe size={11} /> Terbit Publik
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <EyeOff size={11} /> Draf Pribadi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleTogglePublish(g.id, g.is_published)}
                        disabled={togglePublishMutation.isPending}
                        className={`h-8 px-3 rounded-md text-xs font-semibold transition-colors ${
                          g.is_published
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {g.is_published ? 'Sembunyikan' : 'Terbitkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create New Group */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Store size={18} className="text-primary-800" />
                <span>Daftarkan Stan Kelompok Baru</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitCreateGroup)} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Stan Kelompok <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Stan 05 — Kreasi Grafika (XI DKV)"
                  {...register('name')}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                {errors.name && (
                  <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Slug URL Stan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="contoh: kreasi-grafika"
                  {...register('slug')}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 lowercase"
                />
                {errors.slug && (
                  <p className="text-xs text-rose-600 mt-1">{errors.slug.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Status Penerimaan Pre-Order
                </label>
                <select
                  {...register('po_status')}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="open">PO Dibuka (Menerima Pesanan)</option>
                  <option value="coming_soon">Segera Hadir</option>
                  <option value="closed">PO Ditutup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Deskripsi Stan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ringkasan produk kuliner atau produk yang dijual..."
                  {...register('description')}
                  className="w-full p-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 text-xs font-semibold text-white bg-primary-800 hover:bg-primary-700 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Daftarkan Stan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
