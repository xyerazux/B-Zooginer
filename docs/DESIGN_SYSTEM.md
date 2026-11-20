# B-Zooginer — Design System & UI/UX Specification

> **Dokumen Resmi Standar Identitas Visual, Arsitektur UI/UX, dan Spesifikasi Komponen Platform B-Zooginer.**
> **Versi:** 2.0 (Fase 2 — Brand Identity & UI/UX Design)
> **Standar Bahasa:** Seluruh antarmuka pengguna (UI), teks tombol, badge status, formulir, pesan validasi, dialog konfirmasi, dan notifikasi wajib menggunakan **Bahasa Indonesia** yang formal, ringkas, profesional, dan ramah pengguna.

---

## Daftar Isi

1. [Identitas Merek & Arah Visual (Brand Identity & Creative Direction)](#1-identitas-merek--arah-visual)
2. [Palet Warna & Token Semantik (Color Palette)](#2-palet-warna--token-semantik)
3. [Sistem Tipografi & Hirarki Teks (Typography)](#3-sistem-tipografi--hirarki-teks)
4. [Sistem Spasi, Sudut, Batas & Elevasi (Spacing, Radii & Surfaces)](#4-sistem-spasi-sudut-batas--elevasi)
5. [Ikonografi & Aset Visual (Iconography)](#5-ikonografi--aset-visual)
6. [Standar Dimensi & Rasio Gambar (Image Standards)](#6-standar-dimensi--rasio-gambar)
7. [Spesifikasi Komponen Inti Dapat Digunakan Kembali (Core Reusable Components)](#7-spesifikasi-komponen-inti)
8. [Desain Antarmuka Publik (Section A: Public Website)](#8-desain-antarmuka-publik-section-a)
   - 8.1 [Beranda (Homepage)](#81-beranda-homepage)
   - 8.2 [Direktori / Daftar Stan (Group Listing)](#82-direktori--daftar-stan-group-listing)
   - 8.3 [Halaman Profil & Menu Stan (Group Detail)](#83-halaman-profil--menu-stan-group-detail)
   - 8.4 [Halaman Detail Produk & Selektor Varian](#84-halaman-detail-produk--selektor-varian)
   - 8.5 [Formulir Pemesanan Publik (Public PO Form)](#85-formulir-pemesanan-publik-public-po-form)
   - 8.6 [Halaman Sukses & Konfirmasi Pesanan Terproteksi](#86-halaman-sukses--konfirmasi-pesanan-terproteksi)
   - 8.7 [Navigasi Ponsel Pintar (Mobile Navigation)](#87-navigasi-ponsel-pintar-mobile-navigation)
   - 8.8 [Footer / Kaki Halaman Publik](#88-footer--kaki-halaman-publik)
9. [Desain Dashboard Master Admin (Section B: Master Admin)](#9-desain-dashboard-master-admin-section-b)
   - 9.1 [Ringkasan Platform & KPI Global (Dashboard Overview)](#91-ringkasan-platform--kpi-global)
   - 9.2 [Manajemen Stan / Kelompok (Group Management)](#92-manajemen-stan--kelompok)
   - 9.3 [Manajemen Akun Administrator Stan (Admin Management)](#93-manajemen-akun-administrator-stan)
   - 9.4 [Tabel Semua Pesanan (All Orders Management)](#94-tabel-semua-pesanan)
   - 9.5 [Alur Cepat Input Pesanan Manual Roadshow (Manual Order Form)](#95-alur-cepat-input-pesanan-manual-roadshow)
   - 9.6 [Manajemen & Verifikasi Pembayaran (Payment Management)](#96-manajemen--verifikasi-pembayaran)
   - 9.7 [Laporan Agregasi & Ekspor Excel (Reports & Export)](#97-laporan-agregasi--ekspor-excel)
10. [Desain Dashboard Admin Kelompok (Section C: Group Admin)](#10-desain-dashboard-admin-kelompok-section-c)
    - 10.1 [Ringkasan Kinerja Stan (Group Dashboard Overview)](#101-ringkasan-kinerja-stan)
    - 10.2 [Katalog Produk Stan (Product Management)](#102-katalog-produk-stan)
    - 10.3 [Editor Produk & Pengunggah Gambar (Product Editor & Image Upload)](#103-editor-produk--pengunggah-gambar)
    - 10.4 [Matriks Varian Multi-Dimensi (Variant Management Matrix)](#104-matriks-varian-multi-dimensi)
    - 10.5 [Kelola Pesanan Masuk Stan (Order Management)](#105-kelola-pesanan-masuk-stan)
    - 10.6 [Input Pesanan Manual Stan (Manual Order Form)](#106-input-pesanan-manual-stan)
    - 10.7 [Konfirmasi Pembayaran Kasir Stan (Payment Confirmation)](#107-konfirmasi-pembayaran-kasir-stan)
    - 10.8 [Laporan Penjualan & Ekspor Excel Kelompok (Group Reports & Export)](#108-laporan-penjualan--ekspor-excel-kelompok)
11. [Matriks Perilaku Responsif & Adaptasi Perangkat](#11-matriks-perilaku-responsif--adaptasi-perangkat)
12. [Spesifikasi Status Antarmuka (Loading, Empty, Success, Error States)](#12-spesifikasi-status-antarmuka)
13. [Kamus Standar Bahasa UI & Konten Contoh Indonesia](#13-kamus-standar-bahasa-ui--konten-contoh-indonesia)
14. [Aturan Larangan & Anti-Pola Desain (Anti-Patterns)](#14-aturan-larangan--anti-pola-desain)

---

## 1. Identitas Merek & Arah Visual

### 1.1 Filosofi Nama Merek
Nama **B-Zooginer** merupakan perpaduan dinamis dari:
- **"B" / "Be"**: Panggilan aksi untuk bertindak aktif, berinisiatif, dan berani berwirausaha.
- **"Zooginer"** *(diadaptasi dari konsep Bazaar Originator / Designer)*: Penggagas stan bazar yang kreatif, mandiri, dan berjiwa kepemimpinan.

### 1.2 Karakteristik Visual Utama
B-Zooginer dirancang untuk memecahkan kelemahan tampilan platform web generasi awal sekolah yang kaku, serta secara tegas **menolak estetika template kecerdasan buatan (AI-generated generic template)** seperti gradasi ungu mencolok, kartu melayang tanpa batas, atau efek kaca (glassmorphism) yang menurunkan keterbacaan.

| Karakteristik | Wujud Nyata dalam Desain |
|---|---|
| **Modern & Minimal** | Komposisi ruang bernapas longgar, tata letak berbasis grid ketat 4px, fokus mutlak pada konten produk dan angka transaksi. |
| **Clean & Bersih** | Menggunakan latar belakang netral abu-abu terang (`#F8FAFC`), permukaan kartu putih murni (`#FFFFFF`), dan garis batas tunggal (`#E2E8F0`). |
| **Elegan & Proporsional** | Sudut lengkung terukur (`rounded-md` untuk tombol/input, `rounded-lg` untuk panel utama). Tidak ada sudut squircle berlebihan. |
| **Berjiwa Muda namun Profesional** | Perpaduan warna biru wibawa (*Deep Slate Blue*) yang melambangkan tata kelola keuangan sekolah yang dapat dipercaya, dipadukan dengan aksen jingga hangat (*Warm Amber*) untuk menarik minat belanja siswa. |
| **Mudah Digunakan (Frictionless)** | Alur pemesanan publik tanpa registrasi akun (*anonymous public order*), pemilihan varian dengan tombol pil satu ketukan, dan pengisian cepat form roadshow kelas dengan keyboard shortcut. |

---

## 2. Palet Warna & Token Semantik

Sistem warna dibangun di atas skala Tailwind CSS yang dikalibrasi secara presisi guna memenuhi standar aksesibilitas WCAG 2.1 AA (kontras rasio minimal 4.5:1 untuk teks biasa dan 3:1 untuk teks tebal/komponen grafis).

### 2.1 Warna Utama (Brand Primary — Deep Slate Blue)
Mewakili keandalan, struktur formal sekolah, dan integritas pencatatan kas. Digunakan pada navbar publik, sidebar navigasi admin, tombol aksi utama di dashboard, dan judul utama.

| Token Warna | Nilai Hex | Penggunaan Utama | Rasio Kontras pada Putih |
|---|---|---|---|
| `primary-950` | `#081326` | Teks judul utama kontras tertinggi, latar header gelap | 16.4 : 1 (Pass AAA) |
| `primary-900` | `#0F2340` | Header navbar publik, sidebar latar admin | 13.8 : 1 (Pass AAA) |
| `primary-800` | `#1E3A5F` | **Warna Merek Utama**, tombol aksi primer admin, ikon aktif | 9.6 : 1 (Pass AAA) |
| `primary-700` | `#2B5387` | Status hover tombol primer, teks link penekanan | 6.8 : 1 (Pass AA) |
| `primary-600` | `#3D6EAF` | Ring outline focus, garis batas aksen seleksi | 4.6 : 1 (Pass AA) |
| `primary-200` | `#BFD6F3` | Border penanda seleksi varian aktif | — |
| `primary-100` | `#DFEDFD` | Background badge informasi, tint kartu aktif | — |
| `primary-50`  | `#F0F6FE` | Background baris tabel terpilih, hover baris tabel | — |

### 2.2 Warna Aksen (Brand Accent — Warm Amber)
Mewakili energi bazar, kehangatan kuliner, dan daya pikat belanja. Khusus digunakan pada elemen Call-To-Action (CTA) di storefront publik agar segera disadari oleh mata pengunjung.

| Token Warna | Nilai Hex | Penggunaan Utama |
|---|---|---|
| `accent-600` | `#D97706` | Status hover tombol CTA aksen |
| `accent-500` | `#F59E0B` | **Tombol CTA Publik Utama** ("Pesan Sekarang", "Kirim Pesanan", "Buka Menu") |
| `accent-400` | `#FBBF24` | Sorotan badge promosi dan kuota terbatas |
| `accent-100` | `#FEF3C7` | Background badge status "Belum Bayar" / "Segera Hadir" |
| `accent-50`  | `#FFFBEB` | Background kotak pengumuman dan peringatan ramah |

### 2.3 Permukaan & Skala Netral (Neutral Surfaces)
Didesain untuk mencegah kelelahan mata (*eye fatigue*) saat admin memproses puluhan pesanan di kelas.

| Token | Nilai Hex | Penerapan Antarmuka |
|---|---|---|
| `surface-canvas` | `#F8FAFC` (`slate-50`) | Latar belakang seluruh layar aplikasi (body background) |
| `surface-card` | `#FFFFFF` (`white`) | Panel, kartu produk, kartu metrik, baris tabel, dialog modal |
| `surface-muted` | `#F1F5F9` (`slate-100`)| Header tabel, latar belakang badge abu-abu, container kode mono |
| `neutral-900` | `#0F172A` (`slate-900`)| Teks judul halaman, nilai nominal Rupiah tebal, header kolom |
| `neutral-700` | `#334155` (`slate-700`)| Teks isi utama (body text), label input formulir |
| `neutral-500` | `#64748B` (`slate-500`)| Teks pendukung, placeholder form, deskripsi kosong |
| `neutral-300` | `#CBD5E1` (`slate-300`)| Garis batas input saat pasif, separator sekunder |
| `neutral-200` | `#E2E8F0` (`slate-200`)| Garis batas kartu, garis pembatas baris tabel (divider) |

### 2.4 Status Semantik Sistem (Semantic Status Colors)

```
+-----------------------------------------------------------------------------------------+
| Status Transaksi       | Latar Belakang (bg) | Teks & Ikon (text)   | Garis Batas (border)  |
|------------------------+---------------------+----------------------+-----------------------|
| Sukses / Lunas         | #DCFCE7 (emerald-50)| #15803D (emerald-700)| #86EFAC (emerald-300) |
| Menunggu / Belum Bayar | #FEF3C7 (amber-50)  | #B45309 (amber-700)  | #FCD34D (amber-300)   |
| Dibatalkan / Gagal     | #FEE2E2 (rose-50)   | #B91C1C (rose-700)   | #FCA5A5 (rose-300)    |
| Pesanan Baru           | #EFF6FF (blue-50)   | #1D4ED8 (blue-700)   | #93C5FD (blue-300)    |
| Dikonfirmasi Stan      | #F1F5F9 (slate-100) | #334155 (slate-700)  | #CBD5E1 (slate-300)   |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Sistem Tipografi & Hirarki Teks

### 3.1 Pilihan Font Family
1. **Font UI Utama (Sans-serif):** `Plus Jakarta Sans`, alternatif `Inter`, fallback `system-ui, sans-serif`.
   - Karakteristik: Geometris, bersahabat, memiliki legibilitas sangat tinggi pada ukuran kecil (12px–14px) untuk label formulir dan tabel data.
2. **Font Kode & Angka Monospace:** `JetBrains Mono`, alternatif `ui-monospace, monospace`.
   - Wajib digunakan secara eksklusif untuk:
     - **Kode Pesanan:** e.g. `BZG-20261121-7K9M`
     - **Token Akses Keamanan:** e.g. `tok_8f9a2b4c1e...`
     - **Nominal Rupiah pada Ringkasan Tagihan:** e.g. `Rp 45.000`

### 3.2 Skala & Hirarki Tipografi

| Nama Hirarki | Kelas Tailwind | Ukuran (px/rem) | Bobot (Weight) | Jarak Baris (Leading) | Penggunaan Spesifik |
|---|---|---|---|---|---|
| **Display Hero** | `text-3xl md:text-5xl` | 36px / 48px | 800 (Extrabold) | Tight (1.15) | Headline utama beranda storefront publik |
| **Page Title (H1)** | `text-2xl md:text-3xl` | 24px / 30px | 700 (Bold) | Tight (1.2) | Judul utama dashboard admin & nama stan detail |
| **Section Title (H2)**| `text-xl md:text-2xl` | 20px / 24px | 600 (Semibold) | Snug (1.3) | Header bagian ("Katalog Menu", "Daftar Pesanan") |
| **Card Header (H3)** | `text-lg` | 18px | 600 (Semibold) | Normal (1.35) | Nama produk pada kartu, judul modal dialog |
| **Subheader (H4)** | `text-base` | 16px | 600 (Semibold) | Normal (1.4) | Subjudul grup formulir, nama pembeli di tabel |
| **Body Regular** | `text-sm` | 14px | 400 (Regular) | Relaxed (1.5) | Teks deskripsi produk, paragraf instruksi |
| **Body Medium** | `text-sm` | 14px | 500 (Medium) | Normal (1.45) | Isi sel tabel, nilai input formulir |
| **Label Form** | `text-xs md:text-sm` | 12px / 13px | 600 (Semibold) | Normal (1.4) | Label di atas input field, filter header |
| **Caption / Badge** | `text-xs` | 12px | 600 (Semibold) | Tight (1.25) | Teks status badge, petunjuk di bawah input |
| **Monospace Transaksi**| `font-mono text-xs md:text-sm` | 12px / 13px | 500 (Medium) | Normal (1.4) | Kode pesanan, token akses, format tanggal ISO |

### 3.3 Standar Penulisan Format Bahasa Indonesia
- **Mata Uang:** Wajib format Rupiah Indonesia baku: `Rp 25.000` (spasi setelah simbol "Rp", titik sebagai pemisah ribuan, tanpa ",00" kecuali laporan akuntansi mendalam).
- **Format Tanggal:** Menggunakan format waktu lokal Indonesia: `21 Nov 2026, 09:45 WIB`.
- **Kapitalisasi Label:** Title Case untuk tombol dan judul ("Simpan Pesanan", "Tambah Produk Baru").

---

## 4. Sistem Spasi, Sudut, Batas & Elevasi

### 4.1 Skala Spasi (Grid Basis 4px)
- **`space-1` (4px):** Jarak mikro antara ikon dan teks dalam badge atau tombol kecil.
- **`space-2` (8px):** Padding dalam badge, gap antar tombol aksi cepat pada tabel.
- **`space-3` (12px):** Padding input field, jarak antar opsi tombol varian.
- **`space-4` (16px):** Padding standar kartu mobile, gap antar input dalam form satu kolom.
- **`space-6` (24px):** Padding kartu desktop, jarak antar seksi dalam formulir.
- **`space-8` (32px):** Jarak antar seksi halaman dashboard admin.
- **`space-12` s.d. `space-16` (48px - 64px):** Jarak antar bagian besar di halaman beranda publik.

### 4.2 Sudut Lengkung (Border Radii)
- `rounded-sm` (2px): Checkbox kustom, indikator mini bar.
- `rounded-md` (6px): Tombol primer/sekunder, kotak teks input, dropdown select, sel tabel tag.
- `rounded-lg` (8px): Kartu produk, kartu metrik dashboard, panel modal dialog, kotak notifikasi.
- `rounded-full` (9999px): Badge status transaksi, tombol pill varian produk, foto avatar lingkaran kelompok.
- **Dilarang Keras:** Penggunaan sudut `rounded-3xl` (24px) pada kartu data profesional karena memboroskan ruang sudut dan terlihat amatir.

### 4.3 Garis Batas & Garis Pemisah (Borders & Dividers)
- Seluruh kartu dan panel modal wajib memiliki garis batas eksplisit: `border border-slate-200` (`#E2E8F0`).
- Pemisah baris tabel: `divide-y divide-slate-200`.
- Garis fokus navigasi keyboard: `focus:ring-2 focus:ring-primary-600 focus:ring-offset-2`.

### 4.4 Sistem Elevasi (Shadows)
Menghindari bayangan hitam pekat (`shadow-2xl` dilarang). Mengutamakan kejelasan batas garis (*border-defined surface*):
- **Elevasi 0 (Flat):** Kartu metrik admin, baris tabel (`shadow-none border border-slate-200`).
- **Elevasi 1 (Subtle):** Kartu produk publik saat hover (`shadow-sm hover:shadow-md transition-shadow`).
- **Elevasi 2 (Float):** Dropdown menu selektor, tooltip (`shadow-md border border-slate-200`).
- **Elevasi 3 (Modal Overlay):** Dialog modal konfirmasi dan drawer sheet mobile (`shadow-xl border border-slate-200`).

---

## 5. Ikonografi & Aset Visual

Menggunakan pustaka **Lucide React** secara eksklusif dengan ketebalan garis standar `strokeWidth={1.75}` (elemen navigasi & kartu) atau `strokeWidth={2}` (tombol & aksi mikro).

### 5.1 Pemetaan Ikon Fungsional

```
+----------------------------------------------------------------------------------------+
| Entitas / Aksi          | Komponen Lucide React     | Ukuran Rekomendasi (px)          |
|-------------------------+---------------------------+----------------------------------|
| Beranda Publik          | <Store />                 | 18px (menu), 24px (hero)         |
| Stan / Kelompok         | <Users /> / <School />    | 18px (sidebar), 16px (tabel)     |
| Produk Menu             | <Utensils /> / <Package />| 18px (sidebar), 14px (katalog)   |
| Keranjang / Pesan PO    | <ShoppingBag />           | 18px (tombol CTA), 16px (nav)    |
| Input Cepat Roadshow    | <Zap /> / <PlusCircle />  | 18px (tombol aksi primer)        |
| Status: Pesanan Baru    | <Clock />                 | 14px (badge), 16px (tabel)       |
| Status: Dikonfirmasi    | <CheckCircle2 />          | 14px (badge), 16px (aksi)        |
| Status: Selesai         | <PackageCheck />          | 14px (badge), 16px (aksi)        |
| Status: Dibatalkan      | <XCircle />               | 14px (badge), 16px (aksi)        |
| Bayar: Belum Lunas      | <AlertCircle />           | 14px (badge), 16px (tabel)       |
| Bayar: Lunas            | <BadgeCheck />            | 14px (badge), 16px (tabel)       |
| Metode: Tunai           | <Banknote />              | 14px (badge/form)                |
| Metode: Transfer/QRIS   | <QrCode /> / <CreditCard/>| 14px (badge/form)                |
| Ekspor Laporan Excel    | <FileSpreadsheet />       | 16px (tombol aksi)               |
| Filter & Pencarian      | <Filter /> / <Search />   | 16px (input bar)                 |
| Salin Token / Kode      | <Copy /> / <Check />      | 14px (tombol salin)              |
| Informasi / Catatan     | <Info />                  | 16px (kotak informasi)           |
+----------------------------------------------------------------------------------------+
```

---

## 6. Standar Dimensi & Rasio Gambar

Untuk mencegah terjadinya *Cumulative Layout Shift* (CLS) saat gambar dimuat dan menjaga kerapian estetika etalase, seluruh kontainer gambar wajib memiliki rasio aspek baku menggunakan utility class Tailwind (`aspect-[...]` atau `aspect-square`).

```
+--------------------------------------------------------------------------------------------+
| Jenis Aset Grafis       | Resolusi Rekomendasi | Rasio Aspek   | Kelas Tailwind            |
|-------------------------+----------------------+---------------+---------------------------|
| Poster Promosi Stan     | 1200 x 1500 px       | 4:5 Vertikal  | aspect-[4/5] object-cover |
| Foto Produk / Menu      | 1200 x 1200 px       | 1:1 Persegi   | aspect-square object-cover|
| Banner Hero Beranda     | 1920 x 700 px        | ~2.74:1 Lebar | aspect-[1920/700] cover   |
| Logo Stan / Kelompok    | 512 x 512 px         | 1:1 Lingkaran | aspect-square rounded-full|
+--------------------------------------------------------------------------------------------+
```

### 6.1 Ketentuan Teknis Pengunggahan Gambar:
- **Format Berkas:** WebP (sangat direkomendasikan untuk efisiensi transfer data ponsel), JPEG, PNG.
- **Batas Ukuran Maksimal:** 2 MB per berkas foto produk/poster; 512 KB untuk logo kelompok.
- **Penanganan Fallback:** Jika stan belum mengunggah poster/foto produk, tampilkan kontainer latar `bg-slate-100` bergaris batas halus dengan ikon placeholder `<Utensils />` atau `<Store />` warna abu-abu netral (`text-slate-400`) serta teks keterangan "Foto produk belum tersedia".

---

## 7. Spesifikasi Komponen Inti

### 7.1 Tombol (Buttons)
Memiliki tinggi standar 40px pada desktop (`h-10`) dan 44px pada layar sentuh (`h-11`) untuk memenuhi standar aksesibilitas Apple Human Interface & Google Material Touch Target.

```tsx
// 1. Tombol Aksen Publik (Pesan / Kirim PO)
<button className="h-11 px-6 rounded-md bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
  <ShoppingBag size={18} />
  <span>Pesan Pre-Order Sekarang</span>
</button>

// 2. Tombol Primer Admin (Simpan / Konfirmasi)
<button className="h-10 px-4 rounded-md bg-primary-800 hover:bg-primary-700 active:bg-primary-900 text-white font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:opacity-50">
  <Check size={16} />
  <span>Konfirmasi Pembayaran Lunas</span>
</button>

// 3. Tombol Sekunder / Garis Tepi (Filter / Batal)
<button className="h-10 px-4 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">
  <Filter size={16} />
  <span>Atur Filter</span>
</button>

// 4. Tombol Berbahaya (Batalkan Pesanan)
<button className="h-10 px-4 rounded-md bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500">
  <XCircle size={16} />
  <span>Batalkan Pesanan</span>
</button>
```

### 7.2 Lencana Status (Status Badges)

```tsx
// Pemetaan Status Pesanan
// order_status: 'new' | 'confirmed' | 'completed' | 'cancelled'
const OrderBadge = ({ status }: { status: OrderStatus }) => {
  const map = {
    new: { label: 'Pesanan Baru', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
    confirmed: { label: 'Dikonfirmasi', cls: 'bg-slate-100 text-slate-700 border-slate-300', icon: CheckCircle2 },
    completed: { label: 'Selesai', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: PackageCheck },
    cancelled: { label: 'Dibatalkan', cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle }
  }[status];

  const Icon = map.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${map.cls}`}>
      <Icon size={12} strokeWidth={2.5} />
      {map.label}
    </span>
  );
};

// Pemetaan Status Pembayaran
// payment_status: 'unpaid' | 'paid'
const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <BadgeCheck size={12} strokeWidth={2.5} />
        Lunas
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
      <AlertCircle size={12} strokeWidth={2.5} />
      Belum Bayar
    </span>
  );
};
```

### 7.3 Kotak Input & Kontrol Formulir
- **Label Wajib:** Huruf tebal berukuran 13px (`text-xs md:text-sm font-semibold text-slate-700 mb-1.5`) dengan tanda bintang merah untuk kolom yang wajib diisi (`<span className="text-rose-500">*</span>`).
- **Kotak Teks Input:** Tinggi `h-10` (desktop) atau `h-11` (mobile), border `border-slate-300`, background `bg-white`, teks `text-slate-900 placeholder:text-slate-400`, transisi fokus `focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20`.
- **Pesan Validasi Error:** Tampil tepat di bawah input field dengan ikon tanda seru merah kecil:
  ```tsx
  <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
    <AlertCircle size={12} /> Nama pemesan wajib diisi minimal 3 karakter.
  </p>
  ```

### 7.4 Tabel Data & Transformasi Responsif Kartu
- **Tampilan Desktop (≥ 768px):** Menggunakan elemen `<table>` semantik dengan baris berjarak `h-14`, border horizontal halus `border-b border-slate-200`, header `bg-slate-50 text-slate-600 font-semibold text-xs tracking-wider uppercase`.
- **Tampilan Ponsel Pintar (< 768px):** Seluruh baris tabel secara otomatis terstruktur ulang menjadi **Kartu Data Bertumpuk (Stacked Cards)**. Pengunjung atau admin di kelas tidak perlu menggeser tabel ke samping (*no horizontal scrolling*). Kartu menampilkan:
  - Header kartu: Kode Pesanan (monospace) dan Badge Status
  - Baris tengah: Nama Pembeli tebal, Kelas, dan Ringkasan Produk
  - Baris bawah: Total Tagihan (Rupiah tebal) dan Tombol Aksi Cepat ("Tandai Lunas" / "Lihat Rincian")

---

## 8. Desain Antarmuka Publik (Section A)

Storefront publik dirancang bersih, intuitif, ramah ponsel, dan memberikan pengalaman berbelanja yang menyenangkan bagi siswa, guru, maupun orang tua murid tanpa harus mendaftar akun terlebih dahulu (*anonymous public ordering*).

```
========================================================================================
STRUKTUR POHON HALAMAN PUBLIK (PUBLIC SITEMAP)
========================================================================================
/                                   --> Beranda (Hero, Highlight Stan, Info Event)
/groups                             --> Direktori Seluruh Stan / Kelompok Kelas
/groups/:groupId                    --> Detail Profil Stan & Menu Katalog Produk
/products/:productId                --> Detail Produk & Selektor Interaktif Multi-Dimensi
/checkout/:productId                --> Formulir Pemesanan Pre-Order Cepat (Public PO Form)
/order/success/:orderCode?token=... --> Halaman Konfirmasi Pesanan Terproteksi Token
/track-order                        --> Modal / Halaman Pencarian Mandiri Status Pesanan
========================================================================================
```

### 8.1 Beranda (Homepage)

#### A. Banner Pengumuman Atas (Announcement Bar)
- Bilah ramping di atas navbar berlatar `bg-primary-950 text-slate-200 text-xs py-2 px-4 text-center font-medium`:
  - Isi teks: *"Pemesanan Pre-Order Bazaar Siswa B-Zooginer Dibuka s.d. 25 November 2026. Ambil pesanan di stan kelas masing-masing."*

#### B. Header Navigasi Publik
- Container `max-w-7xl mx-auto h-16 px-4 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-40`.
- **Kiri:** Logo B-Zooginer (Monogram "B" modern warna biru navy dengan aksen titik jingga) + Teks "B-Zooginer" tebal + Sub-label kecil *"Kewirausahaan Siswa"*.
- **Tengah (Desktop):** Tautan navigasi: "Beranda", "Daftar Stan", "Cara Pemesanan".
- **Kanan:**
  - Tombol Sekunder: `<Search size={16} /> Lacak Pesanan` (Membuka dialog pencarian kode pesanan + token).
  - Tautan Masuk Admin: Ikon gembok kecil `<Lock size={14} /> Masuk Admin` menuju portal login admin.

#### C. Hero Section (Banner 1920x700)
- Menampilkan latar visual estetis bertema bazar sekolah (rasio `aspect-[1920/700]` pada desktop, responsif menjadi `aspect-[16/9]` di mobile) dengan lapisan gradasi gelap elegan (*dark overlay 40%*) untuk menjamin keterbacaan teks.
- **Teks Headline:** *"Dukung Kreativitas & Bisnis Mandiri Siswa Sekolah Kita."*
- **Sub-headline:** *"Pesan aneka kuliner lezat, minuman segar, dan merchandise unik karya kelompok kelas secara praktis lewat Pre-Order online."*
- **Aksi Cepat:**
  - Tombol CTA Aksen: `<ShoppingBag size={18} /> Jelajahi Stan & Menu` (Scroll halus menuju daftar stan).
  - Badge Sorotan: *"8 Stan Aktif • 24 Pilihan Menu • Transaksi Transparan"*.

#### D. Direktori Stan Terpilih (Featured Groups Grid)
- Judul Seksi: *"Stan Kelompok Kewirausahaan"* dengan tombol tautan *"Lihat Semua Stan →"*.
- Grid Responsif: 1 kolom di mobile, 2 kolom di tablet, 3–4 kolom di desktop.
- Komponen Kartu Stan:
  - Wadah poster promosi vertikal **rasio 4:5** (`aspect-[4/5]`) beresolusi tinggi.
  - Lencana status PO mengambang di pojok kanan atas: `PO DIBUKA` (hijau cerah) atau `SEGERA HADIR` (kuning amber).
  - Lingkaran logo stan 1:1 di pojok kiri bawah foto poster.
  - Nama stan tebal: e.g. **Stan 1: Dapur Nusantara (XII MIPA 2)**.
  - Deskripsi singkat stan (2 baris teks).
  - Tombol penuh: *"Kunjungi Stan & Pesan Menu"*.

#### E. Panduan Singkat Alur Pemesanan (3 Langkah Mudah)
1. **Pilih Menu & Varian:** Pilih stan kelas dan sesuaikan ukuran atau varian rasa favoritmu.
2. **Kirim Data Tanpa Akun:** Cukup masukkan nama, kelas, dan nomor WhatsApp aktif.
3. **Simpan Bukti & Ambil di Stan:** Dapatkan Kode Pesanan unik dan ambil pesananmu saat bazar berlangsung.

---

### 8.2 Direktori / Daftar Stan (Group Listing)

- **Header Halaman:** Judul *"Seluruh Stan Kelompok Kewirausahaan"*, keterangan periode waktu pelaksanaan bazaar.
- **Bilah Penyaringan (Filter Bar):**
  - Tombol filter kategori: `Semua Stan`, `PO Dibuka`, `Segera Hadir`.
  - Kolom pencarian instan: `<Search size={16} /> Cari nama stan atau nama produk...`.
- **Status Kosong Pencarian:** Jika stan tidak ditemukan, tampilkan ilustrasi stan kosong dengan teks *"Stan tidak ditemukan. Coba kata kunci lainnya."*.

---

### 8.3 Halaman Profil & Menu Stan (Group Detail)

- **Header Stan (Hero Profil):**
  - Foto banner latar stan.
  - Logo lingkaran stan (`w-20 h-20 rounded-full border-4 border-white shadow-sm`).
  - Nama Stan Lengkap: e.g. **Dapur Nusantara — Stan Kelas XII MIPA 2**.
  - Badge Status Operasional: `Menerima Pesanan Pre-Order` (Hijau).
  - Informasi Penting:
    - Penanggung Jawab Stan: *Ahmad Fauzi & Nabila Putri*.
    - Lokasi Stan Pengambilan: *Lobi Gedung B Lantai 1*.
    - Kontak WhatsApp Stan: Tombol tautan langsung WhatsApp untuk tanya jawab menu.
- **Katalog Produk Stan:**
  - Grid kartu produk berasio **1:1** (`aspect-square`).
  - Foto produk menggugah selera dengan tag harga dasar: e.g. *"Mulai dari Rp 18.000"*.
  - Indikator varian: *"Tersedia 3 Varian Rasa & 2 Ukuran"*.
  - Tombol aksi cepat: *"Pilih Varian & Pesan"*.

---

### 8.4 Halaman Detail Produk & Selektor Varian Multi-Dimensi

Dirancang khusus untuk mendukung **variasi produk multi-dimensi** (misal: Dimensi 1 = Ukuran [Kecil, Sedang, Besar] dan Dimensi 2 = Pilihan Rasa [Original, Pedas Manis, Keju Bakar]).

```
+-----------------------------------------------------------------------------------------+
| [Foto Produk 1:1]                   | Nasi Ayam Bakar Madu Spesial                      |
|                                     | Oleh: Stan Dapur Nusantara (XII MIPA 2)          |
|                                     |                                                   |
|                                     | Rp 20.000                                         |
|                                     | Ayam bakar ungkep bumbu rempah pilihan disajikan  |
|                                     | dengan nasi hangat, lalapan segar, & sambal bajak.|
|                                     |---------------------------------------------------|
|                                     | PILIH UKURAN:                                     |
|                                     | [ (•) Porsi Standar ]  [ ( ) Porsi Jumbo (+5rb) ]  |
|                                     |                                                   |
|                                     | PILIH LEVEL PEDAS:                                |
|                                     | [ (•) Tidak Pedas ]  [ ( ) Pedas ] [ ( ) Ekstra ] |
|                                     |                                                   |
|                                     | JUMLAH PESANAN:                                   |
|                                     | [ - ]  1  [ + ]   (Sisa kuota: 25 porsi)          |
|                                     |---------------------------------------------------|
|                                     | TOTAL: Rp 20.000                                  |
|                                     | [    LANJUTKAN KE FORMULIR PEMESANAN  ->    ]     |
+-----------------------------------------------------------------------------------------+
```

- **Perhitungan Harga Dinamis:** Menghitung secara instan di layar: `Harga Dasar + Penyesuaian Varian Ukuran + Penyesuaian Varian Rasa`.
- **Seleksi Tombol Pil Interaktif:** Tombol opsi varian berbentuk pill dengan feedback visual jelas:
  - *Aktif/Terpilih:* Latar belakang `bg-primary-50`, garis batas `border-primary-600 text-primary-900 font-semibold ring-2 ring-primary-600/20`.
  - *Pasif/Tersedia:* Latar belakang `bg-white`, garis batas `border-slate-300 text-slate-700 hover:border-slate-400`.
  - *Stok Habis:* Latar belakang `bg-slate-100`, garis batas `border-slate-200 text-slate-400 cursor-not-allowed line-through`.

---

### 8.5 Formulir Pemesanan Publik (Public PO Form)

Formulir satu halaman (*single-page checkout*) yang sangat ringkas, memprioritaskan kemudahan pengetikan di layar smartphone:

1. **Rincian Ringkasan Pesanan (Order Summary Card):**
   - Menampilkan foto thumbnail produk kecil (64x64 px).
   - Nama produk, kombinasi varian terpilih (e.g. *Ukuran: Porsi Standar, Pedas: Sedang*), jumlah unit, dan subtotal harga.
2. **Identitas Pemesan (Data Siswa/Warga Sekolah):**
   - **Nama Lengkap:** Kolom teks wajib, e.g. *"Rizky Pratama"*.
   - **Kelas / Unit:** Dropdown searchable pilihan kelas terdaftar (e.g. *"XII MIPA 2"*, *"XI IPS 1"*, *"Dewan Guru / Staf"*), atau input teks bebas terverifikasi.
   - **Nomor WhatsApp:** Kolom teks opsional berawalan kode negara `+62` atau `08...`, digunakan untuk pengiriman notifikasi pengingat pengambilan.
3. **Pilihan Metode Pembayaran:**
   - Opsi 1: `TUNAI (Bayar Langsung di Stan / Saat Roadshow)` — Cocok bagi siswa yang membawa uang saku tunai.
   - Opsi 2: `TRANSFER BANK / QRIS STAN` — Menampilkan instruksi rekening atau QRIS statis kelompok setelah pesanan terkirim.
4. **Catatan Tambahan untuk Stan (Opsional):**
   - e.g. *"Tolong sambalnya dipisah di plastik kecil ya."*
5. **Tombol Konfirmasi Pesanan:**
   - Tombol besar mencolok warna amber: `Kirim Pesanan Sekarang (Rp 20.000)`.
   - Mengaktifkan animasi loading spinner dan mendisabilitasi tombol selama proses transaksi server berlangsung guna mencegah *double-submit*.

---

### 8.6 Halaman Sukses & Konfirmasi Pesanan Terproteksi

- **URL Akses:** `/order/success/:orderCode?token=<access_token>`
- **Arsitektur Keamanan Data Siswa:** Menggunakan token akses 256-bit berentropi tinggi. Jika seseorang mencoba membuka tautan hanya dengan menebak `order_code` tanpa parameter `token` yang sah, server melalui RPC `get_order_confirmation` menolak memberikan data dan menampilkan layar akses ditolak.

#### Elemen Tampilan Halaman Konfirmasi:
- **Status Ikon Sukses:** Lingkaran hijau dengan ikon centang `<CheckCircle2 size={48} className="text-emerald-600" />`.
- **Judul Utama:** *"Pesanan Berhasil Dibuat!"*
- **Kartu Kode Pesanan (Highlight Utama):**
  - Tampilan kode pesanan berformat font monospaced besar:
    ```
    +-------------------------------------------------------------+
    | KODE PESANAN ANDA:                                          |
    | BZG-20261121-7K9M                                  [ Salin ]|
    +-------------------------------------------------------------+
    ```
  - Tombol Salin Cepat: Memunculkan toast *"Kode pesanan disalin ke papan klip!"*.
- **Peringatan Token Keamanan:**
  - Kotak peringatan biru informatif: *"Simpan tautan halaman ini atau catat kode pesanan Anda. Halaman ini memerlukan token keamanan khusus untuk melindungi privasi data Anda."*
- **Badge Status:**
  - Status Pesanan: `Pesanan Baru`
  - Status Pembayaran: `Belum Bayar` (dengan teks petunjuk: *"Silakan bayar tunai di stan kelompok saat pengambilan atau scan QRIS yang tersedia"*).
- **Rincian Pesanan:** Nama pembeli, kelas, daftar item dan varian, serta total pembayaran dalam Rupiah.
- **Informasi Stan Pengambilan:** Lokasi stan kelompok, nama penanggung jawab stan, dan jam buka operasional.
- **Tombol Aksi Bawah:**
  - Tombol Primer: `<Share2 size={16} /> Bagikan ke WhatsApp Saya` (Membuka tautan `wa.me` dengan teks ringkasan otomatis).
  - Tombol Sekunder: `<Home size={16} /> Kembali ke Beranda`.

---

### 8.7 Navigasi Ponsel Pintar (Mobile Navigation)
- **Top Header Mobile:** Ketinggian `h-14`, menampilkan logo ringkas, tombol `Lacak Pesanan`, dan tombol menu hamburger `<Menu size={20} />`.
- **Drawer Menu (Slide-in Sheet):** Terbuka mulus dari sisi kanan layar, memuat menu direktori stan, panduan bazaar, info kontak panitia, dan tautan login admin.
- **Modal Lacak Pesanan:** Membuka pop-up sheet dari bawah layar ponsel (*bottom sheet*) meminta input Kode Pesanan dan Token Akses (jika ada).

### 8.8 Footer / Kaki Halaman Publik
- Latar belakang `bg-primary-950 text-slate-300 py-12 px-4 border-t border-primary-900`.
- **Kolom 1 (Identitas):** Logo B-Zooginer putih, slogan *"Platform Pre-Order Sekolah Terpadu untuk Kewirausahaan Siswa"*.
- **Kolom 2 (Navigasi Cepat):** Beranda, Daftar Stan, Lacak Pesanan, Masuk Admin.
- **Kolom 3 (Informasi Acara):** Jadwal Kegiatan Pre-Order, Lokasi Pengambilan Stan, Narahubung Panitia OSIS.
- **Baris Bawah:** Hak Cipta `© 2026 B-Zooginer Platform. Dikelola oleh Tim Kewirausahaan Sekolah.`

---

## 9. Desain Dashboard Master Admin (Section B)

Dashboard Master Admin dirancang dengan tingkat kepadatan informasi tinggi (*high information density*), terstruktur, dan dioptimalkan untuk memantau performa makro seluruh kelompok serta mendukung penginputan cepat saat berkeliling kelas.

```
========================================================================================
STRUKTUR POHON HALAMAN MASTER ADMIN
========================================================================================
/admin                              --> Ringkasan Platform & 8 Kartu KPI Utama
/admin/groups                       --> Manajemen Seluruh Stan Kelompok
/admin/admins                       --> Manajemen Akun Administrator Kelompok
/admin/products                     --> Katalog Seluruh Produk Lintas Stan
/admin/orders                       --> Tabel Manajemen Semua Pesanan & Filter Multi-Kriteria
/admin/orders/new                   --> Formulir Cepat Input Pesanan Manual Roadshow Kelas
/admin/payments                     --> Manajemen Kas, Piutang & Verifikasi Pembayaran
/admin/reports                      --> Laporan Analitik, Grafik Recharts, & Ekspor Excel
/admin/settings                     --> Pengaturan Global Konten Publik & Periode Bazaar
/admin/logs                         --> Catatan Log Aktivitas Sistem (Audit Trail)
========================================================================================
```

### 9.1 Ringkasan Platform & KPI Global (Dashboard Overview)

- **Header Dashboard:** Judul *"Ringkasan Operasional Bazaar"*, tanggal aktif, dan tombol aksi cepat mencolok warna biru navy: `<Zap size={16} /> Input Pesanan Manual (Roadshow)`.

#### 8 Kartu Metrik KPI Utama (Data Real-Time):

```
+---------------------+---------------------+---------------------+---------------------+
| 1. TOTAL KELOMPOK   | 2. STAN TERBIT      | 3. TOTAL PRODUK     | 4. TOTAL PESANAN    |
| 10 Kelompok         | 8 Aktif Publik      | 32 Menu Terdaftar   | 245 Pesanan Masuk   |
| (100% Terdaftar)    | (2 Segera Hadir)    | (28 Tersedia)       | (+38 Hari Ini)      |
+---------------------+---------------------+---------------------+---------------------+
| 5. OMZET LUNAS      | 6. PIUTANG (UNPAID) | 7. PESANAN HARI INI | 8. STAN TERLARIS    |
| Rp 4.850.000        | Rp 1.120.000        | 38 Transaksi        | Dapur Nusantara     |
| (78.5% Terkumpul)   | (Menunggu Bayar)    | (Nilai: Rp 760.000) | (72 Pesanan / 30%)  |
+---------------------+---------------------+---------------------+---------------------+
```

#### Komponen Grafik Analitik (Recharts):
1. **Diagram Batang Komparasi Omzet Antar Stan:** Menampilkan perbandingan nominal omzet lunas vs piutang untuk masing-masing 10 kelompok siswa.
2. **Grafik Garis Tren Pesanan Harian:** Menampilkan lonjakan pesanan dari hari pertama promosi hingga batas penutupan PO.

#### Tabel Ringkasan 5 Pesanan Terakhir:
- Tabel langsung menampilkan transaksi terbaru lengkap dengan tombol 1-klik rincian pesanan.

---

### 9.2 Manajemen Stan / Kelompok (Group Management)

- **Bilah Aksi:** Kolom pencarian stan, filter status publikasi, dan tombol primer `<Plus size={16} /> Daftarkan Kelompok Baru`.
- **Tabel Kelompok:**
  - Kolom: Nomor Stan, Logo, Nama Kelompok, Kelas, Penanggung Jawab, Jumlah Menu, Status Publikasi (`Terbit Publik` / `Draf`), Aksi.
  - Sakelar Cepat (*Toggle Switch*): Mengubah status `is_published` stan secara instan.
- **Modal Dialog Pendaftaran / Pengeditan Stan:**
  - Field: Nama Stan, Nomor Stan, Kelas, Deskripsi, Nama Penanggung Jawab, Nomor WhatsApp, Unggah Logo (512x512), Unggah Poster Stan (1200x1500, rasio 4:5).

---

### 9.3 Manajemen Akun Administrator Stan (Admin Management)

- Memungkinkan Master Admin membuat dan menetapkan akun login untuk administrator masing-masing kelompok siswa.
- **Tabel Akun Admin:** Nama Lengkap, Alamat Email, Stan yang Ditugaskan, Tanggal Dibuat, Status Akun.
- **Modal Tambah Admin Kelompok:**
  - Input Alamat Email siswa.
  - Dropdown Pilihan Stan yang belum memiliki admin.
  - Input Kata Sandi Awal (dihasilkan otomatis atau diketik manual).
  - Mengirimkan instruksi login melalui Edge Function yang aman.

---

### 9.4 Tabel Semua Pesanan (All Orders Management)

- **Sistem Penyaringan Lengkap (Multi-Filter Toolbar):**
  - Filter Kelompok: Dropdown seluruh stan (Dapur Nusantara, Kopi Kembara, dll.).
  - Filter Status Pesanan: `Semua`, `Pesanan Baru`, `Dikonfirmasi`, `Selesai`, `Dibatalkan`.
  - Filter Status Pembayaran: `Semua`, `Belum Bayar`, `Lunas`.
  - Filter Metode Pembayaran: `Semua`, `Tunai`, `Transfer / QRIS`.
  - Kotak Pencarian Global: Mencari nama siswa pembeli, kelas, atau kode pesanan.
- **Kolom Tabel Lengkap:**
  - Kode Pesanan (`font-mono text-xs bg-slate-100 px-2 py-0.5 rounded`)
  - Waktu Pemesanan (`21/11 10:15`)
  - Pembeli (`Nama Siswa`, Sub-label: `Kelas`)
  - Stan Kelompok
  - Ringkasan Item (`2x Ayam Bakar Madu (Jumbo)`)
  - Total Tagihan (`Rp 40.000` tebal)
  - Status Pembayaran (Badge `Lunas` / `Belum Bayar`)
  - Status Pesanan (Badge `Baru` / `Dikonfirmasi` / `Selesai`)
  - Aksi: Tombol Titik Tiga / Tombol Cepat Detail Pesanan.

---

### 9.5 Alur Cepat Input Pesanan Manual Roadshow (Manual Order Form)

Dirancang khusus untuk Master Admin yang memegang laptop atau tablet saat berkeliling dari kelas ke kelas mempromosikan produk siswa. Kecepatan pengisian (*input velocity*) adalah prioritas mutlak.

```
+-----------------------------------------------------------------------------------------+
| INPUT PESANAN ROADSHOW KELAS (MANUAL ORDER)                    [ Bantuan Keyboard: F1 ] |
|-----------------------------------------------------------------------------------------|
| 1. PILIH STAN KELOMPOK:                                                                 |
| [ Cari & Pilih Stan Kelompok... (Ketik untuk mencari)                      v ]          |
|                                                                                         |
| 2. PILIH PRODUK & VARIAN:                                                               |
| Produk : [ Nasi Ayam Bakar Madu (Stan Dapur Nusantara)                     v ]          |
| Ukuran : [ (•) Porsi Standar ]  [ ( ) Porsi Jumbo (+Rp 5.000) ]                        |
| Rasa   : [ (•) Bumbu Madu Manis ]  [ ( ) Pedas Sambal Bajak ]                           |
| Jumlah : [ - ]  1  [ + ]    Harga Satuan: Rp 20.000    Subtotal: Rp 20.000             |
|                                                                                         |
| 3. IDENTITAS PEMESAN:                                                                   |
| Nama Pembeli : [ Rizky Pratama                                     ] (Auto-focus)       |
| Kelas Siswa  : [ XII MIPA 2                                        v ]                  |
| Nomor WhatsApp (Opsional): [ 08123456789                           ]                  |
|                                                                                         |
| 4. PEMBAYARAN KASIR:                                                                    |
| Metode Pembayaran : [ (•) Tunai Langsung ]  [ ( ) Transfer ]                            |
| Status Pembayaran : [ ( ) Belum Bayar    ]  [ (•) SUDAH LUNAS DI TEMPAT ]              |
|                                                                                         |
| TOTAL PEMBAYARAN: Rp 20.000                                                             |
|-----------------------------------------------------------------------------------------|
| [ Batal ]        [ Simpan & Tambah Baru (Ctrl + Enter) ]   [ Simpan Selesai (Enter) ]   |
+-----------------------------------------------------------------------------------------+
```

- **Pintasan Keyboard (Shortcuts):**
  - `Ctrl + Enter`: Menyimpan pesanan saat ini, memunculkan toast sukses ringkas, dan langsung mereset form ke pembeli baru di kelas yang sama tanpa reload.
  - `Tab` / `Shift + Tab`: Berpindah antar kolom dengan urutan logis.

---

### 9.6 Manajemen & Verifikasi Pembayaran (Payment Management)

- **Mode Fokus Piutang:** Tab khusus yang memfilter hanya pesanan dengan status `Belum Bayar`.
- **Tombol Konfirmasi 1-Klik:** Admin dapat langsung menekan tombol `<Check size={16} /> Tandai Lunas` pada baris pesanan siswa setelah uang tunai diserahkan.
- **Dialog Verifikasi:** Menampilkan rincian singkat nominal uang yang harus diterima sebelum status diubah menjadi `paid`.

---

### 9.7 Laporan Agregasi & Ekspor Excel (Reports & Export)

- **Rekapitulasi Finansial Global:** Total omzet kotor, total kas terkumpul, sisa piutang, dan persentase pembayaran per kelompok.
- **Modul Ekspor Excel (.xlsx):**
  - Pilihan cakupan ekspor: Seluruh Stan atau Stan Tertentu.
  - Pilihan rentang tanggal pesanan.
  - Menghasilkan berkas Excel terstruktur profesional menggunakan `ExcelJS`:
    - Header kolom rapi berwarna biru navy (`#1E3A5F`) dengan teks putih tebal.
    - Format angka mata uang Rupiah otomatis (`Rp #,##0`).
    - Tab terpisah untuk Rekap Penjualan, Rincian Pesanan, dan Rincian Varian.

---

## 10. Desain Dashboard Admin Kelompok (Section C)

Dashboard Admin Kelompok dirancang terisolasi penuh via Supabase Row Level Security (RLS). Administrator kelompok hanya dapat melihat, mengedit, dan mengekspor data yang menjadi milik stannya sendiri.

```
========================================================================================
STRUKTUR POHON HALAMAN ADMIN KELOMPOK (GROUP ADMIN)
========================================================================================
/dashboard                          --> Ringkasan Kinerja Stan & Statistik Pesanan
/dashboard/products                 --> Katalog Menu Produk Stan
/dashboard/products/new             --> Tambah Produk Baru & Pengunggah Gambar
/dashboard/products/:id/edit        --> Editor Produk & Matriks Varian Multi-Dimensi
/dashboard/orders                   --> Daftar Pesanan Masuk Khusus Stan Ini
/dashboard/orders/new               --> Input Pesanan Manual Kasir Stan
/dashboard/payments                 --> Konfirmasi Penerimaan Kasir & Verifikasi Lunas
/dashboard/reports                  --> Laporan Penjualan Produk & Ekspor Excel Stan
/dashboard/settings                 --> Pengaturan Profil Stan, Kontak WA & Jam Ambil
========================================================================================
```

### 10.1 Ringkasan Kinerja Stan (Group Dashboard Overview)

- **Header Stan:** Menampilkan nama stan kelompok, e.g. *"Dashboard Stan: Dapur Nusantara (XII MIPA 2)"*.
- **Sakelar Buka/Tutup Darurat PO:** Admin stan dapat mematikan sementara penerimaan pesanan jika dapur kewalahan atau kuota harian habis.
- **4 Kartu Metrik Stan:**
  1. **Total Pesanan Masuk:** e.g. `72 Pesanan`.
  2. **Total Pendapatan Lunas:** e.g. `Rp 1.440.000`.
  3. **Menunggu Pembayaran:** e.g. `12 Pesanan (Rp 240.000)`.
  4. **Produk Terlaris Stan:** e.g. `Nasi Ayam Bakar Madu (48 Porsi Terjual)`.
- **Daftar Tugas Cepat (Actionable Items):**
  - Notifikasi pesanan baru yang membutuhkan konfirmasi persiapan dapur.

---

### 10.2 Katalog Produk Stan (Product Management)

- **Tabel Produk Kelompok:**
  - Thumbnail Foto Produk (1:1, 48x48 px).
  - Nama Produk & Kategori (Makanan Berat, Minuman, Camilan).
  - Harga Dasar (Base Price).
  - Jumlah Varian Terdaftar (e.g. *"6 Kombinasi Varian"*).
  - Total Sisa Stok / Kuota.
  - Status Aktif (`Aktif Dijual` / `Nonaktif`).
  - Tombol Aksi: Edit Produk & Matriks Varian.
- **Tombol Tambah Produk:** Membuka formulir pembuatan produk baru.

---

### 10.3 Editor Produk & Pengunggah Gambar

- **Informasi Produk Utama:**
  - Nama Produk: Input teks (e.g. *"Nasi Ayam Bakar Madu"*).
  - Deskripsi Menu: Textarea untuk penjelasan bahan, porsi, dan keunggulan rasa.
  - Harga Dasar (Base Price): Input nominal Rupiah (e.g. `20000`).
  - Kategori Produk: Dropdown pilihan (`Makanan`, `Minuman`, `Kue & Roti`, `Merchandise`).
- **Komponen Pengunggah Gambar (Dropzone 1:1):**
  - Area drag-and-drop bergaris putus-putus (`border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-600 bg-slate-50`).
  - Panduan ukuran: *"Format WebP, PNG, atau JPEG. Rasio wajib 1:1 (persegi), resolusi rekomendasi 1200x1200 px, maks 2 MB."*
  - Pratinjau Langsung (Live Preview) gambar yang dipilih dengan tombol ganti atau hapus foto.

---

### 10.4 Matriks Varian Multi-Dimensi (Variant Management Matrix)

Fitur unggulan B-Zooginer untuk mengelola variasi produk kompleks tanpa batasan dimensi tunggal:

```
+-----------------------------------------------------------------------------------------+
| BUILDER DIMENSI VARIAN (VARIANT DIMENSIONS)                                             |
|-----------------------------------------------------------------------------------------|
| Dimensi 1: [ Ukuran         ]   Pilihan: [ Porsi Standar (x) ] [ Porsi Jumbo (x) ]      |
| Dimensi 2: [ Pilihan Rasa   ]   Pilihan: [ Madu Manis (x) ] [ Sambal Bajak (x) ]        |
|                                                                                         |
| [ + Tambah Dimensi Baru (misal: Topping, Level Gula, dll.) ]                            |
|-----------------------------------------------------------------------------------------|
| MATRIKS KOMBINASI VARIAN (Otomatis Dihasilkan: 4 Kombinasi)                             |
|-----------------------------------------------------------------------------------------|
| Kombinasi Varian           | Penyesuaian Harga   | Total Harga   | Stok  | Status       |
|----------------------------+---------------------+---------------+-------+--------------|
| Standar / Madu Manis       | + Rp 0              | Rp 20.000     | [ 25] | [v] Aktif    |
| Standar / Sambal Bajak     | + Rp 0              | Rp 20.000     | [ 20] | [v] Aktif    |
| Jumbo / Madu Manis         | + Rp 5.000          | Rp 25.000     | [ 15] | [v] Aktif    |
| Jumbo / Sambal Bajak       | + Rp 5.000          | Rp 25.000     | [ 10] | [v] Aktif    |
+-----------------------------------------------------------------------------------------+
```

- **Otomasi Kombinatorik:** Sistem secara cerdas menggabungkan setiap opsi dimensi menjadi baris varian individual.
- **Pengaturan Individual:** Admin kelompok dapat menyesuaikan selisih harga (`price_adjustment`) dan stok masing-masing kombinasi secara fleksibel.

---

### 10.5 Kelola Pesanan Masuk Stan (Order Management)

- Menampilkan seluruh pesanan khusus untuk stan kelompok tersebut.
- **Filter Status:** `Semua Pesanan`, `Perlu Dikonfirmasi`, `Siap Diambil`, `Selesai`, `Dibatalkan`.
- **Aksi Siklus Pesanan:**
  - Tombol `Konfirmasi Pesanan`: Mengubah status dari `new` ke `confirmed`.
  - Tombol `Tandai Selesai`: Mengubah status ke `completed` saat pembeli mengambil barang di stan.
  - Tombol `Batalkan Pesanan`: Membuka dialog pembatalan (otomatis mengembalikan kuota stok varian).

---

### 10.6 Input Pesanan Manual Stan (Manual Order Form)

- Serupa dengan alur cepat Master Admin, namun pilihan stan kelompok **terkunci otomatis (*read-only*)** ke stan milik admin yang sedang masuk (*logged-in group*).
- Memungkinkan kasir stan melayani pembeli langsung di tempat yang belum sempat memesan via website publik.

---

### 10.7 Konfirmasi Pembayaran Kasir Stan (Payment Confirmation)

- Daftar khusus antrean pesanan yang belum melunasi pembayaran.
- Tombol 1-klik `<BadgeCheck size={16} /> Konfirmasi Pembayaran Kasir`.
- Otomatis mencatat nama administrator yang melakukan verifikasi ke dalam `activity_logs`.

---

### 10.8 Laporan Penjualan & Ekspor Excel Kelompok

- **Ringkasan Dapur & Logistik:** Menampilkan total porsi yang harus dimasak per kombinasi varian (contoh: *Porsi Jumbo Madu Manis: 15 Porsi, Standar Bajak: 20 Porsi*).
- **Tombol Ekspor Excel Stan:** Menghasilkan lembar kerja `.xlsx` siap cetak untuk panduan pembagian pesanan di hari pelaksanaan bazaar.

---

## 11. Matriks Perilaku Responsif & Adaptasi Perangkat

Platform B-Zooginer dirancang dengan filosofi **Mobile-First Responsiveness** karena mayoritas siswa dan pembeli memesan menggunakan smartphone, sementara admin mengelola data menggunakan campuran tablet dan laptop.

```
+---------------------------------------------------------------------------------------------+
| Elemen UI              | Ponsel (< 640px)          | Tablet (640 - 1023px) | Desktop (>= 1024px)    |
|------------------------+---------------------------+-----------------------+------------------------|
| Navigasi Admin         | Drawer Sheet (Hamburger)  | Drawer / Rail Icon    | Sidebar Tetap (w-60)   |
| Tabel Data Pesanan     | Stacked Cards Bertumpuk   | Tabel Horizontal Scroll| Tabel Lebar Penuh      |
| Form Roadshow Manual   | Single Column Stacked     | 2 Kolom Sejajar       | 2-3 Kolom Cepat (Grid) |
| Grid Katalog Produk    | 1 Kolom Penuh             | 2 Kolom Sejajar       | 3 - 4 Kolom Grid       |
| Poster Stan Beranda    | aspect-[4/5] Lebar Penuh  | 2 Kolom Grid          | 3 - 4 Kolom Grid       |
| Padding Kontainer      | px-4 py-4                 | px-6 py-6             | px-8 py-8 (max-w-7xl)  |
| Ukuran Touch Target    | Minimal 44 x 44 px        | Minimal 40 x 40 px    | Minimal 36 x 36 px     |
+---------------------------------------------------------------------------------------------+
```

---

## 12. Spesifikasi Status Antarmuka

### 12.1 Status Pemuatan (Loading States — Skeletons)
- **Aturan Mutlak:** Dilarang menggunakan pemutar lingkaran penuh (*full-page spinner*) yang membuat layar berkedip kosong.
- **Komponen Skeleton Loader:** Menggunakan elemen beranimasi `animate-pulse bg-slate-200 rounded` yang meniru tata letak data sebenarnya:
  - *Skeleton Kartu Produk:* Kotak persegi abu-abu `aspect-square`, diikuti dua baris batang teks abu-abu.
  - *Skeleton Tabel Pesanan:* 5 baris balok horizontal dengan tinggi selang-seling menyerupai kode, nama, dan badge.

### 12.2 Status Kosong (Empty States)
Menampilkan ilustrasi ikon Lucide abu-abu bersih, judul informatif, penjelasan ramah, dan tombol aksi relevan:

```tsx
<div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-lg">
  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
    <Inbox size={32} />
  </div>
  <h3 className="text-base font-semibold text-slate-900 mb-1">Belum Ada Pesanan Masuk</h3>
  <p className="text-sm text-slate-500 max-w-sm mb-6">
    Pesanan yang dibuat oleh pembeli publik atau melalui input manual roadshow kelas akan muncul di sini.
  </p>
  <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-md text-sm font-medium hover:bg-primary-700">
    <PlusCircle size={16} /> Input Pesanan Manual
  </button>
</div>
```

### 12.3 Status Notifikasi & Umpan Balik (Feedback Toasts & Alerts)
- **Pustaka Notifikasi:** Menggunakan `sonner` dengan posisi pojok kanan atas di desktop dan bawah tengah di mobile.
- **Pesan Berbahasa Indonesia Jelas:**
  - Sukses: *"Pesanan BZG-20261121-7K9M berhasil disimpan dan kuota stok telah diperbarui."*
  - Konfirmasi Bayar: *"Pembayaran pesanan atas nama Rizky Pratama telah dikonfirmasi Lunas."*
  - Peringatan Kuota: *"Stok varian rasa Cokelat tersisa 2 porsi lagi."*
  - Error: *"Gagal mengirim pesanan. Silakan periksa koneksi internet Anda dan coba lagi."*

---

## 13. Kamus Standar Bahasa UI & Konten Contoh Indonesia

### 13.1 Kamus Standar Istilah UI
Seluruh label dalam kode tampilan wajib merujuk ke kamus berikut:

| Istilah Asli (Konsep) | Terjemahan Baku UI B-Zooginer |
|---|---|
| Dashboard | Dashboard / Ringkasan |
| Pre-Order (PO) | Pre-Order (PO) |
| Booths / Groups | Stan Kelompok / Stan Kelas |
| Products / Items | Produk / Menu |
| Variants (Size, Flavor) | Varian (Ukuran, Rasa, Level) |
| Order Code | Kode Pesanan (`BZG-YYYYMMDD-XXXX`) |
| Access Token | Token Keamanan Akses |
| Order Status: New | Pesanan Baru |
| Order Status: Confirmed | Dikonfirmasi |
| Order Status: Completed | Selesai |
| Order Status: Cancelled | Dibatalkan |
| Payment Status: Unpaid | Belum Bayar |
| Payment Status: Paid | Lunas (Sudah Bayar) |
| Payment Method: Cash | Tunai di Stan / Roadshow |
| Payment Method: Transfer | Transfer Bank / QRIS |
| Submit Order | Kirim Pesanan Sekarang |
| Manual Order Entry | Input Pesanan Manual |
| Export to Excel | Ekspor ke Excel (.xlsx) |
| Activity Logs | Log Riwayat Aktivitas |

### 13.2 Contoh Data Uji Realistis Indonesia
Untuk memastikan pratinjau desain menyerupai kondisi nyata sekolah di Indonesia:

1. **Stan 1: Dapur Nusantara (Kelas XII MIPA 2)**
   - *Produk:* Nasi Ayam Bakar Madu (Rp 20.000), Dimsum Ayam Mentai (Rp 15.000).
   - *Varian:* Ukuran (Standar, Jumbo), Level Sambal (Original, Sambal Bajak Pedas).
2. **Stan 2: Kopi Kembara & Tea (Kelas XII IPS 1)**
   - *Produk:* Es Kopi Susu Gula Aren (Rp 12.000), Matcha Fusion Latte (Rp 15.000).
   - *Varian:* Ukuran (Reguler 12oz, Large 16oz), Tingkat Gula (Normal Sweet, Less Sweet).
3. **Stan 3: Sweet Treats Bakery (Kelas XI MIPA 4)**
   - *Produk:* Fudgy Brownies Bites (Rp 18.000), Croffle Keju Karamel (Rp 14.000).
   - *Varian:* Topping (Almond, Keju Parut, Cokelat Belgia).
4. **Stan 4: Kreasi Grafika Kreatif (Kelas XI DKV)**
   - *Produk:* Gantungan Kunci Akrilik Kustom (Rp 10.000), Tote Bag Kanvas Sablon (Rp 35.000).
   - *Varian:* Desain (Maskot Sekolah, Tipografi Retro, Karakter Komik).
5. **Data Pemesan Sampel:**
   - Rizky Pratama (Kelas XII MIPA 2) — `081298765432`
   - Siti Nurhaliza (Kelas XI IPS 3) — `085712345678`
   - Amanda Putri (Kelas X-E4) — `082155558888`
   - Bpk. Budi Santoso, S.Pd. (Dewan Guru Fisika) — `081300001111`

---

## 14. Aturan Larangan & Anti-Pola Desain

1. **Dilarang keras memakai bahasa Inggris** pada label antarmuka yang terlihat oleh pengguna, kecuali akronim teknis universal (`PO`, `QRIS`, `WhatsApp`, `Excel`, `ID`).
2. **Dilarang memakai gradasi warna ungu/pink bergaya generic AI template.** Identitas visual B-Zooginer berakar kuat pada warna *Deep Slate Blue* dan *Warm Amber*.
3. **Dilarang memakai bayangan tebal melayang (`shadow-2xl`) atau efek kaca buram (glassmorphism)** pada kartu data administratif karena mengganggu fokus kerja kasir/admin.
4. **Dilarang menggunakan sudut lengkung ekstrem (`rounded-3xl` / pill besar)** pada kartu informasi tabel.
5. **Dilarang mendistorsi foto produk atau poster stan.** Rasio 1:1 dan 4:5 wajib dilindungi dengan kontainer bertag `object-cover`.
6. **Dilarang menampilkan tabel yang terpotong di layar ponsel.** Seluruh tabel data wajib runtuh secara mulus menjadi format Kartu Bertumpuk (*Stacked Cards*) pada viewport `< 768px`.
7. **Dilarang mengizinkan akses halaman konfirmasi pesanan tanpa token.** Validasi server-side via token 256-bit wajib ditegakkan untuk melindungi privasi data siswa.

---
*Dokumen ini merupakan panduan acuan tunggal (Single Source of Truth) untuk implementasi antarmuka dan komponen Fase 3 platform B-Zooginer.*
