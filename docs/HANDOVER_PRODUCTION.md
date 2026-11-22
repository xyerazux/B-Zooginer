# B-Zooginer — Production Handover & Deployment Report

**Dokumen:** HANDOVER_PRODUCTION.md  
**Proyek:** B-Zooginer — School Pre-Order Management Platform  
**Target Rilis:** Produksi (Vercel + Supabase Cloud)  
**Status Fase:** Phase 0–8 COMPLETED (100% Selesai & Terverifikasi)  
**Pengujian:** 94 Automated Tests Lulus (Vitest v3.2.7), Production Build 0 Error  

---

## 1. Status Repositori & Integritas Git (GitHub)

- **Repositori:** `https://github.com/xyerazux/B-Zooginer.git`
- **Branch Utama:** `main` (bersih, stabil, dan siap auto-deploy ke Vercel).
- **Kebersihan Berkas `.gitignore`:**
  - Terverifikasi mengecualikan berkas rahasia: `.env`, `.env.*`, `!.env.example`.
  - Direktori `node_modules/`, `dist/`, `dist-ssr/`, dan `*.local` diabaikan sepenuhnya.
  - Template konfigurasi yang aman dikomit: `.env.example`.
- **Audit Rahasia & Kredensial:**
  - Tidak ada `SUPABASE_SERVICE_ROLE_KEY` atau password database yang terkomit di repositori.
  - Kunci frontend hanya menggunakan anon key publik (`VITE_SUPABASE_ANON_KEY`) yang diproteksi oleh Supabase Row Level Security (RLS).
- **Riwayat Komit Utama:**
  - `feat(phase-0)`: Foundation, Architecture, dan Database Planning
  - `feat(phase-1)`: Database Migrations (001–009), Functions Atomic, dan Edge Functions
  - `feat(phase-2)`: Brand Identity, Typography (Plus Jakarta Sans), dan UI/UX Systems
  - `feat(phase-3)`: Public Storefront, Multi-Dimensional Variants, dan Responsive Layouts
  - `feat(phase-4)`: Supabase Authentication, Role Dashboards, dan Isolasi RLS
  - `feat(phase-5)`: Product & Order Management, Media Storage, Roadshow Mode (Manual Orders)
  - `feat(phase-6)`: Payment Reconciliation, Activity Logs Audit Trail, dan ExcelJS Export
  - `feat(phase-7)`: Security Audit, Bug Fixes (Revenue Cancelled Exclusion), dan 94 Unit Tests
  - `feat(phase-8)`: Production Hardening, Vercel SPA Configuration (`vercel.json`), dan Handover Documentation

---

## 2. Konfigurasi Backend & Database (Supabase Production)

### A. Migrasi Database (Sequential & Immutable)
Seluruh skema database telah terstruktur dalam berkas migrasi berurutan di `supabase/migrations/`:
1. `20261121000001_create_enums_and_extensions.sql`: Ekstensi UUID, pgcrypto, dan Enum types (`role_type`, `po_status_type`, `order_status_type`, `payment_status_type`, `payment_method_type`, `order_source_type`).
2. `20261121000002_create_profiles_and_groups.sql`: Tabel `profiles` dan `groups`.
3. `20261121000003_create_products_and_variants.sql`: Tabel `products` dan `product_variants`.
4. `20261121000004_create_orders_and_items.sql`: Tabel `orders` dan `order_items` dengan immutable price snapshot.
5. `20261121000005_create_activity_logs_and_settings.sql`: Tabel `activity_logs` dan `site_settings`.
6. `20261121000006_create_indexes.sql`: Indexing performa tinggi pada FK, order_code, timestamps, dan status filter.
7. `20261121000007_create_functions_and_procedures.sql`: Helper Security Definer (`is_master_admin()`, `get_my_role()`, `get_my_group_id()`), fungsi generate order code unik, fungsi atomic pengurangan stok `deduct_variant_stock`, trigger pemulihan stok saat pesanan dibatalkan `trg_restore_stock_on_order_cancel`, RPC konfirmasi pesanan bertoken `get_order_confirmation`, dan RPC order publik atomic `submit_public_order`.
8. `20261121000008_create_rls_policies.sql`: Row Level Security policies menyeluruh dengan `FORCE ROW LEVEL SECURITY`.
9. `20261121000009_create_storage_and_admin_order_rpc.sql`: Konfigurasi storage buckets dan RPC entri transaksi Roadshow `submit_admin_order`.

Perintah penerapan ke Supabase Cloud:
```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

### B. Konfigurasi Storage Buckets
Tiga storage bucket publik telah dikonfigurasi dengan batas ukuran 2 MB dan pembatasan MIME type:
- `groups-media`: Menyimpan poster stan dan logo kelompok (`image/webp`, `image/jpeg`, `image/png`).
- `products-media`: Menyimpan foto menu makanan dan minuman (`image/webp`, `image/jpeg`, `image/png`).
- `site-assets`: Menyimpan logo sekolah dan banner pengumuman utama (`image/webp`, `image/jpeg`, `image/png`, `image/svg+xml`).

Kebijakan RLS Storage:
- **SELECT:** Publik (bisa diakses publik melalui CDN URL).
- **INSERT & DELETE:** Authenticated admin saja (`master_admin` atau `group_admin` terikat).

### C. Konfigurasi Edge Functions
Terdapat dua Edge Functions Deno runtime yang menangani operasi aman sisi server:
1. `submit-order`: Menerima pemesanan publik secara anonim, melakukan validasi server-side, memotong stok secara atomic, dan menghasilkan kode pesanan serta token akses aman.
2. `create-group-admin`: Memverifikasi JWT pemanggil (harus `master_admin`), membuat user auth baru di Supabase Auth Admin API, dan mengikat profil `group_admin` ke `group_id` stan.

Perintah deploy Edge Functions:
```bash
supabase functions deploy submit-order
supabase functions deploy create-group-admin
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key-anda>
```

### D. Konfigurasi Otentikasi Supabase
Pada Supabase Dashboard → **Authentication** → **URL Configuration**:
- **Site URL:** URL domain produksi Vercel (misal: `https://b-zooginer.vercel.app`).
- **Redirect URLs:**
  - `https://b-zooginer.vercel.app/**`
  - `http://localhost:5173/**` (untuk pengujian lokal)
- **Email Confirmation:** Dinonaktifkan (karena akun administrator dibuat secara terarah oleh Master Admin, tanpa self-registration publik).

---

## 3. Konfigurasi Frontend & Hosting (Vercel Production)

### A. Konfigurasi SPA Routing Fallback (`vercel.json`)
Berkas `vercel.json` telah dikonfigurasi pada root direktori:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```
*Manfaat:* Menjamin bahwa pengguna yang me-refresh halaman deep-routing (misal `/admin/orders` atau `/dashboard/products`) tidak akan mengalami error 404 dari web server Vercel.

### B. Environment Variables di Vercel
Pada Vercel Project Settings → **Environment Variables**:
- `VITE_SUPABASE_URL`: `https://<project-ref>.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `<anon-key>`
- `VITE_APP_ENV`: `production`

---

## 4. Panduan Operasional & Setup Pengguna

### A. Panduan Setup Akun Pertama Kali (Master Admin Bootstrap)
Setelah migrasi database diterapkan ke Supabase Cloud:
1. Buka Supabase Studio → **Authentication** → **Users** → **Add user**.
2. Masukkan email panitia (misal: `panitia.bazaar@sekolah.sch.id`) dan password yang kuat.
3. Buka **SQL Editor** di Supabase Studio dan jalankan prosedur bootstrap:
```sql
SELECT public.bootstrap_master_admin(
  '<UUID-USER-DARI-AUTH.USERS>',
  'Nama Ketua Panitia / Guru Pembimbing'
);
```
4. Akun Master Admin kini aktif dan dapat langsung login melalui `/login`.

### B. Panduan Pembuatan Akun Group Admin (Admin Stan Kelompok)
Master Admin dapat membuat akun Group Admin tanpa perlu membuka database:
1. Login sebagai Master Admin di `/login`.
2. Masuk ke menu **Kelola Stan Kelompok** (`/admin/groups`) → Buat Stan Kelas terlebih dahulu (misal: "Stan Kelas XII Kuliner 1").
3. Buka menu **Kelola Akun Admin** (`/admin/admins`) → Klik **+ Buat Akun Admin Baru**.
4. Isi Nama Lengkap, Alamat Email, Password Sementara, dan pilih Stan Kelompok yang ditugaskan.
5. Sistem otomatis memanggil Edge Function `create-group-admin` untuk membuat akun auth dan menautkan profil ke stan tersebut.
6. Berikan kredensial login kepada ketua kelompok.

### C. Panduan Operasional Group Admin
1. Login di `/login` dengan email dan password yang diberikan panitia.
2. Anda otomatis diarahkan ke `/dashboard` yang menampilkan profil stan kelompok Anda.
3. **Mengatur Produk:**
   - Masuk ke menu **Produk Menu Stan** (`/dashboard/products`).
   - Tambah produk makanan/minuman, unggah foto (WebP/JPEG maks 2 MB), harga dasar, dan varian (misal Level Pedas: Original, Pedas, Ekstra Pedas).
4. **Menerima Pesanan & Mode Roadshow:**
   - Masuk ke menu **Pesanan Masuk Stan** (`/dashboard/orders`).
   - Saat keliling kelas, klik **+ Input Pesanan Manual** untuk memasukkan pesanan offline secara instan.
   - Saat uang tunai atau bukti transfer telah diverifikasi kasir, klik tombol **Tandai Lunas**.

---

## 5. Struktur Berkas Final Proyek (Final Architecture Tree)

```
c:\laragon\www\B-Zooginer
├── .gitignore                          # Aturan ignore kredensial (.env, dist, node_modules)
├── .env.example                        # Template environment variabel aman
├── vercel.json                         # Konfigurasi SPA rewrite & caching Vercel
├── package.json                        # Scripts & dependencies (React 18, Vite 6, ExcelJS, Recharts)
├── README.md                           # Dokumentasi publik proyek
├── tailwind.config.ts                  # Design tokens & semantic colors B-Zooginer
├── vite.config.ts                      # Konfigurasi bundling Vite & path aliases (@/*)
├── docs/                               # Arsip dokumentasi teknis & arsitektur
│   ├── AI_HANDOVER.md                  # Status pengerjaan AI lintas sesi
│   ├── ARCHITECTURE.md                 # Diagram arsitektur sistem
│   ├── DATABASE_SCHEMA.md              # Skema tabel & relasi DB
│   ├── DEPLOYMENT.md                   # Checklist rilis & panduan teknis
│   ├── DESIGN_SYSTEM.md                # Panduan warna, tipografi, & komponen UI
│   ├── HANDOVER_PRODUCTION.md          # Dokumen handover final produksi ini
│   ├── IMPLEMENTATION_PLAN.md          # Rencana roadmap Phase 0–8
│   ├── PROJECT_OVERVIEW.md             # Gambaran bisnis pre-order sekolah
│   ├── REQUIREMENTS.md                 # Kebutuhan fungsional & non-fungsional
│   ├── SECURITY.md                     # Model keamanan & RLS policy
│   └── TESTING.md                      # Rencana pengujian & test cases
├── src/
│   ├── App.tsx                         # Client-side router, code-split lazy routes
│   ├── main.tsx                        # Entrypoint React
│   ├── components/
│   │   ├── admin/                      # Komponen admin (Sidebar, Header, Dialogs, Modals)
│   │   └── shared/                     # Komponen bersama (Navbar, Footer, Badges, Skeletons)
│   ├── context/
│   │   └── AuthContext.tsx             # Context sesi Supabase & profil database
│   ├── hooks/                          # Custom hooks TanStack Query (Admin, Groups, Orders, Reports)
│   ├── layouts/
│   │   ├── AdminLayout.tsx             # Layout admin responsif (desktop fixed + mobile drawer)
│   │   └── PublicLayout.tsx            # Layout storefront publik
│   ├── lib/
│   │   └── supabase.ts                 # Supabase client singleton (Anon key only)
│   ├── pages/
│   │   ├── auth/                       # LoginPage
│   │   ├── group-admin/                # Dashboard, Products, Orders, Reports
│   │   ├── master-admin/               # Dashboard, Groups, Admins, Orders, Reports, Logs
│   │   └── public/                     # Home, GroupList, GroupDetail, ProductDetail, Checkout, Success, 404
│   ├── services/                       # Lapisan service async terpisah dari komponen UI
│   │   ├── admin.service.ts
│   │   ├── auth.service.ts
│   │   ├── excelExport.service.ts      # Engine generator spreadsheet Excel (.xlsx) on-demand
│   │   ├── groupAdmin.service.ts
│   │   ├── groups.service.ts
│   │   ├── orders.service.ts
│   │   ├── products.service.ts
│   │   ├── reports.service.ts
│   │   ├── settings.service.ts
│   │   └── storage.service.ts
│   ├── test/                           # 8 Berkas Test Suites (94 tests passing)
│   └── types/                          # TypeScript definitions derived dari database
└── supabase/
    ├── functions/                      # Deno Edge Functions
    │   ├── create-group-admin/
    │   └── submit-order/
    └── migrations/                     # 9 Berkas Migrasi SQL PostgreSQL
```

---

## 6. URL Deployment & Status Pengujian Langsung

> [!IMPORTANT]
> **Status Deployment:** Repositori GitHub telah terintegrasi secara penuh (`origin: https://github.com/xyerazux/B-Zooginer.git`). Sesuai instruksi *"Do not claim deployment is successful until the live website has actually been tested"*, klaim keberhasilan live deploy hanya berlaku setelah deployment Vercel selesai melakukan build dan URL live dapat diverifikasi ketersediaannya melalui HTTP check.

- **Target Domain Produksi:** `https://b-zooginer.vercel.app` (atau domain kustom sekolah).
- **Target Supabase API:** `https://<your-project-ref>.supabase.co`.

---

## 7. Batasan Sistem yang Diketahui (Known Limitations)

1. **Konfirmasi Pembayaran Manual:** Tidak mengintegrasikan payment gateway otomatis pihak ketiga. Rekonsiliasi pembayaran mengandalkan pemeriksaan kas manual oleh panitia/kasir stan.
2. **Kapasitas Unggahan Gambar:** Dibatasi maksimal 2 MB per berkas gambar pada Supabase Storage. Dianjurkan menggunakan format modern WebP untuk kompresi maksimal.
3. **Distribusi Password Awal Admin Stan:** Pembuatan password sementara dilakukan oleh Master Admin dan wajib diserahkan langsung kepada ketua stan secara aman.

---

## 8. Rekomendasi Pemeliharaan (Maintenance Recommendations)

1. **Pencadangan Database Berkala:** Aktifkan fitur *Daily Automated Backups* pada Supabase Cloud Dashboard (Project Settings → Database → Backups).
2. **Monitoring Log Aktivitas:** Pantau menu **Log Aktivitas** (`/admin/logs`) secara berkala selama kegiatan bazar berlangsung untuk mengawasi audit trail perubahan pembayaran dan pembuatan pesanan manual.
3. **Penutupan Periode Pre-Order:** Setelah batas waktu bazar tercapai, Master Admin dapat menonaktifkan status PO pada masing-masing stan melalui menu `/admin/groups` atau melalui toggle status PO produk.
4. **Arsip Data Keuangan:** Setelah kegiatan bazar selesai, unduh seluruh data transaksi menggunakan fitur **Ekspor Laporan (.xlsx)** pada menu Laporan Keuangan untuk pembukuan laporan pertanggungjawaban (LPJ) sekolah.
