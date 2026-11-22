import { useState, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  Banknote,
  Building2,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAllOrders, useAllGroups } from '@/hooks/useAdmin';
import { useCancelOrderMutation, useUpdateOrderPaymentMutation } from '@/hooks/useOrders';
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { OrderSourceBadge } from '@/components/admin/OrderSourceBadge';
import { ManualOrderModal } from '@/components/admin/ManualOrderModal';
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog';

export function AllOrdersPage() {
  const { data: groups } = useAllGroups();

  // Filters
  const [groupIdFilter, setGroupIdFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data: orders, isLoading } = useAllOrders({
    groupId: groupIdFilter,
    orderStatus: orderStatusFilter,
    paymentStatus: paymentStatusFilter,
    source: sourceFilter,
    search: searchTerm,
    sortBy,
  });

  const cancelOrderMutation = useCancelOrderMutation();
  const updatePaymentMutation = useUpdateOrderPaymentMutation();

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

  // Pagination calculation
  const totalOrders = orders?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
  const paginatedOrders = useMemo(() => {
    if (!orders) return [];
    const startIndex = (currentPage - 1) * pageSize;
    return orders.slice(startIndex, startIndex + pageSize);
  }, [orders, currentPage, pageSize]);

  const handleConfirmPayment = async (orderId: string, orderCode: string) => {
    try {
      await updatePaymentMutation.mutateAsync({
        orderId,
        paymentStatus: 'paid',
      });
      toast.success(`Pembayaran pesanan ${orderCode} berhasil ditandai Lunas!`);
    } catch (err: any) {
      toast.error(`Gagal mengonfirmasi pembayaran: ${err.message}`);
    }
  };

  const handleCancelOrder = async (orderId: string, orderCode: string) => {
    if (window.confirm(`Yakin ingin membatalkan pesanan ${orderCode}? Stok varian akan otomatis dikembalikan.`)) {
      try {
        await cancelOrderMutation.mutateAsync(orderId);
        toast.success(`Pesanan ${orderCode} dibatalkan dan stok dikembalikan ke stan.`);
      } catch (err: any) {
        toast.error(`Gagal membatalkan pesanan: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Semua Pesanan Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengawasan terpusat seluruh transaksi pre-order lintas stan kelompok, verifikasi pembayaran kas, dan input transaksi manual.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsManualOrderOpen(true)}
            className="h-10 px-4 text-xs font-bold text-white bg-primary-800 hover:bg-primary-700 rounded-lg transition-colors inline-flex items-center gap-2 shadow-2xs"
          >
            <Plus size={15} />
            <span>Mode Roadshow (Pesanan Manual)</span>
          </button>
        </div>
      </div>

      {/* Multi-Criteria Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Stan Kelompok
            </label>
            <select
              value={groupIdFilter}
              onChange={(e) => {
                setGroupIdFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            >
              <option value="all">Semua Stan Kelompok</option>
              {(groups || []).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sumber Pesanan
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            >
              <option value="all">Semua Sumber</option>
              <option value="public">Publik / Toko Online</option>
              <option value="group_admin">Admin Stan</option>
              <option value="master_admin">Master Admin</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Status Pembayaran
            </label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
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
              onChange={(e) => {
                setOrderStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
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

        {/* Secondary Toolbar: Sorting & Counter */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800"
            >
              <option value="date_desc">Tanggal Pesanan (Terbaru)</option>
              <option value="date_asc">Tanggal Pesanan (Terlama)</option>
              <option value="total_desc">Total Tagihan (Tertinggi)</option>
              <option value="total_asc">Total Tagihan (Terendah)</option>
              <option value="buyer_asc">Nama Pembeli (A - Z)</option>
            </select>
          </div>

          <p className="text-slate-400">
            Ditemukan <strong>{totalOrders}</strong> transaksi pesanan di seluruh stan
          </p>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
            Memuat transaksi pesanan...
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag size={36} className="mx-auto text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">Tidak Ada Pesanan Ditemukan</h3>
            <p className="text-xs text-slate-500">
              Tidak ada transaksi yang cocok dengan kriteria filter saat ini.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Kode Pesanan</th>
                    <th className="py-3 px-3">Pembeli & Kelas</th>
                    <th className="py-3 px-3">Stan Kelompok</th>
                    <th className="py-3 px-3">Menu Produk</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-3">Sumber</th>
                    <th className="py-3 px-3">Status Bayar</th>
                    <th className="py-3 px-3">Status Pesanan</th>
                    <th className="py-3 px-3">Waktu</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedOrders.map((o) => {
                    const totalQty = (o.items || []).reduce(
                      (acc, i) => acc + (i.quantity || 1),
                      0
                    );
                    const productSummary = (o.items || [])
                      .map(
                        (i) =>
                          `${i.product_name_snapshot}${
                            i.variant_snapshot ? ` (${i.variant_snapshot})` : ''
                          }${i.quantity > 1 ? ` x${i.quantity}` : ''}`
                      )
                      .join(', ');

                    return (
                      <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-primary-900">
                          {o.order_code}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-bold text-slate-900 block">{o.buyer_name}</span>
                          <span className="text-[11px] text-slate-400">{o.buyer_class}</span>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-slate-700">
                          {o.group?.name || 'Stan'}
                        </td>
                        <td className="py-3.5 px-3 max-w-[180px]">
                          <span
                            className="text-slate-700 line-clamp-1 text-[11px]"
                            title={productSummary}
                          >
                            {productSummary || 'Menu Produk'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center tabular-nums font-bold text-slate-800">
                          {totalQty}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900 tabular-nums">
                          {formatRupiah(o.total)}
                        </td>
                        <td className="py-3.5 px-3">
                          <OrderSourceBadge source={o.source} />
                        </td>
                        <td className="py-3.5 px-3">
                          <PaymentStatusBadge status={o.payment_status} />
                        </td>
                        <td className="py-3.5 px-3">
                          <OrderStatusBadge status={o.order_status} />
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                          {formatDateTime(o.created_at)}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedOrderId(o.id)}
                              className="p-1 text-slate-500 hover:text-primary-800 hover:bg-slate-100 rounded transition-colors"
                              title="Lihat Detail Pesanan"
                            >
                              <Eye size={14} />
                            </button>

                            {o.payment_status === 'unpaid' && (
                              <button
                                onClick={() => handleConfirmPayment(o.id, o.order_code)}
                                disabled={updatePaymentMutation.isPending}
                                className="px-2 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors inline-flex items-center gap-0.5"
                                title="Tandai pembayaran telah diterima"
                              >
                                <CheckCircle2 size={11} />
                                <span>Lunas</span>
                              </button>
                            )}

                            {o.order_status !== 'completed' && o.order_status !== 'cancelled' && (
                              <button
                                onClick={() => handleCancelOrder(o.id, o.order_code)}
                                disabled={cancelOrderMutation.isPending}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                title="Batalkan Pesanan (Lepas Stok)"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
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
              {paginatedOrders.map((o) => {
                const totalQty = (o.items || []).reduce(
                  (acc, i) => acc + (i.quantity || 1),
                  0
                );

                return (
                  <div key={o.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary-900 bg-slate-100 px-2 py-0.5 rounded">
                          {o.order_code}
                        </span>
                        <OrderSourceBadge source={o.source} />
                      </div>
                      <PaymentStatusBadge status={o.payment_status} />
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{o.buyer_name}</h3>
                      <p className="text-xs text-slate-500">
                        {o.buyer_class} • Stan {o.group?.name || 'Kelompok'} ({totalQty} item)
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 block font-semibold">
                          Total Pembayaran
                        </span>
                        <span className="font-bold text-slate-900 tabular-nums text-sm">
                          {formatRupiah(o.total)}
                        </span>
                      </div>
                      <OrderStatusBadge status={o.order_status} />
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(o.id)}
                        className="py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg inline-flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>Detail Lengkap</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {o.payment_status === 'unpaid' && (
                          <button
                            onClick={() => handleConfirmPayment(o.id, o.order_code)}
                            disabled={updatePaymentMutation.isPending}
                            className="py-1.5 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200"
                          >
                            Tandai Lunas
                          </button>
                        )}
                        {o.order_status !== 'completed' && o.order_status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelOrder(o.id, o.order_code)}
                            disabled={cancelOrderMutation.isPending}
                            className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200"
                            title="Batalkan Pesanan"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Toolbar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <span>Tampilkan:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 px-2 bg-white border border-slate-200 rounded text-xs text-slate-800"
                >
                  <option value={10}>10 data</option>
                  <option value={25}>25 data</option>
                  <option value={50}>50 data</option>
                </select>
                <span>
                  Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="h-8 px-3 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors inline-flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span>Sebelumnya</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-8 px-3 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors inline-flex items-center gap-1"
                >
                  <span>Berikutnya</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Manual Order Modal (Roadshow Mode) */}
      <ManualOrderModal
        isOpen={isManualOrderOpen}
        onClose={() => setIsManualOrderOpen(false)}
        defaultGroupId={groupIdFilter !== 'all' ? groupIdFilter : undefined}
      />

      {/* Order Details Invoice Modal */}
      <OrderDetailsDialog
        isOpen={Boolean(selectedOrderId)}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
      />
    </div>
  );
}
