# B-Zooginer — School Pre-Order Management Platform

<p align="center">
  <img src="public/favicon.svg" alt="B-Zooginer Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>Platform Manajemen Pre-Order & Rekonsiliasi Kas Kegiatan Bazar Sekolah (PKK / Kewirausahaan Siswa)</strong>
</p>

<p align="center">
  <a href="#fitur-utama">Fitur Utama</a> •
  <a href="#arsitektur--teknologi">Teknologi</a> •
  <a href="#panduan-instalasi-lokal">Instalasi</a> •
  <a href="#konfigurasi-environment">Environment</a> •
  <a href="#database--migrasi">Database</a> •
  <a href="#alur-pengguna">Alur Pengguna</a> •
  <a href="#panduan-deployment">Deployment</a>
</p>

---

## 📌 Tentang B-Zooginer

**B-Zooginer** adalah platform web modern yang dirancang khusus untuk memfasilitasi kegiatan penjualan bazar pre-order sekolah. Sistem ini menjembatani stan-stan kelompok kelas dengan para pembeli (siswa, guru, dan staf sekolah) melalui pemesanan online mandiri maupun pemesanan manual keliling (*Roadshow Mode*).

### Karakteristik & Keunggulan Sistem
- **Storefront Publik Tanpa Login:** Siswa dapat langsung memesan tanpa registrasi akun, dilindungi token akses 32-byte kriptografis untuk menjaga privasi data (PII).
- **Varian Produk Multi-Dimensi:** Fleksibel mendukung kombinasi atribut seperti *Ukuran × Rasa* atau *Porsi × Level Pedas* dengan stok dan penyesuaian harga per varian.
- **Mode Roadshow (Kasir Keliling):** Entri transaksi super cepat bagi admin stan atau panitia yang berjualan langsung ke ruang-ruang kelas.
- **Pengurangan & Pemulihan Stok Atomic:** Mencegah *overselling* saat lonjakan pesanan dan otomatis memulihkan stok jika pesanan dibatalkan.
- **Rekonsiliasi Kas & Audit Trail:** Pencatatan arus kas lunas (`cash` & `transfer`) dan piutang belum bayar, dilengkapi audit log anti-tamper di `activity_logs`.
- **Ekspor Spreadsheet (.xlsx):** Ekspor laporan keuangan profesional multi-sheet dengan format akuntansi Rupiah via ExcelJS.

---

## 🛠️ Arsitektur & Teknologi

| Layer | Teknologi | Versi | Catatan |
|---|---|---|---|
| **Frontend Framework** | React + TypeScript | React 18, TS 5.7+ | Strict Mode, 100% Type-Safe |
| **Build Tool & Bundler** | Vite | v6.x | Dynamic Chunk Splitting |
| **Styling & Design System** | Tailwind CSS | v3.4+ | Semantic Tokens, Mobile-First |
| **UI Primitives** | shadcn/ui (Radix UI) | Latest | Accessible Dialog, Dropdown, Tabs |
| **Icons** | Lucide React | Latest | Konsisten & Ringan |
| **Routing** | React Router | v7.x | Nested Routes, Code-Splitting |
| **Server State** | TanStack Query | v5.x | Caching Bertingkat (30s - 5m) |
| **Spreadsheet Engine** | ExcelJS | v4.4+ | On-Demand Dynamic Import |
| **Charts & Visuals** | Recharts | v3.x | Area & Bar Visualizations |
| **Backend & Database** | Supabase (PostgreSQL 15+) | JS SDK v2 | RLS, RPC Atomic, Storage |
| **Edge Functions** | Deno Runtime | v1.177+ | Service-Role Order Creation |
| **Hosting & Deploy** | Vercel + Supabase Cloud | — | SPA Rewrites, Global CDN |

---

## 🚀 Panduan Instalasi Lokal

### 1. Prasyarat
- **Node.js:** Versi 20.x LTS ke atas
- **npm:** Versi 10.x ke atas
- **Git:** Versi 2.40+
- **Supabase CLI & Docker:** (Opsional, jika menjalankan lokal database stack)

### 2. Kloning & Pemasangan Dependencies
```bash
git clone https://github.com/xyerazux/B-Zooginer.git
cd B-Zooginer
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas template `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```

Isi konfigurasi Supabase Anda di `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> [!CAUTION]
> **JANGAN PERNAH** meletakkan `SUPABASE_SERVICE_ROLE_KEY` pada `.env.local` atau berkas frontend mana pun. Kunci ini hanya digunakan di Supabase Dashboard / Edge Functions.

### 4. Menjalankan Aplikasi
```bash
# Jalankan server pengembangan lokal (Vite)
npm run dev

# Jalankan pengujian unit & integrasi (Vitest)
npm test

# Jalankan uji coba produksi (Build & Typecheck)
npm run build
```

---

## 🗄️ Database & Migrasi

Seluruh skema database, fungsi atomic, RLS policies, dan bucket penyimpanan berada pada folder `supabase/migrations/`:

```
supabase/migrations/
├── 20261121000001_create_enums_and_extensions.sql
├── 20261121000002_create_profiles_and_groups.sql
├── 20261121000003_create_products_and_variants.sql
├── 20261121000004_create_orders_and_items.sql
├── 20261121000005_create_activity_logs_and_settings.sql
├── 20261121000006_create_indexes.sql
├── 20261121000007_create_functions_and_procedures.sql
├── 20261121000008_create_rls_policies.sql
└── 20261121000009_create_storage_and_admin_order_rpc.sql
```

### Storage Buckets
1. `groups-media`: Menyimpan poster kelompok dan logo stan (Maks 2 MB, publik read, authenticated admin write).
2. `products-media`: Menyimpan foto produk dan menu (Maks 2 MB, publik read, authenticated admin write).
3. `site-assets`: Menyimpan aset banner promosi utama situs.

---

## 👥 Alur & Hak Akses Pengguna

### 1. Pembeli Publik (Siswa & Guru)
- Akses toko: `/`, `/groups`, `/products/:id`, `/checkout/:productId`.
- Pemesanan anonim tanpa login.
- Pelacakan pesanan: `/order/success/:orderCode?token=...` atau modal *Lacak Pesanan*.

### 2. Group Admin (Admin Stan Kelompok)
- Akses portal: `/login` → otomatis dialihkan ke `/dashboard`.
- Fitur:
  - Manajemen Produk & Varian Stan (`/dashboard/products`)
  - Pesanan Masuk & Verifikasi Lunas (`/dashboard/orders`)
  - Entri Pesanan Manual Roadshow Stan
  - Laporan Penjualan & Ekspor Excel Khusus Stan (`/dashboard/reports`)
- **Pembatasan Ketat:** Hanya dapat melihat dan mengubah data stan kelompoknya sendiri.

### 3. Master Admin (Panitia Pusat / Guru Pembimbing)
- Akses portal: `/login` → otomatis dialihkan ke `/admin`.
- Fitur:
  - Ringkasan Eksekutif Platform (`/admin`)
  - Kelola Seluruh Stan Kelompok (`/admin/groups`)
  - Pembuatan & Pengelolaan Akun Group Admin (`/admin/admins`)
  - Pengawasan Seluruh Pesanan Transaksi (`/admin/orders`)
  - Entri Pesanan Manual Lintas Stan (Roadshow Mode)
  - Rekonsiliasi Keuangan & Ekspor Spreadsheet Global (`/admin/reports`)
  - Audit Trail Log Aktivitas Sistem (`/admin/logs`)

---

## 🚢 Panduan Deployment

### Vercel Deployment
1. Hubungkan repository GitHub ke Vercel.
2. Konfigurasi build:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Tambahkan Environment Variables pada pengaturan Vercel:
   - `VITE_SUPABASE_URL`: URL project Supabase Anda.
   - `VITE_SUPABASE_ANON_KEY`: Public anon key Supabase Anda.
4. Berkas `vercel.json` telah disediakan di root untuk menangani SPA routing rewrite fallback.

### Supabase Edge Functions Deployment
```bash
# Login ke Supabase CLI
supabase login

# Tautkan ke project produksi
supabase link --project-ref <your-project-ref>

# Terapkan seluruh migrasi database
supabase db push

# Deploy Edge Functions
supabase functions deploy submit-order
supabase functions deploy create-group-admin

# Set secrets untuk Edge Functions
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## 📄 Lisensi & Tim Pengembang
Dikembangkan untuk **SMKN / SMA Pre-Order Bazaar Platform**. Hak cipta dilindungi.
