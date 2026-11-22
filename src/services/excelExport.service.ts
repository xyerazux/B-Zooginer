// Service: ExcelJS Export for Financial and Sales Reports
// Project: B-Zooginer Pre-Order Platform
// Rules:
// - Professional formatting: Dark slate blue headers (#1E3A5F), currency formatting, summary rows
// - Double-checks that cancelled orders are excluded from revenue calculation

import type { ComprehensiveReportData } from '@/services/reports.service';

export interface ExportExcelOptions {
  reportData: ComprehensiveReportData;
  title?: string;
  scopeLabel?: string;
  generatedBy?: string;
  filterDescription?: string;
}

export async function exportReportToExcel({
  reportData,
  title = 'Laporan Transaksi Penjualan Pre-Order',
  scopeLabel = 'Semua Stan Kelompok',
  generatedBy = 'Administrator',
  filterDescription = 'Semua Periode',
}: ExportExcelOptions): Promise<void> {
  // Dynamic import to avoid bundling ExcelJS (~1.4 MB) in the main chunk
  const ExcelJSModule = await import('exceljs');
  const ExcelJS = ExcelJSModule.default || ExcelJSModule;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'B-Zooginer Platform';
  workbook.lastModifiedBy = generatedBy;
  workbook.created = new Date();

  const brandNavy = '1E3A5F';
  const brandAmber = 'F59E0B';
  const softGray = 'F8FAFC';
  const borderGray = 'E2E8F0';

  // ============================================================================
  // SHEET 1: DAFTAR TRANSAKSI LENGKAP
  // ============================================================================
  const sheet1 = workbook.addWorksheet('Daftar Transaksi', {
    views: [{ showGridLines: true }],
  });

  // 1. Report Title Header
  sheet1.mergeCells('A1:M1');
  const titleCell = sheet1.getCell('A1');
  titleCell.value = 'B-ZOOGINER PRE-ORDER PLATFORM';
  titleCell.font = { name: 'Arial', size: 13, bold: true, color: { argb: brandNavy } };

  sheet1.mergeCells('A2:M2');
  const subTitleCell = sheet1.getCell('A2');
  subTitleCell.value = `${title} — ${scopeLabel}`;
  subTitleCell.font = { name: 'Arial', size: 11, bold: true };

  sheet1.mergeCells('A3:M3');
  const metaCell = sheet1.getCell('A3');
  metaCell.value = `Dicetak Oleh: ${generatedBy} | Waktu Ekspor: ${new Date().toLocaleString(
    'id-ID'
  )} | Kriteria: ${filterDescription}`;
  metaCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: '64748B' } };

  // 2. Table Column Definitions
  const headers = [
    'No',
    'Kode Pesanan',
    'Tanggal Pesan',
    'Nama Pembeli',
    'Kelas',
    'Stan Kelompok',
    'Rincian Menu Produk (Varian)',
    'Total Porsi',
    'Metode Bayar',
    'Status Pembayaran',
    'Status Pesanan',
    'Sumber Pesanan',
    'Total Tagihan (Rp)',
  ];

  const headerRow = sheet1.getRow(5);
  headerRow.values = headers;
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: brandNavy },
    };
    cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // 3. Populate Rows
  const startRowIndex = 6;
  reportData.rawOrders.forEach((o, idx) => {
    const row = sheet1.getRow(startRowIndex + idx);
    const totalQty = (o.items || []).reduce(
      (acc, i) => acc + (i.quantity || 1),
      0
    );
    const itemSummary = (o.items || [])
      .map(
        (i) =>
          `${i.product_name_snapshot}${
            i.variant_snapshot ? ` (${i.variant_snapshot})` : ''
          } x${i.quantity}`
      )
      .join(', ');

    const sourceLabel =
      o.source === 'public'
        ? 'Publik / Web'
        : o.source === 'group_admin'
        ? 'Admin Stan'
        : 'Master Admin';

    const paymentLabel = o.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR';
    const orderStatusLabel =
      o.order_status === 'new'
        ? 'Pesanan Baru'
        : o.order_status === 'confirmed'
        ? 'Dikonfirmasi'
        : o.order_status === 'completed'
        ? 'Selesai'
        : 'Dibatalkan';

    row.values = [
      idx + 1,
      o.order_code,
      o.order_date || o.created_at.slice(0, 10),
      o.buyer_name,
      o.buyer_class,
      o.group?.name || 'Stan',
      itemSummary || 'Menu Produk',
      totalQty,
      o.payment_method === 'cash' ? 'Tunai' : 'Transfer',
      paymentLabel,
      orderStatusLabel,
      sourceLabel,
      Number(o.total || 0),
    ];

    row.height = 22;

    // Zebra striping
    const isEven = idx % 2 === 0;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 9 };
      cell.border = {
        top: { style: 'thin', color: { argb: borderGray } },
        bottom: { style: 'thin', color: { argb: borderGray } },
        left: { style: 'thin', color: { argb: borderGray } },
        right: { style: 'thin', color: { argb: borderGray } },
      };

      if (!isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: softGray },
        };
      }

      // Column specific alignment & formatting
      if (colNumber === 1 || colNumber === 8) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 2) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.font = { name: 'Courier New', bold: true, size: 9 };
      } else if (colNumber === 9 || colNumber === 10 || colNumber === 11 || colNumber === 12) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (colNumber === 10 && paymentLabel === 'LUNAS') {
          cell.font = { bold: true, color: { argb: '047857' } }; // emerald
        } else if (colNumber === 11 && orderStatusLabel === 'Dibatalkan') {
          cell.font = { color: { argb: 'BE123C' } }; // rose
        }
      } else if (colNumber === 13) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0';
        cell.font = { bold: true };
      } else {
        cell.alignment = { vertical: 'middle' };
      }
    });
  });

  // 4. Summary Row at Bottom
  const totalRows = reportData.rawOrders.length;
  const summaryRowIndex = startRowIndex + totalRows;
  const summaryRow = sheet1.getRow(summaryRowIndex);

  summaryRow.getCell(1).value = '';
  summaryRow.getCell(7).value = 'TOTAL KESELURUHAN (SEMUA PESANAN):';
  summaryRow.getCell(7).font = { name: 'Arial', size: 9, bold: true };
  summaryRow.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };

  // Total quantity sum
  const qtyCell = summaryRow.getCell(8);
  qtyCell.value = {
    formula: `SUM(H${startRowIndex}:H${summaryRowIndex - 1})`,
    result: reportData.totalItemsSold,
  };
  qtyCell.font = { name: 'Arial', size: 9, bold: true };
  qtyCell.numFmt = '#,##0';
  qtyCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Total amount sum
  const amountCell = summaryRow.getCell(13);
  amountCell.value = {
    formula: `SUM(M${startRowIndex}:M${summaryRowIndex - 1})`,
    result: reportData.totalRevenue + reportData.unpaidReceivable,
  };
  amountCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: brandNavy } };
  amountCell.numFmt = '#,##0';
  amountCell.alignment = { horizontal: 'right', vertical: 'middle' };

  summaryRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E2E8F0' },
    };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'double' },
    };
  });

  // Auto-fit column widths
  sheet1.columns = [
    { width: 5 },  // No
    { width: 18 }, // Kode
    { width: 14 }, // Tanggal
    { width: 20 }, // Pembeli
    { width: 14 }, // Kelas
    { width: 22 }, // Stan
    { width: 38 }, // Menu Produk
    { width: 12 }, // Total Porsi
    { width: 14 }, // Metode
    { width: 18 }, // Status Bayar
    { width: 16 }, // Status Pesanan
    { width: 16 }, // Sumber
    { width: 18 }, // Total
  ];

  // ============================================================================
  // SHEET 2: RINGKASAN EKSEKUTIF & KEUANGAN
  // ============================================================================
  const sheet2 = workbook.addWorksheet('Ringkasan Kinerja', {
    views: [{ showGridLines: true }],
  });

  // Sheet 2 Title
  sheet2.mergeCells('A1:G1');
  const s2Title = sheet2.getCell('A1');
  s2Title.value = 'RINGKASAN KEUANGAN & KINERJA OPERASIONAL';
  s2Title.font = { name: 'Arial', size: 13, bold: true, color: { argb: brandNavy } };

  // Box 1: KPI Metrics
  sheet2.getCell('A3').value = 'METRIK KEUANGAN & TRANSAKSI';
  sheet2.getCell('A3').font = { bold: true, size: 10, color: { argb: brandNavy } };

  const kpis = [
    ['Total Omzet Kas Lunas (Hanya Pesanan Lunas Valid)', reportData.totalRevenue, 'currency'],
    ['Total Piutang Belum Bayar (Menunggu Pembayaran)', reportData.unpaidReceivable, 'currency'],
    ['Total Nilai Transaksi Seluruh Pesanan Valid', reportData.totalRevenue + reportData.unpaidReceivable, 'currency'],
    ['Total Pesanan Lunas', reportData.paidOrdersCount, 'number'],
    ['Total Pesanan Belum Bayar', reportData.unpaidOrdersCount, 'number'],
    ['Total Pesanan Dibatalkan (Stok Dikembalikan)', reportData.cancelledOrdersCount, 'number'],
    ['Total Porsi Menu Makanan/Minuman Terjual', reportData.totalItemsSold, 'number'],
  ];

  kpis.forEach((kpi, kIdx) => {
    const row = sheet2.getRow(4 + kIdx);
    row.getCell(1).value = kpi[0];
    const valCell = row.getCell(3);
    valCell.value = Number(kpi[1]);
    valCell.font = { bold: true };
    if (kpi[2] === 'currency') {
      valCell.numFmt = '"Rp " #,##0';
    } else {
      valCell.numFmt = '#,##0';
    }
  });

  // Box 2: Top Best-Selling Products
  const prodStartRow = 13;
  sheet2.getCell(`A${prodStartRow}`).value = '10 MENU PRODUK TERLARIS (VOLUME PENJUALAN)';
  sheet2.getCell(`A${prodStartRow}`).font = { bold: true, size: 10, color: { argb: brandNavy } };

  const prodHeaderRow = sheet2.getRow(prodStartRow + 1);
  prodHeaderRow.values = ['Peringkat', 'Nama Menu Produk', 'Stan Kelompok', 'Porsi Terjual', 'Total Omzet (Rp)'];
  prodHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandNavy } };
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 9 };
    cell.alignment = { horizontal: 'center' };
  });

  reportData.productPerformance.slice(0, 10).forEach((p, pIdx) => {
    const pRow = sheet2.getRow(prodStartRow + 2 + pIdx);
    pRow.values = [pIdx + 1, p.productName, p.groupName, p.totalQuantitySold, p.totalRevenue];
    pRow.getCell(1).alignment = { horizontal: 'center' };
    pRow.getCell(4).numFmt = '#,##0';
    pRow.getCell(4).alignment = { horizontal: 'center' };
    pRow.getCell(5).numFmt = '"Rp " #,##0';
    pRow.getCell(5).font = { bold: true };
  });

  // Box 3: Daily Sales Trend
  const dailyStartRow = prodStartRow + 2 + Math.min(10, reportData.productPerformance.length) + 2;
  sheet2.getCell(`A${dailyStartRow}`).value = 'TREN PENJUALAN HARIAN';
  sheet2.getCell(`A${dailyStartRow}`).font = { bold: true, size: 10, color: { argb: brandNavy } };

  const dailyHeaderRow = sheet2.getRow(dailyStartRow + 1);
  dailyHeaderRow.values = ['Tanggal', 'Jumlah Transaksi', 'Porsi Terjual', 'Omzet Lunas (Rp)'];
  dailyHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: brandNavy } };
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 9 };
    cell.alignment = { horizontal: 'center' };
  });

  reportData.dailySales.forEach((d, dIdx) => {
    const dRow = sheet2.getRow(dailyStartRow + 2 + dIdx);
    dRow.values = [d.date, d.ordersCount, d.itemsCount, d.revenue];
    dRow.getCell(1).alignment = { horizontal: 'center' };
    dRow.getCell(2).numFmt = '#,##0';
    dRow.getCell(2).alignment = { horizontal: 'center' };
    dRow.getCell(3).numFmt = '#,##0';
    dRow.getCell(3).alignment = { horizontal: 'center' };
    dRow.getCell(4).numFmt = '"Rp " #,##0';
    dRow.getCell(4).font = { bold: true };
  });

  sheet2.columns = [
    { width: 40 },
    { width: 25 },
    { width: 22 },
    { width: 16 },
    { width: 20 },
  ];

  // ============================================================================
  // GENERATE BLOB & TRIGGER BROWSER DOWNLOAD
  // ============================================================================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeDate = new Date().toISOString().slice(0, 10);
  const safeScope = scopeLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.href = url;
  a.download = `Laporan_BZooginer_${safeScope}_${safeDate}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
