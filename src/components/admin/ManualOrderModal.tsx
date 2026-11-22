import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Store,
  User,
  GraduationCap,
  Phone,
  Banknote,
  Building2,
  CheckCircle2,
  Plus,
  Trash2,
  Package,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useAllGroups } from '@/hooks/useAdmin';
import { useGroupProducts } from '@/hooks/useGroupAdmin';
import { useSubmitAdminOrder } from '@/hooks/useOrders';
import type { PaymentMethodType, PaymentStatusType } from '@/types/database.types';
import type { ProductWithVariants } from '@/services/groupAdmin.service';

interface ManualOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGroupId?: string;
}

interface CartItem {
  productId: string;
  productName: string;
  variantId: string | null;
  variantTitle: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  maxAvailableStock: number | null;
}

export function ManualOrderModal({
  isOpen,
  onClose,
  defaultGroupId,
}: ManualOrderModalProps) {
  const { profile } = useAuth();
  const isMasterAdmin = profile?.role === 'master_admin';

  // Group selection state
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  // Groups query (for Master Admin)
  const { data: allGroups } = useAllGroups();

  useEffect(() => {
    if (defaultGroupId) {
      setSelectedGroupId(defaultGroupId);
    } else if (!isMasterAdmin && profile?.group_id) {
      setSelectedGroupId(profile.group_id);
    } else if (isMasterAdmin && allGroups && allGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(allGroups[0].id);
    }
  }, [defaultGroupId, profile, isMasterAdmin, allGroups, isOpen]);

  // Products query for selected group
  const { data: products, isLoading: productsLoading } = useGroupProducts(selectedGroupId);

  // Cart / Items state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Item Picker state
  const [activeProductId, setActiveProductId] = useState<string>('');
  const [activeVariantId, setActiveVariantId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Buyer Form state
  const [buyerName, setBuyerName] = useState('');
  const [buyerClass, setBuyerClass] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [isPaidDirectly, setIsPaidDirectly] = useState(true); // Roadshow POS default to paid
  const [notes, setNotes] = useState('');

  // Success state (receipt view)
  const [submissionResult, setSubmissionResult] = useState<{
    order_code: string;
    total: number;
  } | null>(null);

  const submitOrderMutation = useSubmitAdminOrder();

  // Reset item selector when active product changes
  const activeProduct = products?.find((p) => p.id === activeProductId);

  useEffect(() => {
    if (activeProduct && activeProduct.has_variants && activeProduct.variants?.length > 0) {
      setActiveVariantId(activeProduct.variants[0].id);
    } else {
      setActiveVariantId('');
    }
    setItemQuantity(1);
  }, [activeProductId]);

  if (!isOpen) return null;

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  // Add item to cart
  const handleAddToCart = () => {
    if (!activeProduct) {
      toast.error('Pilih produk menu terlebih dahulu');
      return;
    }

    let unitPrice = activeProduct.base_price;
    let variantTitle: string | null = null;
    let maxStock: number | null = null;

    if (activeProduct.has_variants) {
      const variant = activeProduct.variants?.find((v) => v.id === activeVariantId);
      if (!variant) {
        toast.error('Pilih varian produk');
        return;
      }
      unitPrice += variant.price_adjustment;
      variantTitle = variant.title;
      maxStock = activeProduct.track_stock ? variant.stock : null;
    } else {
      maxStock = activeProduct.max_po_qty ?? null;
    }

    if (itemQuantity <= 0) {
      toast.error('Jumlah kuantitas harus minimal 1');
      return;
    }

    if (maxStock !== null && itemQuantity > maxStock) {
      toast.error(`Kuantitas melebihi stok yang tersedia (${maxStock} porsi).`);
      return;
    }

    // Check if already in cart
    const existingIndex = cart.findIndex(
      (c) => c.productId === activeProduct.id && c.variantId === (activeVariantId || null)
    );

    if (existingIndex >= 0) {
      const updatedCart = [...cart];
      const newQty = updatedCart[existingIndex].quantity + itemQuantity;
      if (maxStock !== null && newQty > maxStock) {
        toast.error(`Total kuantitas di keranjang melebihi stok (${maxStock} porsi).`);
        return;
      }
      updatedCart[existingIndex].quantity = newQty;
      updatedCart[existingIndex].subtotal = newQty * unitPrice;
      setCart(updatedCart);
    } else {
      setCart((prev) => [
        ...prev,
        {
          productId: activeProduct.id,
          productName: activeProduct.name,
          variantId: activeVariantId || null,
          variantTitle,
          unitPrice,
          quantity: itemQuantity,
          subtotal: unitPrice * itemQuantity,
          maxAvailableStock: maxStock,
        },
      ]);
    }

    toast.success(`"${activeProduct.name}" ditambahkan ke pesanan.`);
    // Reset picker
    setActiveProductId('');
    setActiveVariantId('');
    setItemQuantity(1);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // Submit manual order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGroupId) {
      toast.error('Pilih stan kelompok sasaran.');
      return;
    }

    if (cart.length === 0) {
      toast.error('Tambahkan minimal 1 menu produk ke dalam pesanan.');
      return;
    }

    if (!buyerName.trim()) {
      toast.error('Nama pembeli wajib diisi.');
      return;
    }

    if (!buyerClass.trim()) {
      toast.error('Kelas pembeli wajib diisi (misal: XII MIPA 1).');
      return;
    }

    try {
      const result = await submitOrderMutation.mutateAsync({
        group_id: selectedGroupId,
        buyer_name: buyerName.trim(),
        buyer_class: buyerClass.trim(),
        whatsapp: whatsapp.trim() || undefined,
        payment_method: paymentMethod,
        payment_status: isPaidDirectly ? 'paid' : 'unpaid',
        notes: notes.trim() || undefined,
        items: cart.map((c) => ({
          product_id: c.productId,
          variant_id: c.variantId,
          quantity: c.quantity,
        })),
      });

      setSubmissionResult({
        order_code: result.order_code,
        total: result.total,
      });

      toast.success(`Pesanan ${result.order_code} berhasil dibuat!`);
    } catch (err: any) {
      toast.error(`Gagal membuat pesanan manual: ${err.message}`);
    }
  };

  // Reset to create another order
  const handleResetForNewOrder = () => {
    setCart([]);
    setBuyerName('');
    setBuyerClass('');
    setWhatsapp('');
    setNotes('');
    setSubmissionResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-primary-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-700 text-accent-300 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Mode Roadshow / Input Pesanan Manual
              </h2>
              <p className="text-[11px] text-white/80">
                Catat pesanan transaksi langsung di stan atau keliling kelas secara cepat.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {submissionResult ? (
          /* Receipt Success Screen */
          <div className="p-8 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Pesanan Berhasil Disimpan
              </span>
              <h3 className="text-2xl font-black font-mono text-primary-900">
                {submissionResult.order_code}
              </h3>
              <p className="text-xs text-slate-500">
                Pembeli: <strong>{buyerName}</strong> ({buyerClass}) • Total:{' '}
                <strong className="text-slate-900 font-bold tabular-nums">
                  {formatRupiah(submissionResult.total)}
                </strong>
              </p>
              <p className="text-xs text-slate-400">
                Status Pembayaran:{' '}
                <span className={`font-bold ${isPaidDirectly ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isPaidDirectly ? 'LUNAS (Kas Diterima)' : 'BELUM BAYAR'}
                </span>
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetForNewOrder}
                className="w-full sm:w-auto h-10 px-5 text-xs font-bold text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Plus size={14} />
                <span>Input Pesanan Berikutnya</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto h-10 px-5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        ) : (
          /* Form Entry Screen */
          <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Group Selector */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Store size={14} className="text-primary-800" />
                  <span>Stan Kelompok Sasaran</span>
                </label>
                {!isMasterAdmin && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                    Terkunci untuk Stan Anda
                  </span>
                )}
              </div>

              {isMasterAdmin ? (
                <select
                  value={selectedGroupId}
                  onChange={(e) => {
                    setSelectedGroupId(e.target.value);
                    setCart([]); // Clear cart if group changes
                  }}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  {(allGroups || []).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.po_status === 'open' ? 'PO Buka' : 'Tutup'})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs font-bold text-slate-900 bg-white p-2.5 rounded-lg border border-slate-200">
                  {profile?.group?.name || 'Stan Kelompok Anda'}
                </p>
              )}
            </div>

            {/* 2. Product & Variant Fast Picker */}
            <div className="p-4 bg-primary-50/40 rounded-xl border border-primary-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary-950 flex items-center gap-1.5">
                <Package size={14} className="text-primary-800" />
                <span>Pilih Menu & Varian Produk</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Product Select */}
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Menu Produk
                  </label>
                  <select
                    value={activeProductId}
                    onChange={(e) => setActiveProductId(e.target.value)}
                    className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                  >
                    <option value="">-- Pilih Menu Produk --</option>
                    {(products || [])
                      .filter((p) => p.is_active)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {formatRupiah(p.base_price)}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Variant Select (if has variants) */}
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Varian Menu
                  </label>
                  {activeProduct && activeProduct.has_variants ? (
                    <select
                      value={activeVariantId}
                      onChange={(e) => setActiveVariantId(e.target.value)}
                      className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600"
                    >
                      {(activeProduct.variants || [])
                        .filter((v) => v.is_active)
                        .map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.title}{' '}
                            {v.price_adjustment !== 0
                              ? `(${v.price_adjustment > 0 ? '+' : ''}${formatRupiah(
                                  v.price_adjustment
                                )})`
                              : ''}
                            {activeProduct.track_stock && v.stock !== null
                              ? ` - Stok: ${v.stock}`
                              : ''}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <div className="h-9 px-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-400 flex items-center">
                      Tanpa varian
                    </div>
                  )}
                </div>

                {/* Quantity & Add button */}
                <div className="sm:col-span-3 flex items-end gap-2">
                  <div className="w-16">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Kuantitas
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full h-9 px-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold tabular-nums text-center focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!activeProductId}
                    className="flex-1 h-9 px-3 bg-primary-800 text-white rounded-lg text-xs font-bold hover:bg-primary-700 disabled:opacity-40 transition-colors inline-flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Plus size={14} />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Itemized Cart Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Daftar Pesanan ({cart.length} item)
                </span>
                <span className="text-xs font-bold text-slate-900 tabular-nums">
                  Total: {formatRupiah(grandTotal)}
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                  Keranjang pesanan masih kosong. Pilih menu di atas dan tekan &quot;Tambah&quot;.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Produk & Varian</th>
                        <th className="py-2.5 px-3">Harga Satuan</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3">Subtotal</th>
                        <th className="py-2.5 px-3 text-right">Hapus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cart.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900 block">
                              {item.productName}
                            </span>
                            {item.variantTitle && (
                              <span className="text-[11px] text-primary-800 font-medium">
                                {item.variantTitle}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums text-slate-600">
                            {formatRupiah(item.unitPrice)}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums font-bold text-center text-slate-900">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 tabular-nums font-bold text-primary-950">
                            {formatRupiah(item.subtotal)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromCart(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 4. Buyer Details & Payment Info */}
            <div className="pt-2 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Informasi Pembeli & Pembayaran
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <User size={12} className="text-slate-400" />
                    <span>Nama Pembeli (Siswa / Guru)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rizky"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <GraduationCap size={12} className="text-slate-400" />
                    <span>Kelas Pembeli</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: XII MIPA 2 / Guru BK"
                    value={buyerClass}
                    onChange={(e) => setBuyerClass(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" />
                    <span>Nomor WhatsApp (Opsional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Banknote size={14} className="text-emerald-600" />
                      <span>Tunai (Cash)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                        paymentMethod === 'transfer'
                          ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Building2 size={14} className="text-blue-600" />
                      <span>Transfer Bank</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Status Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Tandai Pembayaran Lunas Sekarang?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Aktifkan jika uang kas tunai sudah diterima langsung dari pembeli saat pencatatan.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isPaidDirectly}
                  onChange={(e) => setIsPaidDirectly(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Catatan Pesanan Khusus (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jangan terlalu pedas, titip di meja guru"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  Total Bayar:{' '}
                  <strong className="text-sm font-extrabold text-primary-950 tabular-nums">
                    {formatRupiah(grandTotal)}
                  </strong>
                </span>

                <button
                  type="submit"
                  disabled={submitOrderMutation.isPending || cart.length === 0}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors shadow-2xs disabled:opacity-40 inline-flex items-center gap-1.5"
                >
                  <Receipt size={14} />
                  <span>
                    {submitOrderMutation.isPending
                      ? 'Menyimpan...'
                      : 'Simpan Pesanan Transaksi'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
