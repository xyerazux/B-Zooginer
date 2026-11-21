import { useState } from 'react';
import { Search, ShoppingBag, Banknote, Building2 } from 'lucide-react';
import { useAllOrders, useAllGroups } from '@/hooks/useAdmin';
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';

export function AllOrdersPage() {
  const { data: groups } = useAllGroups();
  const [groupIdFilter, setGroupIdFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders, isLoading } = useAllOrders({
    groupId: groupIdFilter,
    orderStatus: orderStatusFilter,
    paymentStatus: paymentStatusFilter,
    search: searchTerm,
  });

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Semua Pesanan Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengawasan terpusat seluruh transaksi pre-order lintas stan kelompok, verifikasi pembayaran, dan status pemesanan.
          </p>
        </div>
      </div>

      {/* Multi-Criteria Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

          {/* Group Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Stan Kelompok
            </label>
            <select
              value={groupIdFilter}
              onChange={(e) => setGroupIdFilter(e.target.value)}
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
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Kode Pesanan</th>
                    <th className="py-3 px-4">Pembeli & Kelas</th>
                    <th className="py-3 px-4">Stan Kelompok</th>
                    <th className="py-3 px-4">Metode Bayar</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status Pembayaran</th>
                    <th className="py-3 px-4">Status Pesanan</th>
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
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {o.group?.name || 'Stan'}
                      </td>
                      <td className="py-3.5 px-4">
                        {o.payment_method === 'cash' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                            <Banknote size={12} className="text-emerald-600" /> Tunai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800">
                            <Building2 size={12} className="text-blue-600" /> Transfer Bank
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View (No horizontal scroll!) */}
            <div className="md:hidden divide-y divide-slate-100">
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
                      {o.buyer_class} • Stan {o.group?.name}
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
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
