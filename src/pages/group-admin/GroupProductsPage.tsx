import { useState } from 'react';
import { Search, Utensils, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useGroupProducts, useToggleProductActive } from '@/hooks/useGroupAdmin';

export function GroupProductsPage() {
  const { profile } = useAuth();
  const groupId = profile?.group_id || '';

  const { data: products, isLoading } = useGroupProducts(groupId);
  const toggleActiveMutation = useToggleProductActive(groupId);

  const [searchTerm, setSearchTerm] = useState('');

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const filteredProducts = (products || []).filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  const handleToggleActive = async (productId: string, currentStatus: boolean, productName: string) => {
    const nextStatus = !currentStatus;
    try {
      await toggleActiveMutation.mutateAsync({
        productId,
        isActive: nextStatus,
      });
      toast.success(
        nextStatus
          ? `Produk "${productName}" berhasil diaktifkan di toko.`
          : `Produk "${productName}" telah dinonaktifkan dari toko.`
      );
    } catch (err: any) {
      toast.error(`Gagal mengubah status produk: ${err.message || 'Terjadi kesalahan'}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Produk Menu Stan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola ketersediaan menu makanan & minuman stan kelompok Anda di etalase toko.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-primary-50 text-primary-900 rounded-md border border-primary-200">
            Total {products?.length || 0} Menu
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
          />
        </div>
        <p className="text-xs text-slate-400 self-start sm:self-auto">
          Menampilkan {filteredProducts.length} dari {products?.length || 0} produk
        </p>
      </div>

      {/* Products Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Memuat daftar produk menu...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Utensils size={36} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">Tidak Ada Produk Ditemukan</h3>
            <p className="text-xs text-slate-500">
              {searchTerm
                ? 'Tidak ada produk yang cocok dengan kata kunci pencarian.'
                : 'Stan ini belum memiliki produk menu yang terdaftar.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Menu Produk</th>
                    <th className="py-3 px-4">Harga Dasar</th>
                    <th className="py-3 px-4">Varian & Opsi</th>
                    <th className="py-3 px-4">Total Stok</th>
                    <th className="py-3 px-4">Status Toko</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const variantsCount = p.variants?.length || 0;
                    const totalVariantStock = (p.variants || []).reduce(
                      (acc, v) => acc + (v.stock ?? 0),
                      0
                    );
                    const isMultiVariant = variantsCount > 0;
                    const displayStock = isMultiVariant
                      ? `${totalVariantStock} porsi`
                      : p.max_po_qty !== null
                      ? `${p.max_po_qty} porsi`
                      : 'Tersedia';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Utensils size={18} className="text-slate-400" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{p.name}</span>
                              <span className="text-[11px] text-slate-400 line-clamp-1">
                                {p.description || '-'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                          {formatRupiah(p.base_price)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {isMultiVariant ? (
                            <span className="text-primary-800 font-semibold text-[11px]">
                              {variantsCount} kombinasi varian
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Satu varian dasar</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Package size={13} className="text-slate-400" />
                            <span className="font-semibold tabular-nums text-slate-800">
                              {displayStock}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {p.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aktif di Toko
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                              Dinonaktifkan
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleActive(p.id, p.is_active, p.name)}
                            disabled={toggleActiveMutation.isPending}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                              p.is_active
                                ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            }`}
                          >
                            {p.is_active ? (
                              <>
                                <ToggleRight size={15} />
                                <span>Nonaktifkan</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={15} />
                                <span>Aktifkan</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const variantsCount = p.variants?.length || 0;
                const totalVariantStock = (p.variants || []).reduce(
                  (acc, v) => acc + (v.stock ?? 0),
                  0
                );
                const displayStock =
                  variantsCount > 0
                    ? `${totalVariantStock} porsi`
                    : p.max_po_qty !== null
                    ? `${p.max_po_qty} porsi`
                    : 'Tersedia';

                return (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Utensils size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-sm text-slate-900 truncate">{p.name}</h3>
                          {p.is_active ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aktif
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                              Mati
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {p.description || '-'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                          Harga Dasar
                        </span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {formatRupiah(p.base_price)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                          Stok Tersedia
                        </span>
                        <span className="font-semibold text-slate-800 tabular-nums">
                          {displayStock}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => handleToggleActive(p.id, p.is_active, p.name)}
                        disabled={toggleActiveMutation.isPending}
                        className={`w-full py-2 rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
                          p.is_active
                            ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {p.is_active ? (
                          <>
                            <ToggleRight size={15} />
                            <span>Nonaktifkan dari Toko Publik</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={15} />
                            <span>Aktifkan ke Toko Publik</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
