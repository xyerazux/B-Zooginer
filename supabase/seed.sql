-- Seed data for B-Zooginer
-- Project: B-Zooginer Pre-Order Platform
-- Context: School Entrepreneurship Bazaar (Bazaar Kewirausahaan Sekolah)

-- 1. Insert Site Settings
INSERT INTO public.site_settings (id, hero_title, hero_subtitle, announcement_text, is_announcement_active)
VALUES (
  1,
  'B-Zooginer 2026',
  'Platform Pre-Order Resmi Bazaar Kewirausahaan Siswa SMA Negeri 1',
  'Pre-Order dibuka mulai 21 November hingga 28 November 2026. Jangan sampai kehabisan!',
  true
)
ON CONFLICT (id) DO UPDATE SET
  hero_title = EXCLUDED.hero_title,
  hero_subtitle = EXCLUDED.hero_subtitle,
  announcement_text = EXCLUDED.announcement_text,
  is_announcement_active = EXCLUDED.is_announcement_active;

-- 2. Insert Student Groups (Stan Kelompok Siswa)
INSERT INTO public.groups (id, name, slug, description, is_published, po_status, sort_order)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'Stan 01 — Dapur Nusantara (XII MIPA 1)',
    'dapur-nusantara',
    'Menyajikan aneka kuliner tradisional nusantara bercita rasa autentik dengan kemasan kekinian dan higienis.',
    true,
    'open',
    1
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Stan 02 — Kopi & Minuman Segar (XII MIPA 2)',
    'kopi-minuman-segar',
    'Aneka racikan kopi susu gula aren, matcha fusion, dan mocktail buah segar pelepas dahaga.',
    true,
    'open',
    2
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'Stan 03 — Pastry & Bakery Artisan (XII IPS 1)',
    'pastry-bakery-artisan',
    'Kudapan manis artisan, croffle renyah, dan cookies premium dengan berbagai pilihan topping lezat.',
    true,
    'open',
    3
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'Stan 04 — Dimsum & Snack Bar (XII IPS 2)',
    'dimsum-snack-bar',
    'Dimsum ayam udang hangat, mentai rice box, dan camilan gurih renyah.',
    true,
    'coming_soon',
    4
  )
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Products (Produk per Stan dengan Dimensi Varian)
-- Stan 01: Nasi Kotak & Ayam Geprek
INSERT INTO public.products (
  id, group_id, name, slug, description, base_price,
  variant_dimensions, has_variants, track_stock, is_active, is_featured
)
VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'a1111111-1111-1111-1111-111111111111',
    'Paket Nasi Ayam Bakar Madu',
    'paket-ayam-bakar-madu',
    'Nasi pulen, ayam bakar madu empuk, sambal terasi khas, lalapan segar, dan tahu-tempe goreng.',
    20000.00,
    '[{"name": "Porsi", "options": ["Reguler", "Jumbo"]}, {"name": "Level Pedas", "options": ["Sedang", "Pedas Mantap"]}]'::jsonb,
    true,
    true,
    true,
    true
  ),
  (
    'b1111111-1111-1111-1111-111111111112',
    'a1111111-1111-1111-1111-111111111111',
    'Tahu Walik Krispi Sambal Kecap (Isi 10)',
    'tahu-walik-krispi',
    'Tahu walik isi adonan daging ayam kenyal dan gurih, digoreng garing dengan cocolan sambal kecap pedas.',
    15000.00,
    '[]'::jsonb,
    false,
    true,
    true,
    false
  ),
  -- Stan 02: Kopi & Mocktail (Multi-Dimensi: Ukuran & Rasa)
  (
    'b2222222-2222-2222-2222-222222222221',
    'a2222222-2222-2222-2222-222222222222',
    'Signature Artisan Drink',
    'signature-artisan-drink',
    'Minuman racikan istimewa barista kelas. Pilihan rasa kopi susu aren, matcha latte, atau dark chocolate.',
    12000.00,
    '[{"name": "Ukuran", "options": ["Medium (16oz)", "Large (22oz)"]}, {"name": "Rasa", "options": ["Kopi Susu Aren", "Matcha Latte", "Dark Choco"]}]'::jsonb,
    true,
    true,
    true,
    true
  )
ON CONFLICT (group_id, slug) DO NOTHING;

-- 4. Insert Multi-Dimensional Product Variants
-- Varian untuk Paket Nasi Ayam Bakar Madu (Porsi × Level Pedas)
INSERT INTO public.product_variants (
  id, product_id, title, attributes, price_adjustment, stock, sort_order
)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'Porsi: Reguler, Level: Sedang',
    '{"porsi": "Reguler", "level": "Sedang"}'::jsonb,
    0.00,
    50,
    1
  ),
  (
    'c1111111-1111-1111-1111-111111111112',
    'b1111111-1111-1111-1111-111111111111',
    'Porsi: Reguler, Level: Pedas Mantap',
    '{"porsi": "Reguler", "level": "Pedas Mantap"}'::jsonb,
    0.00,
    50,
    2
  ),
  (
    'c1111111-1111-1111-1111-111111111113',
    'b1111111-1111-1111-1111-111111111111',
    'Porsi: Jumbo, Level: Sedang',
    '{"porsi": "Jumbo", "level": "Sedang"}'::jsonb,
    5000.00,
    30,
    3
  ),
  (
    'c1111111-1111-1111-1111-111111111114',
    'b1111111-1111-1111-1111-111111111111',
    'Porsi: Jumbo, Level: Pedas Mantap',
    '{"porsi": "Jumbo", "level": "Pedas Mantap"}'::jsonb,
    5000.00,
    30,
    4
  ),
  -- Varian untuk Signature Artisan Drink (Ukuran × Rasa)
  (
    'c2222222-2222-2222-2222-222222222221',
    'b2222222-2222-2222-2222-222222222221',
    'Ukuran: Medium, Rasa: Kopi Susu Aren',
    '{"ukuran": "Medium (16oz)", "rasa": "Kopi Susu Aren"}'::jsonb,
    0.00,
    100,
    1
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222221',
    'Ukuran: Medium, Rasa: Matcha Latte',
    '{"ukuran": "Medium (16oz)", "rasa": "Matcha Latte"}'::jsonb,
    2000.00,
    100,
    2
  ),
  (
    'c2222222-2222-2222-2222-222222222223',
    'b2222222-2222-2222-2222-222222222221',
    'Ukuran: Large, Rasa: Kopi Susu Aren',
    '{"ukuran": "Large (22oz)", "rasa": "Kopi Susu Aren"}'::jsonb,
    4000.00,
    80,
    3
  ),
  (
    'c2222222-2222-2222-2222-222222222224',
    'b2222222-2222-2222-2222-222222222221',
    'Ukuran: Large, Rasa: Matcha Latte',
    '{"ukuran": "Large (22oz)", "rasa": "Matcha Latte"}'::jsonb,
    6000.00,
    80,
    4
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Pre-Orders (Demonstrating All Sources & Token Protection)
INSERT INTO public.orders (
  id, order_code, access_token, group_id, buyer_name, buyer_class,
  whatsapp, source, payment_method, payment_status, order_status, total, notes
)
VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    'BZG-20261121-7K9M',
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    'a1111111-1111-1111-1111-111111111111',
    'Aditya Pratama',
    'X MIPA 3',
    '081234567891',
    'public',
    'transfer',
    'paid',
    'confirmed',
    25000.00,
    'Tolong sambalnya dipisah ya.'
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'BZG-20261121-4H2P',
    '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    'a1111111-1111-1111-1111-111111111111',
    'Siti Nurhaliza',
    'XI IPS 1',
    '085678901234',
    'master_admin',
    'cash',
    'unpaid',
    'new',
    20000.00,
    'Pesanan langsung saat promosi ruang kelas XI IPS 1.'
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    'BZG-20261121-9X3T',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    'a2222222-2222-2222-2222-222222222222',
    'Fajar Ramadhan',
    'XII MIPA 4',
    '087812345678',
    'public',
    'cash',
    'unpaid',
    'new',
    16000.00,
    'Ambil pas jam istirahat pertama.'
  )
ON CONFLICT (order_code) DO NOTHING;

-- 6. Insert Order Items (with historical price & name snapshot preservation)
INSERT INTO public.order_items (
  order_id, product_id, variant_id,
  product_name_snapshot, variant_snapshot, variant_attributes_snapshot,
  unit_price_snapshot, quantity, subtotal
)
VALUES
  (
    'd1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111113',
    'Paket Nasi Ayam Bakar Madu',
    'Porsi: Jumbo, Level: Sedang',
    '{"porsi": "Jumbo", "level": "Sedang"}'::jsonb,
    25000.00,
    1,
    25000.00
  ),
  (
    'd2222222-2222-2222-2222-222222222222',
    'b1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Paket Nasi Ayam Bakar Madu',
    'Porsi: Reguler, Level: Sedang',
    '{"porsi": "Reguler", "level": "Sedang"}'::jsonb,
    20000.00,
    1,
    20000.00
  ),
  (
    'd3333333-3333-3333-3333-333333333333',
    'b2222222-2222-2222-2222-222222222221',
    'c2222222-2222-2222-2222-222222222223',
    'Signature Artisan Drink',
    'Ukuran: Large, Rasa: Kopi Susu Aren',
    '{"ukuran": "Large (22oz)", "rasa": "Kopi Susu Aren"}'::jsonb,
    16000.00,
    1,
    16000.00
  )
ON CONFLICT (id) DO NOTHING;
