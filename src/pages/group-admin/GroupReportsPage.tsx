// Page: Group Admin Sales & Financial Reports
// Project: B-Zooginer Pre-Order Platform
// Rules:
// - Strictly isolated to profile.group_id
// - Revenue counts ONLY eligible paid orders (payment_status = 'paid' && order_status <> 'cancelled')
// - Cancelled orders are strictly excluded from revenue and receivable
// - Excel export scoped to this group only

import { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  TrendingUp,
  Package,
  Utensils,
  Store,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMyGroup, useGroupProducts } from '@/hooks/useGroupAdmin';
import { useComprehensiveReport } from '@/hooks/useReports';
import { exportReportToExcel } from '@/services/excelExport.service';
import { StatCard } from '@/components/admin/StatCard';
import type { ReportFilterOptions } from '@/services/reports.service';

export function GroupReportsPage() {
  const { profile } = useAuth();
  const groupId = profile?.group_id || '';

  const { data: group } = useMyGroup(groupId);
  const { data: products } = useGroupProducts(groupId);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [source, setSource] = useState('all');
  const [productId, setProductId] = useState('all');

  const filterOptions: ReportFilterOptions = {
    groupId, // Strictly group isolated
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined,
    source: source !== 'all' ? source : undefined,
    productId: productId !== 'all' ? productId : undefined,
  };

  const { data: report, isLoading } = useComprehensiveReport(filterOptions);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);

  const handleExportExcel = async () => {
    if (!report || report.rawOrders.length === 0) {
      toast.error('Tidak ada data transaksi untuk diekspor.');
      return;
    }

    try {
      toast.loading('Menyusun lembar kerja Excel...');
      const targetProduct = products?.find((p) => p.id === productId);
      const filterParts = [
        startDate && endDate ? `${startDate} s/d ${endDate}` : 'Semua Tanggal',
        paymentStatus !== 'all' ? `Status Bayar: ${paymentStatus}` : null,
        source !== 'all' ? `Sumber: ${source}` : null,
        targetProduct ? `Produk: ${targetProduct.name}` : null,
      ]
        .filter(Boolean)
        .join(', ');

      await exportReportToExcel({
        reportData: report,
        title: `Laporan Penjualan & Rekonsiliasi Kas — Stan ${group?.name || ''}`,
        scopeLabel: `Stan Kelompok: ${group?.name || 'Stan Anda'}`,
        generatedBy: `${profile?.full_name || 'Admin Stan'} (Admin Stan)`,
        filterDescription: filterParts || 'Semua Data',
      });

      toast.dismiss();
      toast.success('Laporan Excel (.xlsx) berhasil diunduh!');
    } catch (err: any) {
      toast.dismiss();
      toast.error(`Gagal mengekspor laporan: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-900">
              Stan {group?.name || 'Kelompok'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Laporan & Analitik Penjualan Stan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau arus kas uang lunas, piutang pesanan yang belum terbayar, menu terlaris, dan ekspor spreadsheet pembukuan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          disabled={isLoading || !report || report.rawOrders.length === 0}
          className="h-10 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors inline-flex items-center gap-2 shadow-2xs disabled:opacity-50"
        >
          <Download size={15} />
          <span>Ekspor Laporan Stan (.xlsx)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <Calendar size={12} />
              <span>Dari Tanggal</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <Calendar size={12} />
              <span>Sampai Tanggal</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            />
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Status Pembayaran
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            >
              <option value="all">Semua Status Bayar</option>
              <option value="paid">Lunas (Kas Masuk)</option>
              <option value="unpaid">Belum Bayar (Piutang)</option>
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <Utensils size={12} />
              <span>Pilihan Menu</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            >
              <option value="all">Semua Menu Stan</option>
              {(products || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(startDate || endDate || paymentStatus !== 'all' || source !== 'all' || productId !== 'all') && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Filter aktif diterapkan</span>
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPaymentStatus('all');
                setSource('all');
                setProductId('all');
              }}
              className="text-primary-800 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* 4 Financial & Sales KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Omzet Kas Lunas Stan"
          value={isLoading ? '...' : formatRupiah(report?.totalRevenue || 0)}
          subtext="Total uang tunai/transfer terverifikasi lunas"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Piutang Belum Bayar"
          value={isLoading ? '...' : formatRupiah(report?.unpaidReceivable || 0)}
          subtext="Pesanan masuk yang belum dilunasi pembeli"
          icon={AlertCircle}
          variant="rose"
        />
        <StatCard
          title="Tingkat Pelunasan Kas"
          value={
            isLoading || !report
              ? '...'
              : report.totalRevenue + report.unpaidReceivable > 0
              ? `${Math.round(
                  (report.totalRevenue /
                    (report.totalRevenue + report.unpaidReceivable)) *
                    100
                )}%`
              : '0%'
          }
          subtext={`${report?.paidOrdersCount || 0} lunas dari ${
            report?.totalOrdersCount || 0
          } pesanan aktif`}
          icon={TrendingUp}
          variant="primary"
        />
        <StatCard
          title="Total Porsi Terjual"
          value={isLoading ? '...' : `${report?.totalItemsSold || 0} Porsi`}
          subtext="Akumulasi item yang terjual pada pesanan lunas"
          icon={Package}
          variant="accent"
        />
      </div>

      {/* Chart Section: Daily Sales Trend & Order Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tren Pendapatan Lunas Harian
              </h3>
              <p className="text-[11px] text-slate-400">
                Riwayat omzet kas lunas stan berdasarkan tanggal transaksi.
              </p>
            </div>
            <BarChart3 size={16} className="text-primary-800" />
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 animate-pulse">
              Memuat grafik tren penjualan...
            </div>
          ) : !report?.dailySales || report.dailySales.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Belum ada transaksi pada rentang periode yang dipilih.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={report.dailySales}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="groupRevGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}jt`
                        : val >= 1000
                        ? `${(val / 1000).toFixed(0)}rb`
                        : String(val)
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-1">
                            <p className="font-bold text-slate-300">{label}</p>
                            <p className="text-emerald-400 font-extrabold">
                              Omzet: {formatRupiah(Number(payload[0].value || 0))}
                            </p>
                            <p className="text-slate-400 text-[10px]">
                              Pesanan: {payload[0].payload.ordersCount} | Porsi: {payload[0].payload.itemsCount}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1E3A5F"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#groupRevGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Saluran Pemesanan</h3>
              <p className="text-[11px] text-slate-400">
                Komposisi pemesanan stan Anda
              </p>
            </div>
            <Layers size={16} className="text-primary-800" />
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 animate-pulse">
              Memuat data saluran...
            </div>
          ) : !report?.orderSourceBreakdown || report.orderSourceBreakdown.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              Belum ada pesanan yang tercatat.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {report.orderSourceBreakdown.map((sb) => {
                const totalOrders = report.totalOrdersCount || 1;
                const pct = Math.round((sb.count / totalOrders) * 100);

                return (
                  <div key={sb.source} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        {sb.sourceLabel}
                      </span>
                      <span className="font-extrabold text-slate-900">
                        {sb.count} Pesanan ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sb.source === 'public'
                            ? 'bg-primary-800'
                            : sb.source === 'group_admin'
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>Kas Masuk</span>
                      <span className="font-semibold text-slate-600">
                        {formatRupiah(sb.revenue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Best-Selling Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Peringkat Menu Makanan / Minuman Terlaris
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluasi jumlah porsi yang terjual dan total omzet yang dihasilkan masing-masing menu stan.
            </p>
          </div>
          <Package size={16} className="text-primary-800" />
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
            Memuat daftar menu terlaris...
          </div>
        ) : !report?.productPerformance || report.productPerformance.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Belum ada menu yang laku terjual pada filter ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Peringkat</th>
                  <th className="py-3 px-4">Nama Menu Produk</th>
                  <th className="py-3 px-4 text-center">Porsi Terjual</th>
                  <th className="py-3 px-4 text-right">Kontribusi Omzet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {report.productPerformance.map((prod, idx) => (
                  <tr key={prod.productId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-extrabold text-[11px] ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-700 border border-slate-300'
                            : idx === 2
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {prod.productName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {prod.totalQuantitySold} Porsi
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700">
                      {formatRupiah(prod.totalRevenue)}
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
