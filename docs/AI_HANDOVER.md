# B-Zooginer — AI Project Handover

**Dokumen:** AI_HANDOVER.md  
**Tujuan:** Memindahkan konteks pengerjaan project B-Zooginer ke AI Agent atau akun Antigravity yang baru.

---

## 1. Informasi Project

**Nama:** B-Zooginer  
**Jenis:** Platform Pre-Order Produk Siswa  
**Lingkungan kerja:** Windows + Antigravity IDE  
**Lokasi project saat ini:** `C:\laragon\www\B-Zooginer`

B-Zooginer merupakan platform pemesanan produk siswa untuk kegiatan penjualan sekolah/PKK. Setiap kelompok memiliki produk dan halaman penjualan masing-masing. Pembeli dapat melakukan pemesanan secara online tanpa harus membuat akun.

Project ini memiliki tiga jenis pengguna:

1. Master Admin
2. Group Admin
3. Public / Pembeli

## 2. Status Pengerjaan

| Tahapan | Status |
|---|---|
| Phase 0 — Project Foundation & Architecture | COMPLETED |
| Phase 1 — Database & Backend Foundation | COMPLETED |
| Phase 2 — UI/UX & Brand Identity | DESIGN GENERATED — MENUNGGU APPROVAL |
| Phase 3 dan seterusnya | NOT STARTED |

**PENTING:** Jangan mengulang Phase 0 dan Phase 1. Keduanya sudah dikerjakan dan dinyatakan selesai oleh pemilik project.

Phase 2 sudah menghasilkan rancangan UI/UX, sitemap, design system, dan laporan tinjauan desain. Namun, tahap persetujuan dan eksekusi lanjutan Phase 2 belum diselesaikan.

## 3. Teknologi dan Arsitektur

Arsitektur yang telah direncanakan pada Phase 0:

- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- Backend: Supabase
- Database: PostgreSQL (Supabase)
- Authentication: Supabase Auth
- File Storage: Supabase Storage
- Server-side operations: Supabase Edge Functions
- Database security: Row Level Security (RLS)

Keputusan arsitektur penting:

- Public order submission harus melalui Edge Function.
- Jangan memberikan akses INSERT langsung kepada pengguna anonim untuk membuat pesanan.
- Harga produk harus disimpan sebagai snapshot pada order_items.
- order_status dan payment_status harus dipisahkan.
- Pengurangan stok harus dilakukan secara atomic melalui database function.
- Group Admin hanya boleh mengakses data kelompoknya sendiri.

## 4. Struktur Database yang Direncanakan

Tabel utama:

- profiles
- groups
- products
- product_variants
- orders
- order_items
- activity_logs
- site_settings

Struktur ini berasal dari hasil Phase 0. Periksa implementasi dan migration yang benar-benar ada sebelum melakukan perubahan.

Jangan membuat ulang tabel atau migration yang sudah tersedia tanpa alasan teknis yang jelas.

## 5. Konsep Pengguna dan Hak Akses

### Master Admin

Master Admin merupakan pengelola utama seluruh platform.

Fitur:
- Melihat seluruh kelompok.
- Mengelola Group Admin.
- Melihat seluruh produk dan pesanan.
- Mengelola pembayaran.
- Melihat laporan seluruh kelompok.
- Mengekspor laporan Excel.
- Membuat pesanan manual.
- Menggunakan Roadshow Mode ketika mengunjungi kelas.
- Mengatur status pembayaran pesanan manual.
- Melihat aktivitas sistem.

### Group Admin

Setiap kelompok mempunyai satu Group Admin.

Fitur:
- Mengelola profil kelompok.
- Mengelola banyak produk.
- Mengunggah foto produk.
- Mengelola varian produk.
- Mengelola stok dan batas maksimal PO.
- Mengatur deadline PO.
- Melihat pesanan kelompoknya.
- Memperbarui status pembayaran.
- Melihat dan mengekspor laporan kelompoknya.

Group Admin tidak boleh mengakses data kelompok lain.

### Public / Pembeli

Pembeli tidak perlu login.

Fitur:
- Melihat daftar kelompok.
- Melihat produk dan detailnya.
- Memilih varian dan jumlah produk.
- Melakukan checkout.
- Memilih metode pembayaran.
- Melihat informasi pesanan.
- Melacak pesanan.

## 6. Aturan Bisnis yang Sudah Disepakati

1. Satu kelompok dapat memiliki banyak produk.
2. Satu pesanan dapat berisi beberapa produk dari kelompok yang sama.
3. Pesanan tidak boleh mencampurkan produk dari kelompok berbeda.
4. Produk dapat memiliki beberapa dimensi varian, misalnya ukuran dan rasa.
5. Setiap kombinasi varian dapat memiliki harga, stok, dan batasan masing-masing.
6. Stok harus divalidasi saat pesanan dibuat.
7. Produk dapat memiliki batas maksimal PO.
8. Setiap produk atau kelompok dapat memiliki deadline PO sesuai rancangan sistem.
9. Pembeli dapat memesan tanpa login.
10. Pembayaran dilakukan secara manual.
11. Metode pembayaran yang digunakan hanya CASH dan TRANSFER.
12. Tidak ada fitur upload bukti pembayaran.
13. Admin melakukan konfirmasi pembayaran secara manual dengan status PAID atau UNPAID.
14. Data pesanan harus tetap memiliki informasi harga saat transaksi dibuat meskipun harga produk berubah kemudian.

**Jangan menambahkan QRIS atau metode pembayaran lain tanpa persetujuan pemilik project.**

## 7. Roadshow Mode

Roadshow Mode merupakan fitur khusus Master Admin.

Tujuannya agar Master Admin dapat membantu siswa melakukan pemesanan ketika mengunjungi kelas secara langsung.

Alur:
1. Master Admin memilih kelompok.
2. Memilih produk.
3. Memilih kombinasi varian.
4. Mengisi jumlah produk.
5. Mengisi nama pembeli dan kelas.
6. Memilih status pembayaran PAID atau UNPAID.
7. Menyimpan pesanan.

Aktivitas harus tercatat pada activity_logs, termasuk identitas admin yang membuat pesanan dan perubahan status pembayaran.

Rancangan UI sebelumnya juga memasukkan shortcut Ctrl + Enter untuk mempercepat penyimpanan pesanan.

## 8. Hasil Phase 2 — Design Direction

Identitas visual yang sudah dirancang:

- Primary: Deep Slate Blue `#1E3A5F`
- Accent: Warm Amber `#F59E0B`
- Background: Clean Slate `#F8FAFC`
- Surface: White

Arah desain:

- Modern dan minimalis.
- Elegan, bersih, dan memiliki karakter.
- Tidak terlihat seperti template dashboard AI generik.
- Hindari penggunaan gradient ungu berlebihan.
- Hindari terlalu banyak floating cards.
- Gunakan border dan hierarki visual yang jelas.
- Fokus pada kemudahan penggunaan dan kecepatan operasional.

Pengalaman pengguna dibagi menjadi dua:

**Public Storefront**
- Visual-first.
- Mobile-first.
- Produk dan poster menjadi elemen utama.

**Admin Dashboard**
- Terstruktur.
- Efisien.
- Mengutamakan kecepatan input data.
- Tampilan tabel dan informasi harus mudah dibaca.

Tipografi yang direkomendasikan:
- Plus Jakarta Sans atau Inter untuk UI.
- JetBrains Mono untuk kode pesanan dan token.

## 9. Sitemap yang Telah Dirancang

### Public

- `/`
- `/groups`
- `/groups/:id`
- `/products/:id`
- `/checkout/:id`
- `/order/success/:code?token=...`
- `/track-order`

### Master Admin

- `/admin`
- `/admin/groups`
- `/admin/admins`
- `/admin/orders`
- `/admin/manual-order`
- `/admin/payments`
- `/admin/reports`
- `/admin/logs`

### Group Admin

- `/dashboard`
- `/products`
- `/products/create`
- `/products/:id/edit`
- `/orders`
- `/manual-order`
- `/payments`
- `/reports`

Periksa kembali route aktual sebelum mengimplementasikan sitemap ini. Sitemap merupakan rancangan Phase 2, bukan bukti bahwa seluruh halaman sudah dibuat.

## 10. Ketentuan Gambar

| Jenis gambar | Rasio | Rekomendasi ukuran |
|---|---|---|
| Poster kelompok | 4:5 | 1200 × 1500 |
| Foto produk | 1:1 | 1200 × 1200 |
| Hero banner | 1920 × 700 | Landscape |
| Logo kelompok | 1:1 | 512 × 512 |

Website harus responsif untuk desktop, tablet, iPad, dan smartphone.

Target desain:
- Touch target minimal 44px.
- Mobile menggunakan layout yang nyaman untuk layar kecil.
- Sidebar admin dapat menjadi drawer pada mobile.
- Tabel admin harus tetap dapat digunakan pada tablet.
- Desktop dapat menggunakan sidebar tetap dan grid produk 3–4 kolom.

## 11. Keamanan

Hal-hal yang wajib diperhatikan:

- RLS harus diterapkan dan diuji.
- Group Admin tidak boleh membaca atau mengubah data kelompok lain.
- Jangan mengekspos informasi pribadi pembeli secara publik.
- Public order harus melalui Edge Function.
- Token akses pesanan harus dibuat secara kriptografis di sisi server.
- Token tidak boleh diturunkan dari order ID atau kode pesanan.
- Validasi harga dan stok harus dilakukan di sisi server.
- Jangan mempercayai nilai harga atau total dari browser.
- Jangan memasukkan Supabase service_role key ke frontend atau repository Git.

## 12. Ketentuan untuk AI Agent Baru

AI Agent yang menerima dokumen ini harus mengikuti aturan berikut:

1. Baca seluruh dokumentasi project yang sudah tersedia sebelum melakukan pekerjaan.
2. Jangan menganggap dokumentasi selalu sama dengan implementasi aktual.
3. Periksa struktur folder, source code, migration, konfigurasi, dan status Git.
4. Jangan menghapus atau mengganti implementasi yang sudah selesai tanpa alasan yang kuat.
5. Jangan mengulang Phase 0 dan Phase 1.
6. Jangan langsung mengerjakan Phase 3.
7. Fokus pertama adalah melakukan pemeriksaan kondisi project dan memahami hasil Phase 2.
8. Jangan mengubah file ketika sedang melakukan pemeriksaan awal.
9. Jika ada ketidaksesuaian antara dokumen dan implementasi, laporkan terlebih dahulu.
10. Tunggu persetujuan pemilik project sebelum melakukan perubahan yang berdampak besar.

## 13. Cara Kerja Bersama Pemilik Project

Pemilik project menginginkan pengerjaan secara bertahap.

- Berikan satu prompt atau satu tahap pekerjaan pada satu waktu.
- Jangan mengerjakan banyak fase sekaligus.
- Setelah menyelesaikan satu tahap, buat laporan yang jelas.
- Jelaskan file yang dibuat atau diubah.
- Jelaskan fitur yang sudah selesai dan yang belum.
- Laporkan error, asumsi, dan kendala secara jujur.
- Jangan melanjutkan ke fase berikutnya tanpa persetujuan pemilik project.

**Prinsip utama: Jangan mengulang pekerjaan yang sudah selesai, jangan mengubah keputusan bisnis tanpa izin, dan jangan melanjutkan fase sebelum tahap sebelumnya diperiksa.**

---

**Dokumen ini merupakan handover konteks project. Implementasi aktual tetap harus diperiksa langsung dari workspace.**