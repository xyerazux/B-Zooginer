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
  BarChart,
  Bar,
} from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useAllGroups } from '@/hooks/useAdmin';
import { useComprehensiveReport } from '@/hooks/useReports';
import { exportReportToExcel } from '@/services/excelExport.service';
import { StatCard } from '@/components/admin/StatCard';
import type { ReportFilterOptions } from '@/services/reports.service';

export function MasterReportsPage() {
  const { profile } = useAuth();
  const { data: groups } = useAllGroups();

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [source, setSource] = useState('all');

  const filterOptions: ReportFilterOptions = {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    groupId: selectedGroupId !== 'all' ? selectedGroupId : undefined,
    paymentStatus: paymentStatus !== 'all' ? paymentStatus : undefined,
    source: source !== 'all' ? source : undefined,
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
      const targetGroup = groups?.find((g) => g.id === selectedGroupId);
      const scopeLabel = targetGroup ? `Stan ${targetGroup.name}` : 'Semua Stan Kelompok';

      const filterDesc = [
        startDate && endDate ? `${startDate} s/d ${endDate}` : 'Semua Tanggal',
        paymentStatus !== 'all' ? `Status: ${paymentStatus}` : null,
        source !== 'all' ? `Sumber: ${source}` : null,
      ]
        .filter(Boolean)
        .join(', ');

      await exportReportToExcel({
        reportData: report,
        title: 'Laporan Rekonsiliasi Keuangan & Transaksi Pre-Order',
        scopeLabel,
        generatedBy: profile?.full_name || 'Master Admin',
        filterDescription: filterDesc || 'Semua Data',
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Laporan Keuangan & Penjualan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekonsiliasi omzet kas, piutang pesanan belum bayar, evaluasi performa stan, dan unduh laporan spreadsheet.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          disabled={isLoading || !report || report.rawOrders.length === 0}
          className="h-10 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors inline-flex items-center gap-2 shadow-2xs disabled:opacity-50"
        >
          <Download size={15} />
          <span>Ekspor Laporan (.xlsx)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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

          {/* Group Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <Store size={12} />
              <span>Stan Kelompok</span>
            </label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
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
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            >
              <option value="all">Semua Status Bayar</option>
              <option value="paid">Lunas (Kas Masuk)</option>
              <option value="unpaid">Belum Bayar (Piutang)</option>
            </select>
          </div>

          {/* Order Source Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sumber Pemesanan
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full h-9 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:bg-white"
            >
              <option value="all">Semua Sumber</option>
              <option value="public">Publik / Toko Web</option>
              <option value="group_admin">Admin Stan (Roadshow)</option>
              <option value="master_admin">Master Admin</option>
            </select>
          </div>
        </div>

        {(startDate || endDate || selectedGroupId !== 'all' || paymentStatus !== 'all' || source !== 'all') && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Filter aktif diterapkan</span>
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setSelectedGroupId('all');
                setPaymentStatus('all');
                setSource('all');
              }}
              className="text-primary-800 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* 4 Financial KPI StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Omzet Kas Lunas"
          value={isLoading ? '...' : formatRupiah(report?.totalRevenue || 0)}
          subtext="Pesanan lunas terverifikasi (bebas pembatalan)"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Piutang (Belum Bayar)"
          value={isLoading ? '...' : formatRupiah(report?.unpaidReceivable || 0)}
          subtext="Pesanan belum bayar (bebas pembatalan)"
          icon={AlertCircle}
          variant="rose"
        />
        <StatCard
          title="Rasio Kas Terkumpul"
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
          } transaksi valid`}
          icon={TrendingUp}
          variant="primary"
        />
        <StatCard
          title="Porsi Menu Terjual"
          value={isLoading ? '...' : `${report?.totalItemsSold || 0} Porsi`}
          subtext={`Dari ${report?.paidOrdersCount || 0} pesanan yang telah lunas`}
          icon={Package}
          variant="accent"
        />
      </div>

      {/* Charts Section: Daily Sales Trend & Order Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tren Pendapatan Harian (Omzet Lunas)
              </h3>
              <p className="text-[11px] text-slate-400">
                Grafik akumulasi pendapatan uang kas masuk berdasarkan tanggal pesanan.
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
              Belum ada transaksi pada rentang periode ini.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={report.dailySales}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `Rp${val / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatRupiah(Number(value)), 'Omzet']}
                    labelFormatter={(label) => `Tanggal: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1E3A5F"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Order Source Breakdown */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Sumber Pemesanan</h3>
            <Layers size={16} className="text-primary-800" />
          </div>

          <div className="space-y-4 pt-2">
            {report?.orderSourceBreakdown.map((src) => {
              const totalRev = report.totalRevenue || 1;
              const pct = Math.round((src.revenue / totalRev) * 100);

              return (
                <div key={src.source} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{src.sourceLabel}</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatRupiah(src.revenue)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        src.source === 'public'
                          ? 'bg-blue-600'
                          : src.source === 'group_admin'
                          ? 'bg-emerald-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block text-right">
                    {src.count} pesanan
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Group Performance Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-primary-800" />
            <h3 className="text-base font-bold text-slate-900">
              Evaluasi Kinerja Seluruh Stan Kelompok
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Diurutkan berdasarkan perolehan omzet tertinggi
          </span>
        </div>

        {!report?.groupPerformance || report.groupPerformance.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Belum ada transaksi pesanan kelompok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Nama Stan Kelompok</th>
                  <th className="py-3 px-3 text-center">Pesanan Valid</th>
                  <th className="py-3 px-3 text-center">Pesanan Lunas</th>
                  <th className="py-3 px-3">Omzet Kas Lunas</th>
                  <th className="py-3 px-3">Piutang Belum Bayar</th>
                  <th className="py-3 px-3">Rasio Kas Terkumpul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.groupPerformance.map((gp) => (
                  <tr key={gp.groupId} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-bold text-slate-900">{gp.groupName}</td>
                    <td className="py-3 px-3 text-center tabular-nums text-slate-700">
                      {gp.totalOrders}
                    </td>
                    <td className="py-3 px-3 text-center tabular-nums font-semibold text-emerald-700">
                      {gp.paidOrders}
                    </td>
                    <td className="py-3 px-3 font-bold text-primary-950 tabular-nums">
                      {formatRupiah(gp.paidRevenue)}
                    </td>
                    <td className="py-3 px-3 text-rose-600 font-semibold tabular-nums">
                      {formatRupiah(gp.unpaidReceivable)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${gp.paidRatio}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 text-[11px] tabular-nums">
                          {gp.paidRatio}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top 10 Best Selling Products */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-primary-800" />
            <h3 className="text-base font-bold text-slate-900">
              10 Menu Produk Terlaris (Volume Terbanyak)
            </h3>
          </div>
        </div>

        {!report?.productPerformance || report.productPerformance.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Belum ada penjualan menu produk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center">No</th>
                  <th className="py-3 px-3">Nama Menu Produk</th>
                  <th className="py-3 px-3">Stan Kelompok</th>
                  <th className="py-3 px-3 text-center">Porsi Terjual</th>
                  <th className="py-3 px-3 text-right">Total Perolehan Omzet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.productPerformance.slice(0, 10).map((prod, idx) => (
                  <tr key={prod.productId} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{prod.productName}</td>
                    <td className="py-3 px-3 text-slate-600">{prod.groupName}</td>
                    <td className="py-3 px-3 text-center font-bold text-primary-900 tabular-nums">
                      {prod.totalQuantitySold} porsi
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
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
