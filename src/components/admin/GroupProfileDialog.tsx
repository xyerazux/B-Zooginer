import React, { useState, useEffect } from 'react';
import { X, Upload, Store, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadGroupPoster, uploadGroupLogo, validateImageFile } from '@/services/storage.service';
import { useUpdateGroupProfile } from '@/hooks/useGroupAdmin';
import type { GroupRow, PoStatusType } from '@/types/database.types';

interface GroupProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: GroupRow | null;
}

export function GroupProfileDialog({
  isOpen,
  onClose,
  group,
}: GroupProfileDialogProps) {
  const groupId = group?.id || '';
  const updateGroupProfileMutation = useUpdateGroupProfile(groupId);

  const [description, setDescription] = useState('');
  const [poStatus, setPoStatus] = useState<PoStatusType>('open');
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    if (group) {
      setDescription(group.description || '');
      setPoStatus(group.po_status || 'open');
      setPosterUrl(group.poster_url || null);
      setLogoUrl(group.logo_url || null);
    }
  }, [group, isOpen]);

  if (!isOpen || !group) return null;

  const handlePosterSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      setIsUploadingPoster(true);
      const url = await uploadGroupPoster(groupId, file);
      setPosterUrl(url);
      toast.success('Poster promosi stan berhasil diunggah!');
    } catch (err: any) {
      toast.error(`Gagal mengunggah poster: ${err.message}`);
    } finally {
      setIsUploadingPoster(false);
    }
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      setIsUploadingLogo(true);
      const url = await uploadGroupLogo(groupId, file);
      setLogoUrl(url);
      toast.success('Logo stan berhasil diunggah!');
    } catch (err: any) {
      toast.error(`Gagal mengunggah logo: ${err.message}`);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateGroupProfileMutation.mutateAsync({
        description,
        po_status: poStatus,
        poster_url: posterUrl,
        logo_url: logoUrl,
      });
      toast.success('Profil dan media stan berhasil diperbarui!');
      onClose();
    } catch (err: any) {
      toast.error(`Gagal menyimpan pengaturan: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Pengaturan Profil & Media Stan
            </h2>
            <p className="text-xs text-slate-500">
              Stan: <strong>{group.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* PO Status Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Status Pre-Order Stan
            </label>
            <select
              value={poStatus}
              onChange={(e) => setPoStatus(e.target.value as PoStatusType)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            >
              <option value="open">Pre-Order Dibuka (Menerima Pesanan)</option>
              <option value="coming_soon">Segera Dibuka (Katalog Terlihat, Pemesanan Belum Aktif)</option>
              <option value="closed">Pre-Order Ditutup (Pemesanan Selesai / Habis)</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Stan & Narasi Penjualan
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan tentang stan kelompok kelas Anda, tema makanan, atau keunggulan produk..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            />
          </div>

          {/* Promotional Poster Upload (4:5 Ratio) */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Poster Promosi Stan (Rasio 4:5 Vertikal)
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Poster utama yang akan ditampilkan di etalase halaman stan kelompok. Format: JPEG, PNG, WebP (Maksimal 2 MB).
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-32 h-40 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative shadow-2xs">
                {posterUrl ? (
                  <img src={posterUrl} alt="Poster Stan" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={36} className="text-slate-300" />
                )}
                {isUploadingPoster && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-[10px] font-semibold">
                    Mengunggah...
                  </div>
                )}
              </div>

              <div className="space-y-2 flex-1">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-primary-800 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs">
                  <Upload size={13} />
                  <span>Pilih Poster Baru</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePosterSelect}
                    disabled={isUploadingPoster}
                  />
                </label>
                {posterUrl && (
                  <button
                    type="button"
                    onClick={() => setPosterUrl(null)}
                    className="block text-xs font-medium text-rose-600 hover:underline"
                  >
                    Hapus Poster
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Logo Upload (1:1 Ratio) */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Logo / Ikon Stan (Rasio 1:1 Persegi)
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Ikon avatar bulat/persegi untuk identitas stan di navigasi dan kartu produk.
            </p>

            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative shadow-2xs">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Stan" className="w-full h-full object-cover" />
                ) : (
                  <Store size={24} className="text-slate-400" />
                )}
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-[9px] font-semibold">
                    ...
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">
                  <Upload size={13} />
                  <span>Pilih Logo</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleLogoSelect}
                    disabled={isUploadingLogo}
                  />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl(null)}
                    className="block text-xs font-medium text-rose-600 hover:underline"
                  >
                    Hapus Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={updateGroupProfileMutation.isPending}
              className="px-5 py-2 text-xs font-bold text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors shadow-2xs disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>Simpan Profil Stan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
