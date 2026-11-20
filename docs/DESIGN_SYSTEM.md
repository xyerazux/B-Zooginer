# B-Zooginer — Design System & UI/UX Specification

> Dokumen panduan resmi standar visual, tipografi, komponen, tata letak, dan interaksi untuk platform manajemen Pre-Order (PO) sekolah **B-Zooginer**.
> **Standar Bahasa:** Seluruh antarmuka pengguna (UI), teks tombol, badge status, formulir, pesan error, dan notifikasi wajib menggunakan **Bahasa Indonesia** yang baku, ringkas, dan profesional.

---

## Daftar Isi

1. [Identitas Merek (Brand Identity)](#1-identitas-merek-brand-identity)
2. [Palet Warna (Color Palette)](#2-palet-warna-color-palette)
3. [Tipografi (Typography)](#3-tipografi-typography)
4. [Sistem Spasi (Spacing System)](#4-sistem-spasi-spacing-system)
5. [Ikonografi (Iconography)](#5-ikonografi-iconography)
6. [Gaya & Pola Komponen (Component Styles)](#6-gaya--pola-komponen-component-styles)
   - [Tombol (Buttons)](#tombol-buttons)
   - [Lencana Status (Status Badges)](#lencana-status-status-badges)
   - [Kartu (Cards)](#kartu-cards)
   - [Pola Formulir (Form Patterns)](#pola-formulir-form-patterns)
   - [Tabel Data (Data Tables)](#tabel-data-data-tables)
   - [Notifikasi Toast & Dialog](#notifikasi-toast--dialog)
   - [Status Kosong & Pemuatan (Empty & Loading States)](#status-kosong--pemuatan-empty--loading-states)
7. [Desain Storefront Publik (Public Storefront)](#7-desain-storefront-publik-public-storefront)
   - [Beranda (Homepage)](#beranda-homepage)
   - [Halaman Stan / Kelompok (Group Detail)](#halaman-stan--kelompok-group-detail)
   - [Halaman Detail Produk & Selektor Varian](#halaman-detail-produk--selektor-varian)
   - [Formulir Pemesanan Publik (Public PO Form)](#formulir-pemesanan-publik-public-po-form)
   - [Halaman Konfirmasi Pesanan Terproteksi](#halaman-konfirmasi-pesanan-terproteksi)
8. [Desain Dashboard Master Admin](#8-desain-dashboard-master-admin)
   - [Navigasi & Tata Letak Master Admin](#navigasi--tata-letak-master-admin)
   - [Kartu Metrik & Grafik Analitik](#kartu-metrik--grafik-analitik)
   - [Alur Cepat Input Pesanan Manual](#alur-cepat-input-pesanan-manual)
   - [Manajemen Stan & Akun Admin](#manajemen-stan--akun-admin)
9. [Desain Dashboard Admin Kelompok (Group Admin)](#9-desain-dashboard-admin-kelompok-group-admin)
   - [Navigasi Terisolasi Admin Kelompok](#navigasi-terisolasi-admin-kelompok)
   - [Katalog Produk & Matriks Varian Multi-Dimensi](#katalog-produk--matriks-varian-multi-dimensi)
   - [Manajemen Pesanan & Konfirmasi Pembayaran Cepat](#manajemen-pesanan--konfirmasi-pembayaran-cepat)
   - [Laporan Penjualan & Ekspor Excel](#laporan-penjualan--ekspor-excel)
10. [Perilaku Responsif (Desktop, Tablet, Mobile)](#10-perilaku-responsif-desktop-tablet-mobile)
11. [Standar Rasio Aspek Gambar (Image Standards)](#11-standar-rasio-aspek-gambar-image-standards)
12. [Kamus Standar Bahasa UI (UI Copy Dictionary)](#12-kamus-standar-bahasa-ui-ui-copy-dictionary)
13. [Aturan Larangan Desain (Anti-patterns)](#13-aturan-larangan-desain-anti-patterns)

---

## 1. Identitas Merek (Brand Identity)

### 1.1 Esensi Merek
**B-Zooginer** adalah platform Pre-Order sekolah yang modern, berwibawa, dan efisien untuk mendukung kegiatan kewirausahaan siswa (bazaar, expo, dan proyek kelas). 

- **Kepribadian Merek:** Profesional, terorganisir, transparan, modern, dan mudah diakses oleh seluruh warga sekolah.
- **Tone of Voice:** Lugas, percaya diri, informatif, dan mengutamakan kejelasan alur transaksi finansial offline tanpa kerumitan teknis.
- **Diferensiasi:** Menghindari tampilan "dashboard template" yang generik. Memiliki kontras visual yang kuat antara area storefront publik yang menyegarkan dan area administratif yang terstruktur serta padat informasi (high information density).

---

## 2. Palet Warna (Color Palette)

Palet warna disusun menggunakan sistem token semantik Tailwind CSS yang konsisten di semua lingkungan.

### 2.1 Warna Utama (Brand Colors — Deep Slate Blue)
Warna biru berwibawa melambangkan stabilitas, keteraturan, dan institusi pendidikan formal.

| Token | Nilai Hex | Penggunaan Utama |
|---|---|---|
| `primary-900` | `#0F2340` | Judul gelap, navbar publik kontras tinggi |
| `primary-800` | `#1E3A5F` | **Warna Merek Utama**, tombol aksi primer admin, header sidebar |
| `primary-700` | `#2D5280` | Status hover tombol primer, elemen aktif sekunder |
| `primary-600` | `#3D6B9F` | Focus outline ring, tautan aktif, aksen border |
| `primary-100` | `#DDE8F5` | Background badge informasi, selektor aktif |
| `primary-50`  | `#EEF4FB` | Background baris tabel terpilih, tint area aktif |

### 2.2 Warna Aksen (Warm Amber)
Digunakan secara selektif untuk menarik perhatian pengunjung publik pada Call-To-Action (CTA) pembelian.

| Token | Nilai Hex | Penggunaan Utama |
|---|---|---|
| `accent-500` | `#F59E0B` | Tombol CTA utama di Beranda publik ("Pesan Sekarang", "Buka Stan") |
| `accent-400` | `#FBBF24` | Hover state tombol CTA aksen |
| `accent-100` | `#FEF3C7` | Background badge peringatan kuota terbatas |
| `accent-50`  | `#FFFBEB` | Background notifikasi penutupan PO |

### 2.3 Warna Netral & Permukaan (Neutral & Surface)

| Token | Tailwind | Nilai Hex | Penggunaan |
|---|---|---|---|
| `surface-page` | — | `#F8FAFC` | Latar belakang seluruh halaman aplikasi |
| `surface-card` | — | `#FFFFFF` | Permukaan kartu, panel, dan tabel |
| `neutral-900` | `slate-900` | `#0F172A` | Teks judul utama & angka metrik |
| `neutral-700` | `slate-700` | `#334155` | Teks isi (body copy), label formulir |
| `neutral-500` | `slate-500` | `#64748B` | Teks pendukung, placeholder, label non-aktif |
| `neutral-300` | `slate-300` | `#CBD5E1` | Garis batas (border) input, divider |
| `neutral-200` | `slate-200` | `#E2E8F0` | Garis batas kartu, pemisah baris tabel |
| `neutral-100` | `slate-100` | `#F1F5F9` | Latar selang-seling tabel, thumbnail container |

### 2.4 Status Semantik (Semantic Colors)

| Kategori | Latar (`bg-`) | Teks (`text-`) | Border (`border-`) | Arti Bisnis |
|---|---|---|---|---|
| **Sukses** | `#DCFCE7` (`green-100`) | `#15803D` (`green-700`) | `#86EFAC` | Pesanan Selesai / Pembayaran Sudah Lunas |
| **Peringatan** | `#FEF3C7` (`amber-100`) | `#B45309` (`amber-700`) | `#FCD34D` | Belum Bayar / Stok Menipis |
| **Bahaya / Error** | `#FEE2E2` (`red-100`) | `#B91C1C` (`red-700`) | `#FCA5A5` | Dibatalkan / Gagal Validasi / Stok Habis |
| **Informasi** | `#DBEAFE` (`blue-100`) | `#1D4ED8` (`blue-700`) | `#93C5FD` | Pesanan Baru / Menunggu Konfirmasi Stan |

---

## 3. Tipografi (Typography)

Sistem tipografi dirancang untuk keterbacaan optimal pada formulir padat dan ringkasan transaksi.

### 3.1 Font Stack
- **Huruf Utama (Sans-serif):** `Plus Jakarta Sans`, `Inter`, `sans-serif` (bersih, geometris, modern).
- **Huruf Monospace:** `JetBrains Mono`, `ui-monospace`, `monospace` (wajib untuk Kode Pesanan, Token Akses, dan Angka Transaksi).

### 3.2 Skala Hirarki Tipografi

| Nama Kelas | Ukuran | Bobot (Weight) | Leading | Penggunaan |
|---|---|---|---|---|
| `text-display` | 2.25rem (36px) | 700 (Bold) | 1.2 | Hero Title Storefront Publik |
| `text-h1` | 1.875rem (30px) | 700 (Bold) | 1.25 | Judul Halaman Utama Admin |
| `text-h2` | 1.5rem (24px) | 600 (Semibold) | 1.3 | Judul Seksi, Nama Stan / Kelompok |
| `text-h3` | 1.25rem (20px) | 600 (Semibold) | 1.4 | Judul Kartu Produk, Modal Title |
| `text-body` | 0.875rem (14px) | 400 (Regular) | 1.5 | Teks Konten, Deskripsi Produk |
| `text-body-bold` | 0.875rem (14px) | 600 (Semibold) | 1.5 | Penekanan, Nilai Kolom Tabel |
| `text-caption` | 0.75rem (12px) | 500 (Medium) | 1.4 | Label Form, Status Badge, Keterangan |
| `text-code` | 0.8125rem (13px)| 500 (Medium) | 1.4 | `BZG-20261121-XXXX`, Token, SKU |

---

## 4. Sistem Spasi (Spacing System)

Berbasis unit **4px** (`rem` Tailwind standar):
- **Micro (4px - 8px):** Jarak ikon dan label, padding badge internal (`gap-1.5`, `py-1 px-2.5`).
- **Form Spacing (12px - 16px):** Jarak antar input field (`gap-4`, `space-y-4`).
- **Card Padding (16px - 24px):** Padding isi kartu dan modal dialog (`p-4` di mobile, `p-6` di desktop).
- **Section Gap (32px - 48px):** Pemisah antar seksi beranda dan dashboard (`space-y-8`, `gap-8`).

---

## 5. Ikonografi (Iconography)

Menggunakan pustaka **Lucide React** secara konsisten. Dilarang keras menggunakan Emoji sebagai ikon fungsional.

| Fungsi / Fitur | Komponen Lucide | Ukuran Standar |
|---|---|---|
| Pesanan Baru | `<Clock />` | 14px (badge), 18px (nav) |
| Pesanan Dikonfirmasi | `<CheckCircle2 />` | 14px (badge), 18px (aksi) |
| Pesanan Dibatalkan | `<XCircle />` | 14px (badge), 18px (aksi) |
| Pesanan Selesai | `<PackageCheck />` | 14px (badge), 18px (aksi) |
| Pembayaran Belum Lunas | `<AlertCircle />` | 14px (badge), 18px (tabel) |
| Pembayaran Lunas | `<BadgeCheck />` | 14px (badge), 18px (tabel) |
| Input Pesanan Cepat | `<PlusCircle />` / `<Zap />` | 18px |
| Unduh Excel | `<FileSpreadsheet />` | 18px |
| Matriks Varian | `<Layers />` / `<SlidersHorizontal />`| 18px |
| Salin Token / Kode | `<Copy />` / `<Check />` | 16px |

---

## 6. Gaya & Pola Komponen (Component Styles)

### Tombol (Buttons)
Semua tombol memiliki tinggi minimum 40px pada desktop dan 44px pada layar sentuh (touch target compliant).

```tsx
// Varian Tombol Primer (Admin)
<button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-800 hover:bg-primary-700 active:bg-primary-900 rounded-md transition-colors focus:ring-2 focus:ring-primary-600 focus:outline-none disabled:opacity-50">
  <Save size={16} /> Simpan Perubahan
</button>

// Varian Tombol Aksen (Publik CTA)
<button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-slate-900 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 rounded-md shadow-sm transition-colors focus:ring-2 focus:ring-amber-500">
  <ShoppingBag size={18} /> Pesan Pre-Order
</button>
```

### Lencana Status (Status Badges)

```tsx
// Badge Status Pesanan
// BARU | DIKONFIRMASI | DIBATALKAN | SELESAI
const orderBadgeMap = {
  new: { label: 'Pesanan Baru', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
  confirmed: { label: 'Dikonfirmasi', cls: 'bg-slate-100 text-slate-800 border-slate-300', icon: CheckCircle2 },
  cancelled: { label: 'Dibatalkan', cls: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  completed: { label: 'Selesai', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: PackageCheck },
};

// Badge Status Pembayaran
// BELUM_BAYAR | SUDAH_BAYAR
const paymentBadgeMap = {
  unpaid: { label: 'Belum Bayar', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
  paid: { label: 'Lunas', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: BadgeCheck },
};
```

### Kartu (Cards)
- **Kartu Produk (Rasio 1:1):** Bingkai `border border-slate-200 bg-white rounded-lg overflow-hidden`, rasio gambar tepat 1:1 dengan `aspect-square overflow-hidden`, nama produk, harga dasar (atau harga varian terendah), label stan.
- **Kartu Stan / Kelompok (Rasio 4:5):** Poster promosi berasio 4:5 (`aspect-[4/5]`), pill status PO di sudut kanan atas (`PO DIBUKA`, `SEGERA HADIR`, `DITUTUP`), logo stan 1:1 bulat, nama kelompok, deskripsi singkat, tombol "Kunjungi Stan".
- **Kartu Metrik Dashboard (Stat Card):** Border tunggal, padding `p-5`, ikon dalam container aksen pastel (`bg-primary-50 text-primary-800`), angka nilai tebal `text-2xl font-bold`, label kategori huruf kapital `text-xs uppercase tracking-wide text-slate-500`.

### Pola Formulir (Form Patterns)
- **Struktur Standar:** Label di atas input (`block text-sm font-medium text-slate-700 mb-1.5`), tanda bintang merah untuk wajib (`text-red-500 *`), input dengan focus ring jelas (`focus:ring-2 focus:ring-primary-600 focus:border-transparent`), pesan kesalahan di bawah input dengan ikon `<AlertCircle size={12} />` berwarna merah.
- **Formulir Bertingkat (Fieldset Group):** Menggunakan `<fieldset>` dengan `<legend>` yang memiliki garis bawah pemisah (`border-b border-slate-200 pb-2 text-sm font-semibold text-slate-900`) untuk memisahkan bagian Informasi Pembeli, Pilihan Item, dan Metode Pembayaran.

### Tabel Data (Data Tables)
- **Desktop:** Tampilan tabel penuh dengan baris alternating atau border halus, header berlatar `bg-slate-50` dengan kontrol pengurutan (sorting), kode pesanan dalam font monospace (`font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded`), sel aksi dengan tombol dropdown atau tombol langsung.
- **Mobile (< 768px):** Tabel runtuh secara otomatis menjadi Kartu Bertumpuk (Stacked Cards), menampilkan Nama Pembeli, Kode Pesanan, Ringkasan Item, Total Harga, serta tombol aksi cepat (Konfirmasi/Bayar) tanpa perlu geser horizontal.

### Notifikasi Toast & Dialog
- **Toast:** Pustaka `sonner`. Pojok kanan atas pada desktop, bagian bawah tengah pada mobile. Wajib berbahasa Indonesia informatif (contoh: "Pesanan Berhasil Disimpan", "Pembayaran Telah Dikonfirmasi Lunas").
- **Modal Dialog (Radix UI / shadcn):** Dialog konfirmasi pembatalan atau konfirmasi pembayaran lunas memiliki penekanan warna yang jelas: Tombol "Batal" (Ghost) di sebelah kiri, Tombol "Konfirmasi" (Primer/Destructive) di sebelah kanan.

### Status Kosong & Pemuatan (Empty & Loading States)
- **Empty State:** Tidak pernah menampilkan layar putih polos. Menampilkan ilustrasi/ikon Lucide abu-abu besar (48px), judul kondisi ("Belum Ada Pesanan Masuk"), deskripsi penjelasan yang bersahabat, dan tombol aksi opsional jika relevan ("Buat Pesanan Baru").
- **Loading State:** Dilarang menggunakan spinner lingkaran penuh untuk konten data. Gunakan **Skeleton Loader** dengan animasi `animate-pulse` yang meniru bentuk baris tabel atau kartu produk.

---

## 7. Desain Storefront Publik (Public Storefront)

Storefront dirancang untuk mempermudah siswa, guru, dan orang tua memesan tanpa keharusan membuat akun (anonymous access).

### 7.1 Beranda (Homepage)
- **Header Navigasi:** Logo B-Zooginer, nama sekolah/kegiatan, tombol tautan "Lacak Pesanan" (dialog memasukkan Kode Pesanan + Token Akses).
- **Hero Section:** Banner selamat datang, periode kegiatan kewirausahaan, Call-To-Action utama "Jelajahi Stan Kelas".
- **Katalog Stan (Group Directory):** Grid responsif kartu stan (poster 4:5, logo bulat, nama stan, status PO: `PO DIBUKA`, `SEGERA HADIR`, `PO DITUTUP`, jumlah produk aktif).

### 7.2 Halaman Stan / Kelompok (Group Detail)
- **Header Stan:** Banner stan, foto poster promosi, kontak WhatsApp perwakilan stan, keterangan jam pengambilan pesanan.
- **Daftar Produk:** Grid kartu produk (rasio 1:1), label harga awal ("Mulai dari Rp XX.XXX"), status ketersediaan stok atau batas maksimal PO.

### 7.3 Halaman Detail Produk & Selektor Varian Multi-Dimensi
Produk mendukung banyak dimensi varian sekaligus (contoh: **Ukuran: S/M/L** dan **Rasa: Cokelat/Keju/Matcha**).
- **Komponen Selektor Interaktif:** Tombol pill radio grup per dimensi varian (misal: Grup 1: Ukuran, Grup 2: Rasa).
- **Kalkulasi Harga Real-time:** Menampilkan harga final otomatis (`Harga Dasar + Penyesuaian Varian`).
- **Indikator Stok Otomatis:** Jika stok per kombinasi varian dilacak, tombol varian yang habis dinonaktifkan dengan tanda coret dan label "Habis".

### 7.4 Formulir Pemesanan Publik (Public PO Form)
Formulir satu halaman (single-page) yang ringkas dan ramah jempol smartphone:
1. **Identitas Pemesan:**
   - Nama Lengkap (Wajib, teks)
   - Kelas (Wajib, dropdown pilihan kelas sekolah atau input teks, misal: "XII MIPA 2")
   - Nomor WhatsApp (Opsional, untuk konfirmasi pengambilan)
2. **Ringkasan Item Pesanan:** Nama produk terpilih, kombinasi varian (misal: "Ukuran: L, Rasa: Cokelat"), jumlah unit (stepper input `[-] 1 [+]`).
3. **Pilihan Metode Bayar:**
   - `TUNAI` (Bayar langsung di stan saat pengambilan / roadshow kelas).
   - `TRANSFER` (Instruksi rekening bank / QRIS stan yang akan ditampilkan di konfirmasi).
4. **Tombol Kirim Pesanan:** Menampilkan total bayar tebal `Kirim Pesanan (Rp XX.XXX)`.

### 7.5 Halaman Konfirmasi Pesanan Terproteksi
- **URL Route:** `/order/success/:orderCode?token=<access_token>`
- **Prinsip Keamanan Data:** Anonimitas pengunjung tetap terjaga, namun rincian pesanan pemesan (nama, kelas, nomor WA, rincian barang) **tidak dapat diintip oleh orang lain** hanya dengan menebak `order_code`. Halaman wajib memvalidasi kecocokan `order_code` dan `access_token` berentropi tinggi via RPC server-side.
- **Tampilan Informasi:**
  - Kode Pesanan tebal dengan tombol salin cepat (`BZG-20261121-XXXX`).
  - Badge Status Pembayaran: `Belum Bayar` dengan catatan petunjuk pembayaran.
  - Kartu Instruksi Pengambilan: Lokasi stan kelompok, perkiraan tanggal/jam pengambilan.
  - Tombol aksi: "Simpan Tautan Konfirmasi" dan "Kembali ke Beranda".

---

## 8. Desain Dashboard Master Admin

Dashboard Master Admin difokuskan pada pengawasan makro seluruh stan, intervensi pesanan roadshow kelas, dan ekspor data finansial.

### 8.1 Navigasi & Tata Letak Master Admin
- **Sidebar Kiri (Desktop w-60):**
  1. Ringkasan Platform (`/admin`)
  2. Kelola Stan Kelompok (`/admin/groups`)
  3. Kelola Akun Admin Stan (`/admin/admins`)
  4. Semua Produk (`/admin/products`)
  5. Semua Pesanan (`/admin/orders`)
  6. **Input Pesanan Manual** (`/admin/orders/new`)
  7. Kelola Pembayaran (`/admin/payments`)
  8. Laporan & Statistik (`/admin/reports`)
  9. Ekspor Excel (`/admin/export`)
  10. Pengaturan Web (`/admin/settings`)
  11. Log Aktivitas (`/admin/logs`)
  12. Pengaturan Akun (`/admin/account`)
- **Top Bar:** Breadcrumb navigasi, indikator role "Master Admin", menu profil dan tombol keluar (Logout).

### 8.2 Kartu Metrik & Grafik Analitik
Menampilkan 8 KPI utama berbasis data aktual:
1. Total Kelompok / Stan
2. Stan Terbit (Aktif Publik)
3. Total Produk Terdaftar
4. Total Seluruh Pesanan
5. Total Omzet Terbayar (Lunas)
6. Total Piutang (Belum Bayar)
7. Pesanan Masuk Hari Ini
8. Stan Penjualan Tertinggi

Grafik Recharts:
- Diagram Batang Komparasi Omzet Antar Stan.
- Grafik Garis Tren Pesanan Masuk Harian.

### 8.3 Alur Cepat Input Pesanan Manual (Roadshow Kelas)
Dirancang khusus untuk Master Admin yang berkeliling ke ruang kelas mencatat pesanan siswa:
- Pilihan Stan Kelompok (Searchable Dropdown).
- Pilihan Produk (Otomatis terfilter hanya produk milik kelompok terpilih).
- Pilihan Dimensi Varian Produk (Ukuran, Rasa, dll.).
- Input Jumlah Qty (Default 1).
- Input Nama Pembeli & Kelas (Auto-focus, keyboard navigation friendly).
- Nomor WhatsApp (Opsional).
- Metode Bayar (Tunai / Transfer).
- Status Awal Pembayaran (Bisa langsung ditandai `Lunas` jika siswa langsung membayar tunai di kelas).
- Tombol shortcut submit (`Ctrl + Enter` / Tombol Simpan & Tambah Baru).

---

## 9. Desain Dashboard Admin Kelompok (Group Admin)

Dashboard Admin Kelompok terisolasi penuh via Row Level Security (RLS) hanya untuk mengelola kelompoknya sendiri.

### 9.1 Navigasi Terisolasi Admin Kelompok
- **Sidebar Kiri:**
  1. Ringkasan Kelompok (`/dashboard`)
  2. Kelola Produk (`/dashboard/products`)
  3. Tambah Produk Baru (`/dashboard/products/new`)
  4. Pesanan Masuk (`/dashboard/orders`)
  5. Input Pesanan Manual (`/dashboard/orders/new`)
  6. Konfirmasi Pembayaran (`/dashboard/payments`)
  7. Laporan Penjualan (`/dashboard/reports`)
  8. Ekspor Excel Kelompok (`/dashboard/export`)
  9. Pengaturan Stan (`/dashboard/settings`)
  10. Akun Saya (`/dashboard/account`)

### 9.2 Katalog Produk & Matriks Varian Multi-Dimensi
- Antarmuka pembuatan dimensi varian yang fleksibel: Admin kelompok dapat menambah dimensi (misal: "Ukuran", "Rasa", "Model").
- Sistem mengenerasi tabel matriks kombinasi secara otomatis dengan input individual untuk selisih harga (`price_adjustment`) dan stok tersedia (`stock`).

### 9.3 Manajemen Pesanan & Konfirmasi Pembayaran Cepat
- Tabel pesanan dengan filter status: `Semua`, `Baru`, `Dikonfirmasi`, `Belum Bayar`, `Lunas`.
- Tombol Aksi 1-Klik: "Konfirmasi Lunas" (dengan dialog verifikasi cepat tanpa perlu reload).
- Tombol "Ubah Status Pesanan": Menjadi `Dikonfirmasi`, `Selesai`, atau `Dibatalkan`.

### 9.4 Laporan Penjualan & Ekspor Excel
- Ringkasan pendapatan bersih kelompok, jumlah produk terjual per varian.
- Tombol Ekspor Excel menghasilkan berkas `.xlsx` terstruktur rapi dengan header berbahasa Indonesia dan format mata uang Rupiah (`Rp #.##0`).

---

## 10. Perilaku Responsif (Desktop, Tablet, Mobile)

Aplikasi wajib diuji dan berfungsi sempurna pada seluruh ukuran layar:

| Perangkat | Resolusi | Perilaku Navigasi & Tabel | Tata Letak Konten |
|---|---|---|---|
| **Ponsel Pintar (Mobile)** | < 640px | Sidebar admin menjadi Drawer Sheet (hamburger). Tabel pesanan runtuh menjadi tampilan Kartu Bertumpuk (Stacked Cards). | 1 Kolom penuh, padding horizontal `px-4`, ukuran touch target minimal 44px. |
| **Tablet / iPad** | 640px – 1023px | Sidebar admin dapat disembunyikan/slide drawer. Tabel mengaktifkan scroll horizontal mulus dengan header beku (sticky). | Grid 2 Kolom untuk kartu produk dan stat card. |
| **Desktop & Laptop** | ≥ 1024px | Sidebar admin tetap (fixed width `w-60`). Seluruh kolom tabel data tampil penuh dengan fitur sort & filter interaktif. | Grid 3–4 Kolom untuk produk dan ringkasan metrik. Kontainer utama `max-w-7xl`. |

---

## 11. Standar Rasio Aspek Gambar (Image Standards)

Semua kontainer gambar wajib menggunakan class rasio aspek eksplisit untuk mencegah Content Layout Shift (CLS) dan distorsi gambar.

| Jenis Berkas | Resolusi Rekomendasi | Rasio Aspek | Batas Ukuran | Format Berkas |
|---|---|---|---|---|
| **Poster Promosi Stan** | 1200 × 1500 px | **4:5** (`aspect-[4/5]`) | Maks 2 MB | WebP / JPEG / PNG |
| **Foto Produk** | 1200 × 1200 px | **1:1** (`aspect-square`) | Maks 2 MB | WebP / JPEG / PNG |
| **Banner Hero Beranda** | 1920 × 700 px | **~2.74:1** (`aspect-[1920/700]`) | Maks 2 MB | WebP / JPEG / PNG |
| **Logo Stan / Sekolah** | 512 × 512 px | **1:1** (`rounded-full`) | Maks 512 KB | WebP / PNG / SVG |

---

## 12. Kamus Standar Bahasa UI (UI Copy Dictionary)

Seluruh komponen wajib mengacu pada tabel terminologi berikut:

| Konsep / Istilah Asli | Istilah Standar UI (Bahasa Indonesia) |
|---|---|
| Home | Beranda |
| Pre-Order (PO) | Pre-Order (PO) / Pemesanan Awal |
| Groups / Booths | Stan Kelompok / Kelompok Siswa |
| Products | Produk |
| Variants (Size, Flavor) | Varian (Ukuran, Rasa, dll.) |
| Orders | Pesanan |
| Order Code | Kode Pesanan |
| Access Token | Token Akses Keamanan |
| Payment Status: UNPAID | Belum Bayar |
| Payment Status: PAID | Lunas (Sudah Bayar) |
| Order Status: NEW | Pesanan Baru |
| Order Status: CONFIRMED | Dikonfirmasi |
| Order Status: CANCELLED | Dibatalkan |
| Order Status: COMPLETED | Selesai |
| Payment Method: CASH | Tunai |
| Payment Method: TRANSFER | Transfer Bank / QRIS |
| PO Status: OPEN | PO Dibuka |
| PO Status: COMING SOON | Segera Hadir |
| PO Status: CLOSED | PO Ditutup |
| Submit Order | Kirim Pesanan |
| Manual Order Entry | Input Pesanan Manual |
| Export to Excel | Ekspor ke Excel |
| Activity Logs | Log Aktivitas |
| Search Placeholder | Cari nama pembeli, kelas, atau kode pesanan... |
| Empty Order Title | Belum Ada Pesanan Masuk |
| Empty Order Description | Pesanan yang dibuat oleh publik atau input manual akan muncul di sini. |

---

## 13. Aturan Larangan Desain (Anti-patterns)

1. **Dilarang memakai teks bahasa Inggris pada antarmuka pengguna** kecuali istilah teknis yang lazim (seperti `Excel`, `WhatsApp`, `QRIS`, `Pre-Order / PO`).
2. **Dilarang memakai bayangan tebal yang berlebihan** (`shadow-2xl`) pada kartu. Gunakan border halus `border-slate-200` pada latar belakang `bg-white`.
3. **Dilarang memakai sudut lengkung berlebih** (`rounded-3xl` pada kartu umum). Pertahankan `rounded-lg` atau `rounded-md` agar terlihat profesional dan rapi.
4. **Dilarang meregangkan foto produk atau poster stan.** Wajib menggunakan `object-cover` di dalam kontainer berasio pasti.
5. **Dilarang menggunakan spinner lingkaran penuh untuk loading konten halaman.** Gunakan **Skeleton Loader** beranimasi halus (`animate-pulse`) yang menyerupai bentuk kartu atau tabel data.
