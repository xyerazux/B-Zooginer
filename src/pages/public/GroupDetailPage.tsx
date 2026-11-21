import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Store, Utensils, ShoppingBag, ArrowRight } from 'lucide-react';
import { useGroupDetail } from '@/hooks/useGroups';
import { POStatusBadge } from '@/components/shared/POStatusBadge';
import { ProductCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';

export function GroupDetailPage() {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { data: group, isLoading, isError } = useGroupDetail(idOrSlug || '');

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-48 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
          {[1, 2, 3, 4].map((n) => (
            <ProductCardSkeleton key={n} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !group) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon={Store}
          title="Stan Tidak Ditemukan"
          description="Stan kelompok yang Anda cari mungkin belum dibuka untuk publik atau tautan tidak valid."
          actionText="Kembali ke Daftar Stan"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/groups"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Daftar Stan</span>
        </Link>
      </div>

      {/* Group Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {/* Banner */}
        <div className="relative h-44 sm:h-56 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 p-6 flex items-end">
          {group.poster_url && (
            <img
              src={group.poster_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
          )}
          <div className="relative z-10 flex items-center justify-between w-full">
            <span className="text-xs uppercase tracking-widest text-slate-300 font-semibold bg-primary-900/80 px-2.5 py-1 rounded">
              Stan Kewirausahaan Kelas
            </span>
            <POStatusBadge status={group.po_status} />
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 py-6 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 -mt-12 sm:-mt-14 relative z-20">
          {/* Logo Circle */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-white shadow-md overflow-hidden shrink-0">
            {group.logo_url ? (
              <img
                src={group.logo_url}
                alt={group.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Store size={36} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {group.name}
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {group.description || 'Selamat datang di stan kewirausahaan kelas kami. Silakan pesan menu favorit Anda di bawah ini.'}
            </p>
          </div>
        </div>
      </div>

      {/* Catalog Section */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Utensils size={18} className="text-primary-800" />
            <h2 className="text-xl font-bold text-slate-900">
              Menu & Produk Stan ({group.products?.length || 0})
            </h2>
          </div>
        </div>

        {/* Product Grid */}
        {!group.products || group.products.length === 0 ? (
          <EmptyState
            icon={Utensils}
            title="Belum Ada Produk Aktif"
            description="Stan ini sedang menyiapkan daftar menu yang lezat. Silakan kembali beberapa saat lagi."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {group.products.map((product) => {
              const formattedPrice = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(product.base_price);

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* 1:1 Aspect Ratio Photo */}
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                        <Utensils size={40} strokeWidth={1.5} className="mb-2 text-slate-300" />
                        <span className="text-xs font-medium">Foto Produk 1:1</span>
                      </div>
                    )}

                    {product.has_variants && (
                      <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                        Ada Pilihan Varian
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-primary-800 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {product.description || 'Pesan sekarang sebelum kuota Pre-Order harian ditutup.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Harga {product.has_variants ? 'Mulai' : ''}
                        </span>
                        <span className="text-base font-bold text-primary-900 tabular-nums">
                          {formattedPrice}
                        </span>
                      </div>

                      <Link
                        to={`/products/${product.slug || product.id}`}
                        className="h-9 px-3.5 text-xs font-semibold text-slate-950 bg-accent-500 hover:bg-accent-400 active:bg-accent-600 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <ShoppingBag size={13} />
                        <span>Pesan</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
