import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  Share2,
  ShieldCheck,
  Store,
  KeyRound,
  Home,
  AlertTriangle,
  Clock,
  Banknote,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useOrderConfirmation } from '@/hooks/useOrders';
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { TrackOrderModal } from '@/components/shared/TrackOrderModal';

export function OrderSuccessPage() {
  const { orderCode } = useParams<{ orderCode: string }>();
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('token') || '';

  const [copied, setCopied] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  const {
    data: order,
    isLoading,
    isError,
  } = useOrderConfirmation(orderCode || '', accessToken);

  const handleCopyCode = () => {
    if (order?.order_code) {
      navigator.clipboard.writeText(order.order_code);
      setCopied(true);
      toast.success('Kode pesanan berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (!order) return;
    const currentUrl = window.location.href;
    const text = `Halo, saya telah membuat pesanan di B-Zooginer!\nKode Pesanan: ${order.order_code}\nStan: ${order.group_name}\nTotal: Rp ${order.total.toLocaleString('id-ID')}\nLihat konfirmasi: ${currentUrl}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  // Mask phone number for privacy protection (e.g. 0812****5432)
  const maskPhone = (phone: string | null) => {
    if (!phone) return null;
    if (phone.length <= 6) return phone;
    const start = phone.slice(0, 4);
    const end = phone.slice(-3);
    return `${start}****${end}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto" />
        <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
        <div className="h-40 bg-slate-200 rounded-lg" />
      </div>
    );
  }

  // Token missing or invalid: show security protection alert
  if (!accessToken || isError || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <KeyRound size={32} />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">
            Akses Terproteksi Token Keamanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            Halaman konfirmasi pesanan ini memerlukan <strong>Token Keamanan Akses</strong> yang sah untuk melindungi data pribadi dan pesanan siswa dari pihak lain.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-600" />
            Mengapa ini diperlukan?
          </p>
          <p>
            B-Zooginer menerapkan sistem token 256-bit guna mencegah penelusuran identitas siswa secara acak hanya melalui tebak kode pesanan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsTrackModalOpen(true)}
            className="w-full sm:w-auto h-10 px-5 text-sm font-semibold text-white bg-primary-800 hover:bg-primary-700 rounded-md transition-colors"
          >
            Masukkan Token & Lacak
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto h-10 px-5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors inline-flex items-center justify-center"
          >
            Kembali ke Beranda
          </Link>
        </div>

        <TrackOrderModal
          isOpen={isTrackModalOpen}
          onClose={() => setIsTrackModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header Success Animation */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Pesanan Berhasil Dibuat!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Terima kasih telah memesan. Simpan kode pesanan dan tautan halaman ini untuk bukti pengambilan di stan.
        </p>
      </div>

      {/* High-Contrast Order Code Card */}
      <div className="bg-primary-950 text-white rounded-xl p-6 sm:p-7 shadow-lg space-y-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary-800/80 pb-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Kode Pesanan Resmi Anda
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-accent-400 tracking-wider">
              {order.order_code}
            </span>
          </div>

          <button
            onClick={handleCopyCode}
            className="h-10 px-4 bg-primary-800 hover:bg-primary-700 active:bg-primary-900 text-white rounded-md text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors self-center sm:self-auto"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>
        </div>

        {/* Security Token Notice (Data Privacy) */}
        <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-primary-900/60 p-3 rounded-lg border border-primary-800">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Halaman ini terproteksi token keamanan. Anda dapat menyimpan tautan ini di bookmark peramban Anda untuk mengecek status pesanan sewaktu-waktu.
          </p>
        </div>
      </div>

      {/* Order Status & Details Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-7 shadow-2xs space-y-6">
        {/* Status Pills Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Status Pesanan
            </span>
            <OrderStatusBadge status={order.order_status} />
          </div>

          <div className="space-y-1 text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">
              Status Pembayaran
            </span>
            <PaymentStatusBadge status={order.payment_status} />
          </div>
        </div>

        {/* Buyer & Stan Information (Minimal Necessary Info) */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Nama Pemesan</span>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{order.buyer_name}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Kelas Siswa</span>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{order.buyer_class}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Stan Kelompok</span>
            <p className="font-bold text-primary-900 text-sm mt-0.5 flex items-center gap-1">
              <Store size={14} className="text-primary-800" />
              <span>{order.group_name}</span>
            </p>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Metode Bayar</span>
            <p className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
              {order.payment_method === 'cash' ? (
                <>
                  <Banknote size={14} className="text-emerald-600" />
                  <span>Tunai di Stan</span>
                </>
              ) : (
                <>
                  <Building2 size={14} className="text-blue-600" />
                  <span>Transfer Bank</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Items Breakdown */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Rincian Item Menu
          </span>
          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{item.product_name}</p>
                  {item.variant_title && (
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Varian: {item.variant_title}
                    </p>
                  )}
                  <p className="text-slate-400 text-[11px]">
                    {item.quantity}x @ <span className="tabular-nums">{formatRupiah(item.unit_price)}</span>
                  </p>
                </div>
                <span className="font-bold text-slate-900 tabular-nums">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">Total Tagihan:</span>
            <span className="text-lg font-extrabold text-primary-900 tabular-nums">
              {formatRupiah(order.total)}
            </span>
          </div>
        </div>

        {/* Payment & Pickup Guide Notice */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <Clock size={14} className="text-accent-600" />
            Petunjuk Pengambilan & Pembayaran:
          </p>
          {order.payment_method === 'cash' ? (
            <p className="text-slate-600 leading-relaxed">
              Silakan bawa uang pas sebesar <strong className="tabular-nums">{formatRupiah(order.total)}</strong> dan sebutkan Kode Pesanan <strong className="font-mono">{order.order_code}</strong> ke panitia di stan {order.group_name} saat mengambil pesanan.
            </p>
          ) : (
            <p className="text-slate-600 leading-relaxed">
              Silakan lakukan transfer manual sebesar <strong className="tabular-nums">{formatRupiah(order.total)}</strong> ke rekening perwakilan stan {order.group_name}. Konfirmasi pembayaran akan diverifikasi oleh admin stan.
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={handleShareWhatsApp}
          className="w-full sm:w-auto h-11 px-6 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-md text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <Share2 size={16} />
          <span>Bagikan ke WhatsApp Saya</span>
        </button>

        <Link
          to="/"
          className="w-full sm:w-auto h-11 px-6 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
        >
          <Home size={16} />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
