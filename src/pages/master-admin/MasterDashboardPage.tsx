import { Link } from 'react-router-dom';
import {
  Store,
  ShoppingBag,
  Utensils,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useMasterAdminStats, useAllOrders } from '@/hooks/useAdmin';
import { StatCard } from '@/components/admin/StatCard';
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';

export function MasterDashboardPage() {
  const { data: stats, isLoading } = useMasterAdminStats();
  const { data: recentOrders } = useAllOrders();

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ringkasan Operasional Bazaar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau kinerja seluruh stan kelompok, omzet kas masuk, dan transaksi Pre-Order secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/orders"
            className="h-10 px-4 text-xs font-semibold text-white bg-primary-800 hover:bg-primary-700 rounded-md transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <ShoppingBag size={14} />
            <span>Lihat Semua Pesanan</span>
          </Link>
        </div>
      </div>

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Stan Kelompok"
          value={isLoading ? '...' : `${stats?.totalGroups || 0} Kelompok`}
          subtext={`${stats?.publishedGroups || 0} stan terbit untuk publik`}
          icon={Store}
          variant="primary"
        />
        <StatCard
          title="Total Menu Terdaftar"
          value={isLoading ? '...' : `${stats?.totalProducts || 0} Produk`}
          subtext="Aktif di katalog bazar sekolah"
          icon={Utensils}
          variant="primary"
        />
        <StatCard
          title="Total Pesanan Masuk"
          value={isLoading ? '...' : `${stats?.totalOrders || 0} Pesanan`}
          subtext={`+${stats?.todayOrdersCount || 0} pesanan baru hari ini`}
          icon={ShoppingBag}
          variant="accent"
        />
        <StatCard
          title="Stan Terlaris"
          value={isLoading ? '...' : stats?.topGroupName || '-'}
          subtext="Volume penjualan terbanyak"
          icon={TrendingUp}
          variant="accent"
        />
        <StatCard
          title="Omzet Kas Lunas"
          value={isLoading ? '...' : formatRupiah(stats?.paidRevenue || 0)}
          subtext="Uang pembayaran telah diverifikasi"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Piutang (Belum Bayar)"
          value={isLoading ? '...' : formatRupiah(stats?.unpaidReceivable || 0)}
          subtext="Menunggu pembayaran pembeli"
          icon={AlertCircle}
          variant="rose"
        />
        <StatCard
          title="Pesanan Hari Ini"
          value={isLoading ? '...' : `${stats?.todayOrdersCount || 0} Transaksi`}
          subtext="Aktivitas pre-order 24 jam terakhir"
          icon={Clock}
          variant="primary"
        />
        <StatCard
          title="Rasio Kas Terkumpul"
          value={
            isLoading || !stats
              ? '...'
              : stats.paidRevenue + stats.unpaidReceivable > 0
              ? `${Math.round(
                  (stats.paidRevenue / (stats.paidRevenue + stats.unpaidReceivable)) * 100
                )}%`
              : '0%'
          }
          subtext="Dari total seluruh pesanan"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Recent Orders Overview Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary-800" />
            <h2 className="text-base font-bold text-slate-900">
              Transaksi Pesanan Terbaru (5 Terakhir)
            </h2>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-primary-800 hover:text-primary-700 flex items-center gap-1"
          >
            <span>Selengkapnya</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Belum ada data pesanan transaksi yang masuk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-3">Kode Pesanan</th>
                  <th className="py-3 px-3">Pembeli</th>
                  <th className="py-3 px-3">Stan</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status Bayar</th>
                  <th className="py-3 px-3">Status Pesanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-primary-900">
                      {order.order_code}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block">{order.buyer_name}</span>
                      <span className="text-[11px] text-slate-400">{order.buyer_class}</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {order.group?.name || 'Stan'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 tabular-nums">
                      {formatRupiah(order.total)}
                    </td>
                    <td className="py-3 px-3">
                      <PaymentStatusBadge status={order.payment_status} />
                    </td>
                    <td className="py-3 px-3">
                      <OrderStatusBadge status={order.order_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
