import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Utensils,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Store,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGroupAdminStats, useMyGroup, useGroupOrders } from '@/hooks/useGroupAdmin';
import { StatCard } from '@/components/admin/StatCard';
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';

export function GroupDashboardPage() {
  const { profile } = useAuth();
  const groupId = profile?.group_id || '';

  const { data: stats, isLoading: statsLoading } = useGroupAdminStats(groupId);
  const { data: group } = useMyGroup(groupId);
  const { data: orders, isLoading: ordersLoading } = useGroupOrders(groupId);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Group Banner & Identity Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-900">
                Stan Kelompok Anda
              </span>
              {group?.is_published ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Toko Publik Terbit
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                  Draf / Ditutup
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {group?.name || 'Stan Kelompok'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {group?.description || 'Kelola operasional menu, daftar pesanan, dan verifikasi kas stan kelompok Anda.'}
            </p>
            {group && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <Calendar size={13} className="text-slate-400" />
                <span>
                  Status PO:{' '}
                  <strong>
                    {group.po_status === 'open'
                      ? 'Pre-Order Dibuka'
                      : group.po_status === 'coming_soon'
                      ? 'Segera Dibuka'
                      : 'Pre-Order Ditutup'}
                  </strong>
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/dashboard/orders"
              className="h-9 px-3.5 text-xs font-semibold text-white bg-primary-800 hover:bg-primary-700 rounded-md transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <ShoppingBag size={14} />
              <span>Daftar Pesanan</span>
            </Link>
            <Link
              to="/dashboard/products"
              className="h-9 px-3.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1.5"
            >
              <Utensils size={14} />
              <span>Menu Produk</span>
            </Link>
            {group && (
              <Link
                to={`/groups/${group.slug || group.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3.5 text-xs font-semibold text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors inline-flex items-center gap-1.5"
              >
                <span>Lihat Stan</span>
                <ExternalLink size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Pesanan Masuk"
          value={statsLoading ? '...' : `${stats?.totalOrders || 0} Pesanan`}
          subtext="Seluruh pesanan stan Anda"
          icon={ShoppingBag}
          variant="primary"
        />
        <StatCard
          title="Kas Lunas Terkumpul"
          value={statsLoading ? '...' : formatRupiah(stats?.paidRevenue || 0)}
          subtext="Total transaksi pembayaran lunas"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Menunggu Pembayaran"
          value={statsLoading ? '...' : `${stats?.unpaidOrdersCount || 0} Pesanan`}
          subtext="Pesanan belum dibayar oleh pembeli"
          icon={AlertCircle}
          variant="rose"
        />
        <StatCard
          title="Menu Produk Aktif"
          value={statsLoading ? '...' : `${stats?.activeProductsCount || 0} Menu`}
          subtext="Ditampilkan di etalase toko"
          icon={Utensils}
          variant="accent"
        />
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary-800" />
            <h2 className="text-base font-bold text-slate-900">
              Pesanan Masuk Terbaru (5 Terakhir)
            </h2>
          </div>
          <Link
            to="/dashboard/orders"
            className="text-xs font-semibold text-primary-800 hover:text-primary-700 flex items-center gap-1"
          >
            <span>Lihat Semua Pesanan</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {ordersLoading ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
            Memuat pesanan stan...
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Store size={36} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">Belum Ada Pesanan Masuk</h3>
            <p className="text-xs text-slate-500">
              Pesanan dari siswa atau guru yang memesan menu stan Anda akan muncul di sini secara otomatis.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-3">Kode Pesanan</th>
                  <th className="py-3 px-3">Pembeli</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status Bayar</th>
                  <th className="py-3 px-3">Status Pesanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-primary-900">
                      {order.order_code}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">
                      {order.buyer_name}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {order.buyer_class}
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
