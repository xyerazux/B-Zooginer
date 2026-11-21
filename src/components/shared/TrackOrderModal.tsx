import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ShieldAlert, KeyRound } from 'lucide-react';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrackOrderModal({ isOpen, onClose }: TrackOrderModalProps) {
  const [orderCode, setOrderCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = orderCode.trim().toUpperCase();
    const cleanToken = accessToken.trim();

    if (!cleanCode) {
      setError('Kode pesanan wajib diisi.');
      return;
    }

    if (!cleanToken) {
      setError('Token keamanan akses wajib diisi untuk melindungi privasi data pesanan.');
      return;
    }

    onClose();
    navigate(`/order/success/${cleanCode}?token=${encodeURIComponent(cleanToken)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-primary-900 font-semibold text-base">
            <Search size={18} className="text-primary-800" />
            <h3>Lacak Status Pesanan</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800 flex items-start gap-2.5 leading-relaxed">
            <KeyRound size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p>
              Untuk melindungi privasi data siswa, pengecekan pesanan memerlukan <strong>Kode Pesanan</strong> dan <strong>Token Akses</strong> yang didapat saat pertama kali memesan.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 flex items-start gap-2">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Kode Pesanan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: BZG-20261121-7K9M"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Token Keamanan Akses <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan token dari tautan sukses"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-10 px-5 text-sm font-medium text-white bg-primary-800 hover:bg-primary-700 active:bg-primary-900 rounded-md transition-colors flex items-center gap-2"
            >
              <Search size={15} />
              Cek Pesanan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
