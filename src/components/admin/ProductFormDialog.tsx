import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Utensils,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadProductImage, validateImageFile } from '@/services/storage.service';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts';
import { ProductPreviewModal } from '@/components/admin/ProductPreviewModal';
import type { ProductFormData, VariantInput } from '@/services/products.service';
import type { VariantDimension, ProductRow, ProductVariantRow } from '@/types/database.types';

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName?: string;
  editProduct?: (ProductRow & { variants?: ProductVariantRow[] }) | null;
}

export function ProductFormDialog({
  isOpen,
  onClose,
  groupId,
  groupName = 'Stan Kelompok',
  editProduct,
}: ProductFormDialogProps) {
  const isEditing = Boolean(editProduct);

  const createProductMutation = useCreateProduct(groupId);
  const updateProductMutation = useUpdateProduct(groupId);

  const [activeTab, setActiveTab] = useState<'basic' | 'variants' | 'stock' | 'photo'>('basic');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(10000);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Multi-dimensional variants
  const [hasVariants, setHasVariants] = useState(false);
  const [dimensions, setDimensions] = useState<VariantDimension[]>([]);
  const [variants, setVariants] = useState<VariantInput[]>([]);

  // Dimension draft input
  const [newDimName, setNewDimName] = useState('');
  const [newDimOptions, setNewDimOptions] = useState('');

  // Stock & PO Settings
  const [trackStock, setTrackStock] = useState(true);
  const [maxPoQty, setMaxPoQty] = useState<number | ''>('');
  const [poOpenAt, setPoOpenAt] = useState('');
  const [poCloseAt, setPoCloseAt] = useState('');

  // Photo upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setDescription(editProduct.description || '');
      setBasePrice(editProduct.base_price);
      setIsActive(editProduct.is_active);
      setIsFeatured(editProduct.is_featured);
      setImageUrl(editProduct.image_url);
      setHasVariants(editProduct.has_variants);
      setDimensions(editProduct.variant_dimensions || []);
      setTrackStock(editProduct.track_stock);
      setMaxPoQty(editProduct.max_po_qty ?? '');
      setPoOpenAt(editProduct.po_open_at ? editProduct.po_open_at.slice(0, 16) : '');
      setPoCloseAt(editProduct.po_close_at ? editProduct.po_close_at.slice(0, 16) : '');

      if (editProduct.variants && editProduct.variants.length > 0) {
        setVariants(
          editProduct.variants.map((v) => ({
            id: v.id,
            title: v.title,
            attributes: v.attributes as Record<string, string>,
            sku: v.sku,
            price_adjustment: v.price_adjustment,
            stock: v.stock,
            is_active: v.is_active,
            sort_order: v.sort_order,
          }))
        );
      } else {
        setVariants([]);
      }
    } else {
      // Reset form
      setName('');
      setDescription('');
      setBasePrice(10000);
      setIsActive(true);
      setIsFeatured(false);
      setImageUrl(null);
      setHasVariants(false);
      setDimensions([
        { name: 'Ukuran', options: ['Kecil', 'Sedang', 'Besar'] },
      ]);
      setVariants([]);
      setTrackStock(true);
      setMaxPoQty('');
      setPoOpenAt('');
      setPoCloseAt('');
    }
    setActiveTab('basic');
  }, [editProduct, isOpen]);

  if (!isOpen) return null;

  // Add a new variant dimension (e.g. Size, Flavor, Temperature)
  const handleAddDimension = () => {
    if (!newDimName.trim()) {
      toast.error('Masukkan nama dimensi (misal: Ukuran, Rasa)');
      return;
    }
    const opts = newDimOptions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (opts.length === 0) {
      toast.error('Masukkan minimal 1 opsi varian (pisahkan dengan koma)');
      return;
    }

    setDimensions((prev) => [...prev, { name: newDimName.trim(), options: opts }]);
    setNewDimName('');
    setNewDimOptions('');
    toast.success(`Dimensi varian "${newDimName.trim()}" ditambahkan.`);
  };

  const handleRemoveDimension = (index: number) => {
    setDimensions((prev) => prev.filter((_, i) => i !== index));
  };

  // Generate Cartesian product matrix of variants from all dimensions
  const handleGenerateVariantCombinations = () => {
    if (dimensions.length === 0) {
      toast.error('Tambahkan minimal 1 dimensi varian terlebih dahulu.');
      return;
    }

    // Cartesian product function
    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap((c) => curr.map((n) => [...c, n])),
        [[]]
      );
    };

    const dimensionKeys = dimensions.map((d) => d.name);
    const optionArrays = dimensions.map((d) => d.options);
    const combinations = cartesian(optionArrays);

    const generatedVariants: VariantInput[] = combinations.map((combo, index) => {
      const attributes: Record<string, string> = {};
      combo.forEach((val, i) => {
        attributes[dimensionKeys[i]] = val;
      });

      return {
        title: combo.join(' / '),
        attributes,
        sku: `${name.slice(0, 3).toUpperCase()}-${combo.map((c) => c[0]).join('')}`.replace(
          /\s/g,
          ''
        ),
        price_adjustment: 0,
        stock: trackStock ? 20 : null,
        is_active: true,
        sort_order: index,
      };
    });

    setVariants(generatedVariants);
    toast.success(`${generatedVariants.length} kombinasi varian berhasil dihasilkan.`);
  };

  // Upload photo handler
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const url = await uploadProductImage(groupId, file);
      setImageUrl(url);
      toast.success('Foto produk berhasil diunggah!');
    } catch (err: any) {
      toast.error(`Gagal mengunggah foto: ${err.message}`);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Save product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Nama produk wajib diisi.');
      setActiveTab('basic');
      return;
    }

    if (basePrice < 0) {
      toast.error('Harga dasar tidak boleh negatif.');
      setActiveTab('basic');
      return;
    }

    if (hasVariants && variants.length === 0) {
      toast.error('Produk dengan varian harus memiliki minimal 1 kombinasi varian.');
      setActiveTab('variants');
      return;
    }

    const payload: ProductFormData = {
      group_id: groupId,
      name: name.trim(),
      description: description.trim() || null,
      base_price: basePrice,
      image_url: imageUrl,
      variant_dimensions: hasVariants ? dimensions : [],
      has_variants: hasVariants,
      track_stock: trackStock,
      max_po_qty: maxPoQty === '' ? null : Number(maxPoQty),
      is_active: isActive,
      is_featured: isFeatured,
      po_open_at: poOpenAt ? new Date(poOpenAt).toISOString() : null,
      po_close_at: poCloseAt ? new Date(poCloseAt).toISOString() : null,
      variants: hasVariants ? variants : [],
    };

    try {
      if (isEditing && editProduct) {
        await updateProductMutation.mutateAsync({
          productId: editProduct.id,
          data: payload,
        });
        toast.success(`Produk "${payload.name}" berhasil diperbarui.`);
      } else {
        await createProductMutation.mutateAsync(payload);
        toast.success(`Produk "${payload.name}" berhasil ditambahkan ke stan.`);
      }
      onClose();
    } catch (err: any) {
      toast.error(`Gagal menyimpan produk: ${err.message}`);
    }
  };

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;

  const currentPreviewData: Partial<ProductFormData> = {
    name,
    description,
    base_price: basePrice,
    image_url: imageUrl,
    has_variants: hasVariants,
    variant_dimensions: dimensions,
    variants,
    track_stock: trackStock,
    max_po_qty: maxPoQty === '' ? null : Number(maxPoQty),
    is_featured: isFeatured,
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? `Edit Produk: ${editProduct?.name}` : 'Tambah Produk Menu Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Stan: <strong>{groupName}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="h-8 px-3 text-xs font-semibold text-primary-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Eye size={14} />
                <span>Pratinjau Toko</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-slate-200 flex gap-4 text-xs font-bold bg-white overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'basic'
                  ? 'border-primary-800 text-primary-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              1. Informasi Dasar & Harga
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('variants')}
              className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'variants'
                  ? 'border-primary-800 text-primary-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>2. Varian Multi-Dimensi</span>
              {hasVariants && (
                <span className="px-1.5 py-0.2 rounded-full bg-primary-100 text-primary-800 text-[10px]">
                  {variants.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'stock'
                  ? 'border-primary-800 text-primary-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              3. Stok & Jadwal PO
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              className={`py-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'photo'
                  ? 'border-primary-800 text-primary-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>4. Foto Menu</span>
              {imageUrl && <CheckCircle2 size={13} className="text-emerald-600" />}
            </button>
          </div>

          {/* Form Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: BASIC INFO */}
            {activeTab === 'basic' && (
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Menu Produk <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Es Teh Manis Jumbo, Dimsum Mentai, Croissant"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Deskripsi Menu
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan porsi, bahan utama, tingkat kepedasan, atau keistimewaan menu ini..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Harga Dasar (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Harga patokan produk. Jika produk memiliki varian, setiap varian dapat memiliki penyesuaian harga di atas/di bawah harga dasar ini.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-primary-800 rounded focus:ring-primary-600"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Aktifkan di Etalase Toko
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-primary-800 rounded focus:ring-primary-600"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Tandai Sebagai Menu Favorit / Unggulan
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: MULTI-DIMENSIONAL VARIANTS */}
            {activeTab === 'variants' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-primary-50/60 border border-primary-200 rounded-xl">
                  <div>
                    <h3 className="text-sm font-bold text-primary-950">
                      Multi-Dimensional Product Variants
                    </h3>
                    <p className="text-xs text-primary-800/80">
                      Aktifkan jika produk memiliki kombinasi variasi seperti Ukuran (S/M/L) dan Rasa (Coklat/Keju).
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-800"></div>
                  </label>
                </div>

                {hasVariants && (
                  <div className="space-y-6">
                    {/* Dimension Builder */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Atur Dimensi Varian
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Nama Dimensi
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Ukuran / Rasa / Suhu"
                            value={newDimName}
                            onChange={(e) => setNewDimName(e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Pilihan Opsi (Pisahkan koma)
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Regular, Large"
                            value={newDimOptions}
                            onChange={(e) => setNewDimOptions(e.target.value)}
                            className="w-full h-9 px-3 bg-white border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handleAddDimension}
                            className="w-full h-9 px-3 bg-primary-800 text-white rounded-md text-xs font-semibold hover:bg-primary-700 transition-colors inline-flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <Plus size={14} />
                            <span>Tambah Dimensi</span>
                          </button>
                        </div>
                      </div>

                      {/* Configured Dimensions List */}
                      {dimensions.length > 0 && (
                        <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                          {dimensions.map((dim, idx) => (
                            <div
                              key={dim.name}
                              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs flex items-center gap-2 shadow-2xs"
                            >
                              <span className="font-bold text-slate-800">{dim.name}:</span>
                              <span className="text-slate-500 font-medium">
                                {dim.options.join(', ')}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDimension(idx)}
                                className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Combinations Generator Button */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleGenerateVariantCombinations}
                        className="h-9 px-4 text-xs font-bold text-primary-900 bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                      >
                        <Sparkles size={14} className="text-primary-700" />
                        <span>Hasilkan Kombinasi Varian Otomatis</span>
                      </button>
                      <span className="text-xs text-slate-500">
                        Total {variants.length} kombinasi yang dapat dibeli
                      </span>
                    </div>

                    {/* Variants Matrix Table */}
                    {variants.length > 0 && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                              <th className="py-2.5 px-3">Judul Varian</th>
                              <th className="py-2.5 px-3">Penyesuaian Harga</th>
                              <th className="py-2.5 px-3">Harga Akhir</th>
                              {trackStock && <th className="py-2.5 px-3">Stok Porsi</th>}
                              <th className="py-2.5 px-3">Aktif</th>
                              <th className="py-2.5 px-3 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {variants.map((v, vIndex) => {
                              const finalVarPrice = basePrice + v.price_adjustment;
                              return (
                                <tr key={vIndex} className="hover:bg-slate-50/70">
                                  <td className="py-2.5 px-3 font-bold text-slate-900">
                                    <input
                                      type="text"
                                      value={v.title}
                                      onChange={(e) => {
                                        const updated = [...variants];
                                        updated[vIndex].title = e.target.value;
                                        setVariants(updated);
                                      }}
                                      className="h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs w-full"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-400">Rp</span>
                                      <input
                                        type="number"
                                        step={500}
                                        value={v.price_adjustment}
                                        onChange={(e) => {
                                          const updated = [...variants];
                                          updated[vIndex].price_adjustment = Number(e.target.value);
                                          setVariants(updated);
                                        }}
                                        className="h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs w-24 tabular-nums"
                                      />
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold tabular-nums text-primary-900">
                                    Rp {finalVarPrice.toLocaleString('id-ID')}
                                  </td>
                                  {trackStock && (
                                    <td className="py-2.5 px-3">
                                      <input
                                        type="number"
                                        min={0}
                                        value={v.stock ?? 0}
                                        onChange={(e) => {
                                          const updated = [...variants];
                                          updated[vIndex].stock = Number(e.target.value);
                                          setVariants(updated);
                                        }}
                                        className="h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs w-20 tabular-nums"
                                      />
                                    </td>
                                  )}
                                  <td className="py-2.5 px-3">
                                    <input
                                      type="checkbox"
                                      checked={v.is_active}
                                      onChange={(e) => {
                                        const updated = [...variants];
                                        updated[vIndex].is_active = e.target.checked;
                                        setVariants(updated);
                                      }}
                                      className="w-4 h-4 text-primary-800 rounded"
                                    />
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setVariants((prev) => prev.filter((_, i) => i !== vIndex))
                                      }
                                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STOCK & PO SCHEDULE */}
            {activeTab === 'stock' && (
              <div className="space-y-5 max-w-2xl">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackStock}
                      onChange={(e) => setTrackStock(e.target.checked)}
                      className="w-4 h-4 text-primary-800 rounded focus:ring-primary-600"
                    />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Lacak Batasan Stok Porsi
                    </span>
                  </label>
                  <p className="text-xs text-slate-500">
                    Jika diaktifkan, sistem akan mengunci transaksi ketika stok habis secara atomik di database untuk mencegah pesanan berlebih (*overselling*).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Maksimum Kuantitas PO per Pesanan (Opsional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Kosongkan jika tidak ada batas"
                    value={maxPoQty}
                    onChange={(e) =>
                      setMaxPoQty(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-lg text-sm tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mencegah seorang pembeli memborong seluruh kuota stan dalam satu pesanan.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>Jadwal Buka Pre-Order (Opsional)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={poOpenAt}
                      onChange={(e) => setPoOpenAt(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span>Jadwal Tutup Pre-Order (Opsional)</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={poCloseAt}
                      onChange={(e) => setPoCloseAt(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PHOTO UPLOAD */}
            {activeTab === 'photo' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Foto Produk Menu (Rasio 1:1 Persegi)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gunakan foto asli beresolusi tajam dengan pencahayaan terang. Format didukung: WebP, JPEG, PNG (Maksimal 2 MB).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Image Preview Box */}
                  <div className="w-40 h-40 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative shadow-2xs">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Foto Menu"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Utensils size={40} className="text-slate-300" />
                    )}
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-xs font-semibold">
                        Mengunggah...
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-3 flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs">
                      <Upload size={14} />
                      <span>Pilih Foto dari Perangkat</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handlePhotoSelect}
                        disabled={isUploadingPhoto}
                      />
                    </label>

                    {imageUrl && (
                      <button
                        type="button"
                        onClick={() => setImageUrl(null)}
                        className="block text-xs font-medium text-rose-600 hover:underline"
                      >
                        Hapus Foto Saat Ini
                      </button>
                    )}

                    <p className="text-[11px] text-slate-400">
                      Foto akan otomatis dioptimalkan dan disimpan pada Supabase Storage bucket <code>products-media</code>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Eye size={14} />
                  <span>Pratinjau</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors shadow-2xs disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>{isEditing ? 'Simpan Perubahan' : 'Terbitkan Menu'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Live Preview Modal */}
      <ProductPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        product={currentPreviewData}
        groupName={groupName}
      />
    </>
  );
}
