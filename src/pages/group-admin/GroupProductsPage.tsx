import { useState } from 'react';
import {
  Search,
  Utensils,
  Package,
  ToggleLeft,
  ToggleRight,
  Plus,
  Settings,
  Edit2,
  Eye,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useGroupProducts, useToggleProductActive, useMyGroup } from '@/hooks/useGroupAdmin';
import { ProductFormDialog } from '@/components/admin/ProductFormDialog';
import { GroupProfileDialog } from '@/components/admin/GroupProfileDialog';
import { ProductPreviewModal } from '@/components/admin/ProductPreviewModal';
import type { ProductWithVariants } from '@/services/groupAdmin.service';
import type { ProductFormData } from '@/services/products.service';

export function GroupProductsPage() {
  const { profile } = useAuth();
  const groupId = profile?.group_id || '';

  const { data: group } = useMyGroup(groupId);
  const { data: products, isLoading } = useGroupProducts(groupId);
  const toggleActiveMutation = useToggleProductActive(groupId);

  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithVariants | null>(null);
  const [isGroupProfileOpen, setIsGroupProfileOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Partial<ProductFormData> | null>(null);

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

  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (p: ProductWithVariants) => {
    setEditingProduct(p);
    setIsProductFormOpen(true);
  };

  const handleOpenPreview = (p: ProductWithVariants) => {
    setPreviewProduct({
      name: p.name,
      description: p.description,
      base_price: p.base_price,
      image_url: p.image_url,
      has_variants: p.has_variants,
      variant_dimensions: p.variant_dimensions,
      variants: (p.variants || []).map((v) => ({
        id: v.id,
        title: v.title,
        attributes: v.attributes as Record<string, string>,
        price_adjustment: v.price_adjustment,
        stock: v.stock,
        is_active: v.is_active,
      })),
      track_stock: p.track_stock,
      max_po_qty: p.max_po_qty,
      is_featured: p.is_featured,
    });
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
            Kelola katalog menu, penyesuaian harga varian multi-dimensi, dan ketersediaan stok stan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsGroupProfileOpen(true)}
            className="h-10 px-3.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Settings size={14} className="text-slate-500" />
            <span>Pengaturan & Media Stan</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateProduct}
            className="h-10 px-4 text-xs font-bold text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Plus size={15} />
            <span>Tambah Menu Baru</span>
          </button>
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
          <div className="p-12 text-center space-y-3">
            <Utensils size={36} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">Tidak Ada Produk Ditemukan</h3>
            <p className="text-xs text-slate-500">
              {searchTerm
                ? 'Tidak ada produk yang cocok dengan kata kunci pencarian.'
                : 'Stan ini belum memiliki produk menu. Tekan tombol "Tambah Menu Baru" untuk mulai memasarkan.'}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={handleOpenCreateProduct}
                className="h-9 px-4 text-xs font-semibold text-white bg-primary-800 hover:bg-primary-700 rounded-lg inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Plus size={14} />
                <span>Tambah Menu Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Menu Produk</th>
                    <th className="py-3 px-4">Harga Dasar</th>
                    <th className="py-3 px-4">Varian Multi-Dimensi</th>
                    <th className="py-3 px-4">Total Stok</th>
                    <th className="py-3 px-4">Status Toko</th>
                    <th className="py-3 px-4 text-right">Aksi & Pengaturan</th>
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
                            <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
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
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 block">{p.name}</span>
                                {p.is_featured && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-accent-100 text-accent-800">
                                    Favorit
                                  </span>
                                )}
                              </div>
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
                            <span className="text-primary-800 font-semibold text-[11px] bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
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
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(p)}
                              className="p-1.5 text-slate-500 hover:text-primary-800 hover:bg-slate-100 rounded transition-colors"
                              title="Pratinjau Toko"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(p)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                            >
                              <Edit2 size={12} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(p.id, p.is_active, p.name)}
                              disabled={toggleActiveMutation.isPending}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold inline-flex items-center gap-1 transition-colors ${
                                p.is_active
                                  ? 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              }`}
                            >
                              {p.is_active ? (
                                <>
                                  <ToggleRight size={14} />
                                  <span>Nonaktifkan</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft size={14} />
                                  <span>Aktifkan</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="lg:hidden divide-y divide-slate-100">
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
                      <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Utensils size={22} className="text-slate-400" />
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

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(p)}
                        className="py-1.5 px-3 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>Pratinjau</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditProduct(p)}
                        className="py-1.5 px-3 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p.id, p.is_active, p.name)}
                        disabled={toggleActiveMutation.isPending}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors ${
                          p.is_active
                            ? 'text-rose-700 bg-rose-50'
                            : 'text-emerald-700 bg-emerald-50'
                        }`}
                      >
                        {p.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Product Form Dialog (Create / Edit) */}
      <ProductFormDialog
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        groupId={groupId}
        groupName={group?.name}
        editProduct={editingProduct}
      />

      {/* Group Profile & Poster Dialog */}
      <GroupProfileDialog
        isOpen={isGroupProfileOpen}
        onClose={() => setIsGroupProfileOpen(false)}
        group={group || null}
      />

      {/* Storefront Preview Modal */}
      {previewProduct && (
        <ProductPreviewModal
          isOpen={Boolean(previewProduct)}
          onClose={() => setPreviewProduct(null)}
          product={previewProduct}
          groupName={group?.name}
        />
      )}
    </div>
  );
}
