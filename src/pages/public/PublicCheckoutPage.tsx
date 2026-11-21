import { useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ShoppingBag, ShieldCheck, Banknote, Building2, AlertCircle, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import { useProductDetail } from '@/hooks/useProducts';
import { useSubmitPublicOrder } from '@/hooks/useOrders';
import { Button } from '@/components/shared/Button';
import type { ProductVariantRow } from '@/types/database.types';

const checkoutSchema = z.object({
  buyer_name: z
    .string()
    .min(2, 'Nama pemesan minimal 2 karakter')
    .max(100, 'Nama pemesan maksimal 100 karakter'),
  buyer_class: z
    .string()
    .min(2, 'Kelas siswa wajib diisi (contoh: XII MIPA 1)')
    .max(50, 'Nama kelas terlalu panjang'),
  whatsapp: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9+-\s]{8,20}$/.test(val), {
      message: 'Format nomor WhatsApp tidak valid (contoh: 08123456789)',
    }),
  payment_method: z.enum(['cash', 'transfer'], {
    required_error: 'Pilih salah satu metode pembayaran',
  }),
  notes: z.string().max(300, 'Catatan maksimal 300 karakter').optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function PublicCheckoutPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // If passed via navigation state from ProductDetailPage:
  const state = location.state as {
    variant?: ProductVariantRow | null;
    selectedAttributes?: Record<string, string>;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  } | null;

  const { data: product, isLoading: isProductLoading } = useProductDetail(productId || '');
  const submitOrderMutation = useSubmitPublicOrder();

  const [quantity, setQuantity] = useState<number>(state?.quantity || 1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      payment_method: 'cash',
      buyer_name: '',
      buyer_class: '',
      whatsapp: '',
      notes: '',
    },
  });

  const selectedPaymentMethod = watch('payment_method');

  // Variant matching
  const variant: ProductVariantRow | null =
    state?.variant || (product?.variants && product.variants.length > 0 ? product.variants[0] : null);

  const unitPrice =
    state?.unitPrice ||
    (product ? Number(product.base_price) + (variant ? Number(variant.price_adjustment) : 0) : 0);

  const grandTotal = unitPrice * quantity;

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!product) {
      toast.error('Data produk tidak ditemukan.');
      return;
    }

    try {
      const result = await submitOrderMutation.mutateAsync({
        group_id: product.group_id,
        buyer_name: data.buyer_name,
        buyer_class: data.buyer_class,
        whatsapp: data.whatsapp || undefined,
        payment_method: data.payment_method,
        notes: data.notes || undefined,
        items: [
          {
            product_id: product.id,
            variant_id: variant ? variant.id : null,
            quantity: quantity,
          },
        ],
      });

      toast.success('Pesanan berhasil dibuat!');
      // Navigate to success page with access_token in URL query param
      navigate(`/order/success/${result.order_code}?token=${encodeURIComponent(result.access_token)}`);
    } catch (err: any) {
      console.error('Order submission error:', err);
      toast.error(err.message || 'Gagal mengirim pesanan. Silakan periksa kembali formulir Anda.');
    }
  };

  if (isProductLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-40 bg-slate-200 rounded-lg" />
        <div className="h-60 bg-slate-200 rounded-lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Utensils size={48} className="mx-auto text-slate-400" />
        <h2 className="text-xl font-bold text-slate-800">Produk Tidak Ditemukan</h2>
        <Link to="/" className="text-primary-800 font-semibold text-sm hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Detail Produk</span>
        </button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Formulir Pemesanan Pre-Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lengkapi data pemesanan di bawah ini. Anda tidak perlu membuat akun pengguna.
        </p>
      </div>

      {/* Order Item Summary Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Stan: {product.group?.name || 'Kelompok Siswa'}
          </span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Pre-Order Aktif
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
            {product.image_url ? (
              <img src={product.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Utensils size={24} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
              {product.name}
            </h3>
            {variant && (
              <p className="text-xs text-primary-800 font-medium mt-0.5">
                Varian: {variant.title}
              </p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {quantity}x @ <span className="tabular-nums">{formatRupiah(unitPrice)}</span>
              </span>
              <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Checkout Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section: Buyer Information */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            1. Identitas Pemesan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Buyer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap Siswa / Pemesan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Rizky Pratama"
                {...register('buyer_name')}
                className={`w-full h-10 px-3 bg-white border rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                  errors.buyer_name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.buyer_name && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> {errors.buyer_name.message}
                </p>
              )}
            </div>

            {/* Buyer Class */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kelas Siswa / Unit <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: XII MIPA 2 / Guru"
                {...register('buyer_class')}
                className={`w-full h-10 px-3 bg-white border rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                  errors.buyer_class ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {errors.buyer_class && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} /> {errors.buyer_class.message}
                </p>
              )}
            </div>
          </div>

          {/* WhatsApp (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor WhatsApp <span className="text-slate-400 text-[10px] lowercase">(opsional)</span>
            </label>
            <input
              type="tel"
              placeholder="Contoh: 08123456789"
              {...register('whatsapp')}
              className={`w-full h-10 px-3 bg-white border rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                errors.whatsapp ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Digunakan stan untuk konfirmasi ketersediaan dan pengingat saat pesanan siap diambil.
            </p>
            {errors.whatsapp && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle size={12} /> {errors.whatsapp.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan untuk Stan <span className="text-slate-400 text-[10px] lowercase">(opsional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Sambalnya dipisah di plastik ya kak."
              {...register('notes')}
              className="w-full p-3 bg-white border border-slate-300 rounded-md text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        {/* Section: Payment Method (Strictly CASH or TRANSFER) */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            2. Metode Pembayaran
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CASH Option */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                selectedPaymentMethod === 'cash'
                  ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-600/20'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <input
                type="radio"
                value="cash"
                {...register('payment_method')}
                className="mt-1 text-primary-800 focus:ring-primary-600"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                  <Banknote size={16} className="text-emerald-600" />
                  <span>Tunai (Cash di Stan)</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bayar langsung uang pas saat mengambil pesanan di stan atau saat tim berkunjung ke kelas Anda.
                </p>
              </div>
            </label>

            {/* TRANSFER Option */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                selectedPaymentMethod === 'transfer'
                  ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-600/20'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <input
                type="radio"
                value="transfer"
                {...register('payment_method')}
                className="mt-1 text-primary-800 focus:ring-primary-600"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                  <Building2 size={16} className="text-blue-600" />
                  <span>Transfer Bank</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Transfer manual ke rekening bank perwakilan stan. Nomor rekening akan ditampilkan setelah pesanan terkirim.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between text-base">
            <span className="font-medium text-slate-600">Total Pembayaran:</span>
            <span className="text-2xl font-extrabold text-primary-900 tabular-nums">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          <Button
            type="submit"
            variant="accent"
            size="lg"
            isLoading={submitOrderMutation.isPending}
            className="w-full text-base font-bold shadow-md"
          >
            <ShoppingBag size={18} />
            <span>Kirim Pesanan Pre-Order Sekarang</span>
          </Button>

          <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Pesanan Anda akan dicatat langsung ke database stan sekolah.</span>
          </p>
        </div>
      </form>
    </div>
  );
}
