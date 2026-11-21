import { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Banknote,
  Building2,
  CheckCircle2,
  ArrowRightCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  useGroupOrders,
  useUpdateOrderStatus,
  useConfirmOrderPayment,
} from '@/hooks/useGroupAdmin';
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import type { OrderStatusType } from '@/types/database.types';

export function GroupOrdersPage() {
  const { profile } = useAuth();
  const groupId = profile?.group_id || '';

  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders, isLoading } = useGroupOrders(groupId, {
    orderStatus: orderStatusFilter,
    paymentStatus: paymentStatusFilter,
    search: searchTerm,
  });

  const updateStatusMutation = useUpdateOrderStatus(groupId);
  const confirmPaymentMutation = useConfirmOrderPayment(groupId);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const handleConfirmPayment = async (orderId: string, orderCode: string) => {
    try {
      await confirmPaymentMutation.mutateAsync(orderId);
      toast.success(`Pembayaran pesanan ${orderCode} berhasil ditandai Lunas!`);
    } catch (err: any) {
      toast.error(`Gagal mengonfirmasi pembayaran: ${err.message || 'Terjadi kesalahan'}`);
    }
  };

  const handleUpdateStatus = async (
    orderId: string,
    orderCode: string,
    nextStatus: OrderStatusType
  ) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: nextStatus });
      toast.success(`Status pesanan ${orderCode} diperbarui ke "${nextStatus}".`);
    } catch (err: any) {
      toast.error(`Gagal mengubah status pesanan: ${err.message || 'Terjadi kesalahan'}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pesanan Masuk Stan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola pesanan pre-order stan kelompok Anda, konfirmasi pembayaran kas, dan perbarui proses pesanan.
          </p>
        </div>
      </div>

      {/* Multi-Criteria Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Pencarian
            </label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nama, kelas, atau kode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Status Pembayaran
            </label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            >
              <option value="all">Semua Status Bayar</option>
              <option value="paid">Lunas</option>
              <option value="unpaid">Belum Bayar</option>
            </select>
          </div>

          {/* Order Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Status Pesanan
            </label>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            >
              <option value="all">Semua Status Pesanan</option>
              <option value="new">Pesanan Baru</option>
              <option value="confirmed">Dikonfirmasi</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Memuat transaksi pesanan stan...
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag size={36} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">Tidak Ada Pesanan Ditemukan</h3>
            <p className="text-xs text-slate-500">
              Tidak ada pesanan masuk yang cocok dengan kriteria filter saat ini.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Kode Pesanan</th>
                    <th className="py-3 px-4">Pembeli & Kelas</th>
                    <th className="py-3 px-4">Metode Bayar</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status Bayar</th>
                    <th className="py-3 px-4">Status Pesanan</th>
                    <th className="py-3 px-4 text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-primary-900">
                        {o.order_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{o.buyer_name}</span>
                        <span className="text-[11px] text-slate-400">{o.buyer_class}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        {o.payment_method === 'cash' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                            <Banknote size={12} className="text-emerald-600" /> Tunai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800">
                            <Building2 size={12} className="text-blue-600" /> Transfer
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">
                        {formatRupiah(o.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <PaymentStatusBadge status={o.payment_status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <OrderStatusBadge status={o.order_status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {o.payment_status === 'unpaid' && (
                            <button
                              onClick={() => handleConfirmPayment(o.id, o.order_code)}
                              disabled={confirmPaymentMutation.isPending}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors inline-flex items-center gap-1"
                              title="Tandai pembayaran telah diterima"
                            >
                              <CheckCircle2 size={12} />
                              <span>Tandai Lunas</span>
                            </button>
                          )}

                          {o.order_status === 'new' && (
                            <button
                              onClick={() => handleUpdateStatus(o.id, o.order_code, 'confirmed')}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 text-[11px] font-semibold text-primary-800 bg-primary-50 hover:bg-primary-100 rounded border border-primary-200 transition-colors inline-flex items-center gap-1"
                            >
                              <ArrowRightCircle size={12} />
                              <span>Konfirmasi</span>
                            </button>
                          )}

                          {o.order_status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(o.id, o.order_code, 'completed')}
                              disabled={updateStatusMutation.isPending}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors inline-flex items-center gap-1"
                            >
                              <CheckCircle2 size={12} />
                              <span>Selesaikan</span>
                            </button>
                          )}

                          {o.order_status !== 'completed' && o.order_status !== 'cancelled' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Yakin ingin membatalkan pesanan ${o.order_code}?`)) {
                                  handleUpdateStatus(o.id, o.order_code, 'cancelled');
                                }
                              }}
                              disabled={updateStatusMutation.isPending}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Batalkan Pesanan"
                            >
                              <XCircle size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {orders.map((o) => (
                <div key={o.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary-900 bg-slate-100 px-2 py-0.5 rounded">
                      {o.order_code}
                    </span>
                    <PaymentStatusBadge status={o.payment_status} />
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{o.buyer_name}</h3>
                    <p className="text-xs text-slate-500">
                      Kelas: {o.buyer_class} • Metode:{' '}
                      {o.payment_method === 'cash' ? 'Tunai' : 'Transfer Bank'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                        Total Tagihan
                      </span>
                      <span className="font-bold text-slate-900 tabular-nums text-sm">
                        {formatRupiah(o.total)}
                      </span>
                    </div>
                    <OrderStatusBadge status={o.order_status} />
                  </div>

                  {/* Mobile Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {o.payment_status === 'unpaid' && (
                      <button
                        onClick={() => handleConfirmPayment(o.id, o.order_code)}
                        disabled={confirmPaymentMutation.isPending}
                        className="flex-1 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={13} />
                        <span>Tandai Lunas</span>
                      </button>
                    )}

                    {o.order_status === 'new' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, o.order_code, 'confirmed')}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 py-1.5 text-xs font-semibold text-primary-800 bg-primary-50 hover:bg-primary-100 rounded border border-primary-200 transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        <ArrowRightCircle size={13} />
                        <span>Konfirmasi</span>
                      </button>
                    )}

                    {o.order_status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, o.order_code, 'completed')}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={13} />
                        <span>Selesaikan</span>
                      </button>
                    )}

                    {o.order_status !== 'completed' && o.order_status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Yakin ingin membatalkan pesanan ${o.order_code}?`)) {
                            handleUpdateStatus(o.id, o.order_code, 'cancelled');
                          }
                        }}
                        disabled={updateStatusMutation.isPending}
                        className="py-1.5 px-3 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors inline-flex items-center justify-center gap-1"
                      >
                        <XCircle size={13} />
                        <span>Batalkan</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
