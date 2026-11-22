import {
  X,
  Copy,
  Check,
  ShoppingBag,
  User,
  GraduationCap,
  Phone,
  Banknote,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRightCircle,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useOrderDetails, useCancelOrderMutation, useUpdateOrderPaymentMutation, useUpdateOrderStatusMutation } from '@/hooks/useOrders';
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { OrderSourceBadge } from '@/components/admin/OrderSourceBadge';
import type { OrderStatusType } from '@/types/database.types';

interface OrderDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  canManage?: boolean;
}

export function OrderDetailsDialog({
  isOpen,
  onClose,
  orderId,
  canManage = true,
}: OrderDetailsDialogProps) {
  const { data: order, isLoading } = useOrderDetails(orderId || undefined);
  const cancelOrderMutation = useCancelOrderMutation();
  const updatePaymentMutation = useUpdateOrderPaymentMutation();
  const updateStatusMutation = useUpdateOrderStatusMutation();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  if (!isOpen || !orderId) return null;

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopyCode = () => {
    if (order?.order_code) {
      navigator.clipboard.writeText(order.order_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success('Kode pesanan disalin ke clipboard');
    }
  };

  const handleCopyToken = () => {
    if (order?.access_token) {
      navigator.clipboard.writeText(order.access_token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
      toast.success('Access token pesanan disalin');
    }
  };

  const handleConfirmPayment = async () => {
    if (!order) return;
    try {
      await updatePaymentMutation.mutateAsync({
        orderId: order.id,
        paymentStatus: 'paid',
      });
      toast.success(`Pembayaran pesanan ${order.order_code} berhasil ditandai Lunas!`);
    } catch (err: any) {
      toast.error(`Gagal memperbarui status pembayaran: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (nextStatus: OrderStatusType) => {
    if (!order) return;
    try {
      await updateStatusMutation.mutateAsync({
        orderId: order.id,
        status: nextStatus,
      });
      toast.success(`Status pesanan ${order.order_code} diperbarui ke "${nextStatus}".`);
    } catch (err: any) {
      toast.error(`Gagal mengubah status pesanan: ${err.message}`);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    const confirmMsg =
      `Yakin ingin membatalkan pesanan ${order.order_code}?\n\n` +
      `Seluruh stok varian yang sebelumnya dipesan (${order.items.reduce(
        (acc, i) => acc + i.quantity,
        0
      )} porsi) akan otomatis dikembalikan ke inventaris stan kelompok.`;

    if (window.confirm(confirmMsg)) {
      try {
        await cancelOrderMutation.mutateAsync(order.id);
        toast.success(`Pesanan ${order.order_code} dibatalkan dan stok dikembalikan ke etalase.`);
      } catch (err: any) {
        toast.error(`Gagal membatalkan pesanan: ${err.message}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-primary-950">
                  {order?.order_code || 'Detail Transaksi'}
                </span>
                {order && <OrderSourceBadge source={order.source} />}
              </div>
              <p className="text-[11px] text-slate-500">
                Stan: <strong>{order?.group?.name || 'Stan Kelompok'}</strong> • Dibuat:{' '}
                {formatDateTime(order?.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {isLoading || !order ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Memuat detail transaksi pesanan...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status & Identifiers Banner */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <PaymentStatusBadge status={order.payment_status} />
                <OrderStatusBadge status={order.order_status} />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-semibold text-slate-700 transition-colors inline-flex items-center gap-1 shadow-2xs"
                  title="Salin Kode Pesanan"
                >
                  {copiedCode ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>Salin Kode</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-semibold text-slate-700 transition-colors inline-flex items-center gap-1 shadow-2xs"
                  title="Salin Access Token Pembeli"
                >
                  {copiedToken ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>Token Akses</span>
                </button>
              </div>
            </div>

            {/* Buyer & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Informasi Pembeli
                </h4>
                <div className="space-y-1 text-slate-600">
                  <p className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                    <User size={13} className="text-slate-400" />
                    <span>{order.buyer_name}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-slate-400" />
                    <span>Kelas: <strong>{order.buyer_class}</strong></span>
                  </p>
                  {order.whatsapp && (
                    <p className="flex items-center gap-1.5 pt-1">
                      <Phone size={13} className="text-emerald-600" />
                      <a
                        href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>{order.whatsapp}</span>
                        <ExternalLink size={10} />
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Informasi Pembayaran
                </h4>
                <div className="space-y-1.5 text-slate-600">
                  <p className="flex items-center gap-1.5">
                    {order.payment_method === 'cash' ? (
                      <>
                        <Banknote size={14} className="text-emerald-600" />
                        <span>Metode: <strong>Tunai (Cash di Stan)</strong></span>
                      </>
                    ) : (
                      <>
                        <Building2 size={14} className="text-blue-600" />
                        <span>Metode: <strong>Transfer Bank</strong></span>
                      </>
                    )}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Tanggal: {order.order_date}</span>
                  </p>
                  {order.notes && (
                    <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-500 italic">
                      &quot;{order.notes}&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ordered Items Table (Immutable Snapshot) */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Rincian Produk Pesanan (Historical Snapshot)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Nama Menu & Varian</th>
                      <th className="py-2.5 px-3">Harga Satuan</th>
                      <th className="py-2.5 px-3 text-center">Kuantitas</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(order.items || []).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 block">
                            {item.product_name_snapshot}
                          </span>
                          {item.variant_snapshot && (
                            <span className="text-[11px] text-primary-800 font-medium">
                              Varian: {item.variant_snapshot}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums text-slate-600">
                          {formatRupiah(item.unit_price_snapshot)}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums font-bold text-center text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 tabular-nums font-bold text-primary-950 text-right">
                          {formatRupiah(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={3} className="py-3 px-3 text-right text-slate-700">
                        Total Tagihan:
                      </td>
                      <td className="py-3 px-3 text-right text-sm text-primary-950 tabular-nums">
                        {formatRupiah(order.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Quick Management Actions */}
            {canManage && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Tindakan Operasional
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {order.payment_status === 'unpaid' && (
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={updatePaymentMutation.isPending}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <CheckCircle2 size={13} />
                      <span>Tandai Pembayaran Lunas</span>
                    </button>
                  )}

                  {order.order_status === 'new' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('confirmed')}
                      disabled={updateStatusMutation.isPending}
                      className="px-3 py-1.5 text-xs font-semibold text-primary-800 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <ArrowRightCircle size={13} />
                      <span>Konfirmasi Pesanan</span>
                    </button>
                  )}

                  {order.order_status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('completed')}
                      disabled={updateStatusMutation.isPending}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={13} />
                      <span>Selesaikan Pesanan</span>
                    </button>
                  )}

                  {order.order_status !== 'completed' && order.order_status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={handleCancelOrder}
                      disabled={cancelOrderMutation.isPending}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors inline-flex items-center gap-1.5 ml-auto"
                    >
                      <XCircle size={13} />
                      <span>Batalkan Pesanan (Lepas Stok)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
