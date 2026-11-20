-- Migration 006: Comprehensive Database Indexes
-- Project: B-Zooginer Pre-Order Platform

-- 1. GROUPS table indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_slug ON public.groups (slug);
CREATE INDEX IF NOT EXISTS idx_groups_published_sort ON public.groups (is_published, sort_order) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_groups_po_status ON public.groups (po_status);

-- 2. PROFILES table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_group_id ON public.profiles (group_id) WHERE group_id IS NOT NULL;

-- 3. PRODUCTS table indexes
CREATE INDEX IF NOT EXISTS idx_products_group_id ON public.products (group_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products (group_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_po_window ON public.products (po_open_at, po_close_at);

-- 4. PRODUCT_VARIANTS table indexes
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants (product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_variants_active ON public.product_variants (product_id, is_active);

-- 5. ORDERS table indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_code ON public.orders (order_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_access_token ON public.orders (access_token);
CREATE INDEX IF NOT EXISTS idx_orders_group_id ON public.orders (group_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_group_date ON public.orders (group_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_search ON public.orders (buyer_name, buyer_class);

-- 6. ORDER_ITEMS table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items (variant_id) WHERE variant_id IS NOT NULL;

-- 7. ACTIVITY_LOGS table indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON public.activity_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_desc ON public.activity_logs (created_at DESC);
