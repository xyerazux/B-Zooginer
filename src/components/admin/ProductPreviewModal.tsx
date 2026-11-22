import { useState } from 'react';
import { X, Utensils, Tag, Package, ShoppingBag, Eye } from 'lucide-react';
import type { ProductFormData } from '@/services/products.service';

interface ProductPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Partial<ProductFormData>;
  groupName?: string;
}

export function ProductPreviewModal({
  isOpen,
  onClose,
  product,
  groupName = 'Stan Kelompok',
}: ProductPreviewModalProps) {
  if (!isOpen) return null;

  const basePrice = product.base_price || 0;
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.variant_dimensions) {
      product.variant_dimensions.forEach((dim) => {
        if (dim.options && dim.options.length > 0) {
          initial[dim.name] = dim.options[0];
        }
      });
    }
    return initial;
  });

  // Find matching variant based on selected attributes
  const matchingVariant = product.variants?.find((v) => {
    if (!v.attributes) return false;
    return Object.entries(selectedAttributes).every(
      ([key, val]) => v.attributes[key] === val
    );
  });

  const finalPrice = basePrice + (matchingVariant?.price_adjustment || 0);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Preview Banner */}
        <div className="px-5 py-3.5 bg-primary-800 text-white flex items-center justify-between border-b border-primary-900">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-accent-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Pratinjau Tampilan Toko Publik
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-primary-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Product Image */}
            <div className="aspect-square w-full rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name || 'Pratinjau Produk'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Utensils size={40} />
                  <span className="text-xs">Foto belum diunggah</span>
                </div>
              )}
              {product.is_featured && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-500 text-white shadow-xs">
                  Favorit
                </span>
              )}
            </div>

            {/* Product Details & Option Selectors */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-primary-800 block">
                  {groupName}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {product.name || 'Nama Menu Produk'}
                </h2>
                <div className="mt-2 text-2xl font-black text-primary-900 tabular-nums">
                  {formatRupiah(finalPrice)}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description || 'Deskripsi menu belum diisi oleh pengelola stan.'}
              </p>

              {/* Multi-Dimensional Variant Dimensions */}
              {product.has_variants && product.variant_dimensions && product.variant_dimensions.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {product.variant_dimensions.map((dim) => (
                    <div key={dim.name} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Pilih {dim.name}:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {dim.options.map((opt) => {
                          const isSelected = selectedAttributes[dim.name] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() =>
                                setSelectedAttributes((prev) => ({
                                  ...prev,
                                  [dim.name]: opt,
                                }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                isSelected
                                  ? 'bg-primary-800 text-white border-primary-800 shadow-2xs'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stock and PO Limits */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Package size={14} className="text-slate-400" />
                  <span>
                    Stok:{' '}
                    <strong className="text-slate-800">
                      {matchingVariant
                        ? matchingVariant.stock !== null
                          ? `${matchingVariant.stock} porsi`
                          : 'Tersedia'
                        : product.track_stock
                        ? 'Tergantung varian'
                        : 'Tersedia'}
                    </strong>
                  </span>
                </span>
                {product.max_po_qty && (
                  <span>
                    Maks. <strong>{product.max_po_qty}</strong> / pesanan
                  </span>
                )}
              </div>

              {/* Public Order Action Button (Disabled in Preview) */}
              <div className="pt-3">
                <button
                  type="button"
                  disabled
                  className="w-full h-11 bg-primary-800/80 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-90 shadow-2xs"
                >
                  <ShoppingBag size={15} />
                  <span>Pesan Sekarang (Tampilan Publik)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
}
