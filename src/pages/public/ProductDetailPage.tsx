import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Utensils, Check, ShoppingBag, ShieldCheck, AlertCircle } from 'lucide-react';
import { useProductDetail } from '@/hooks/useProducts';
import { ProductCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/shared/Button';
import type { ProductVariantRow } from '@/types/database.types';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProductDetail(id || '');

  // Track user-selected attributes for each dimension (e.g. { Porsi: "Jumbo", "Level Pedas": "Pedas Mantap" })
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);

  // Initialize selected attributes with first options once product loads
  useMemo(() => {
    if (product && product.variant_dimensions && Array.isArray(product.variant_dimensions)) {
      const initial: Record<string, string> = {};
      product.variant_dimensions.forEach((dim) => {
        if (dim.options && dim.options.length > 0 && !selectedAttributes[dim.name]) {
          initial[dim.name] = dim.options[0];
        }
      });
      if (Object.keys(initial).length > 0) {
        setSelectedAttributes((prev) => ({ ...initial, ...prev }));
      }
    }
  }, [product]);

  // Find matching sellable variant based on selected attributes
  const matchedVariant: ProductVariantRow | null = useMemo(() => {
    if (!product || !product.has_variants || !product.variants) return null;

    return (
      product.variants.find((v) => {
        const vAttrs = v.attributes || {};
        // Match all dimensions case-insensitively
        return Object.entries(selectedAttributes).every(([dimName, optionVal]) => {
          // Check if variant attribute matches
          const keyInAttr = Object.keys(vAttrs).find(
            (k) => k.toLowerCase() === dimName.toLowerCase()
          );
          if (!keyInAttr) return false;
          return String(vAttrs[keyInAttr]).toLowerCase() === optionVal.toLowerCase();
        });
      }) || product.variants[0] || null
    );
  }, [product, selectedAttributes]);

  // Calculate dynamic price
  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const base = Number(product.base_price);
    const adjustment = matchedVariant ? Number(matchedVariant.price_adjustment) : 0;
    return base + adjustment;
  }, [product, matchedVariant]);

  const totalPrice = unitPrice * quantity;

  // Determine stock availability for selected variant/product
  const availableStock = useMemo(() => {
    if (!product) return 0;
    if (product.has_variants && matchedVariant) {
      return matchedVariant.stock !== null ? matchedVariant.stock : 999;
    }
    return product.max_po_qty !== null ? product.max_po_qty : 999;
  }, [product, matchedVariant]);

  const isOutOfStock = availableStock <= 0;

  // Format currency with tabular numerals
  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse space-y-8">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-200 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-24 bg-slate-200 rounded w-full" />
            <div className="h-12 bg-slate-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon={Utensils}
          title="Produk Tidak Ditemukan"
          description="Produk yang Anda cari tidak aktif atau tautan tidak valid."
          actionText="Kembali ke Beranda"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  const handleProceedToCheckout = () => {
    navigate(`/checkout/${product.id}`, {
      state: {
        product,
        variant: matchedVariant,
        selectedAttributes,
        quantity,
        unitPrice,
        totalPrice,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Back to Group Link */}
      <div>
        <Link
          to={`/groups/${product.group?.slug || product.group?.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Stan {product.group?.name}</span>
        </Link>
      </div>

      {/* Main Product Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* 1:1 Aspect Ratio Photo */}
        <div className="space-y-3">
          <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <Utensils size={64} strokeWidth={1.25} className="mb-2 text-slate-300" />
                <span className="text-xs font-medium">Foto Produk 1:1</span>
              </div>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                <span className="bg-rose-600 text-white font-bold text-sm px-4 py-1.5 rounded-full shadow-lg">
                  Stok Habis
                </span>
              </div>
            )}
          </div>

          {/* Group Badge */}
          <Link
            to={`/groups/${product.group?.slug || product.group?.id}`}
            className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Store size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Disediakan Oleh Stan
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">{product.group?.name}</p>
            </div>
          </Link>
        </div>

        {/* Product Configurations */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-primary-900 tabular-nums">
                  {formatRupiah(unitPrice)}
                </span>
                {matchedVariant && Number(matchedVariant.price_adjustment) !== 0 && (
                  <span className="text-xs text-slate-500 font-medium">
                    (Harga Dasar: {formatRupiah(product.base_price)} + Varian:{' '}
                    {matchedVariant.price_adjustment > 0 ? '+' : ''}
                    {formatRupiah(matchedVariant.price_adjustment)})
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description ||
                'Pesan menu ini melalui platform Pre-Order B-Zooginer dan ambil saat expo bazaar berlangsung.'}
            </p>

            {/* Multi-Dimensional Variant Selectors */}
            {product.has_variants &&
              product.variant_dimensions &&
              product.variant_dimensions.map((dim) => (
                <div key={dim.name} className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Pilih {dim.name}:
                  </label>
                  <div className="flex flex-wrap gap-2">
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
                          className={`h-9 px-3.5 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-primary-50 border-2 border-primary-600 text-primary-900 shadow-2xs'
                              : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} className="text-primary-700" />}
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

            {/* Quantity Stepper */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Jumlah Pesanan:
                </label>
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  {availableStock < 999
                    ? `Sisa kuota: ${availableStock} porsi`
                    : 'Kuota PO Tersedia'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-slate-300 rounded-md bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    disabled={quantity >= availableStock || isOutOfStock}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="text-sm font-semibold text-slate-700">
                  Total: <span className="text-base text-primary-900 font-extrabold tabular-nums">{formatRupiah(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout CTA */}
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <Button
              variant="accent"
              size="lg"
              disabled={isOutOfStock}
              onClick={handleProceedToCheckout}
              className="w-full text-sm font-bold"
            >
              <ShoppingBag size={18} />
              <span>{isOutOfStock ? 'Stok Varian Habis' : `Lanjut ke Pemesanan (${formatRupiah(totalPrice)})`}</span>
            </Button>

            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>Tanpa login akun • Pembayaran tunai saat ambil atau transfer bank</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
