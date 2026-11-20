-- Migration 008: Comprehensive Row Level Security (RLS) Policies
-- Project: B-Zooginer Pre-Order Platform

-- ==============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.groups FORCE ROW LEVEL SECURITY;
ALTER TABLE public.products FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants FORCE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.order_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings FORCE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. PROFILES POLICIES
-- ==============================================================================

-- SELECT: Master Admin can view all profiles; users can view their own profile
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  USING (
    public.is_master_admin()
    OR id = auth.uid()
  );

-- UPDATE: Master Admin can update any profile; users can update their own full_name
-- (Users CANNOT change their own role or group_id)
CREATE POLICY "profiles_update_master_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_master_admin());

CREATE POLICY "profiles_update_self"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND group_id IS NOT DISTINCT FROM (SELECT p.group_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- DELETE: Master Admin only
CREATE POLICY "profiles_delete_master_admin"
  ON public.profiles FOR DELETE
  USING (public.is_master_admin());

-- ==============================================================================
-- 3. GROUPS POLICIES
-- ==============================================================================

-- SELECT:
-- 1. Anyone (including anonymous) can view published groups
-- 2. Master Admin can view all groups (published or unpublished)
-- 3. Group Admin can view their own assigned group
CREATE POLICY "groups_select_public"
  ON public.groups FOR SELECT
  USING (is_published = true);

CREATE POLICY "groups_select_master_admin"
  ON public.groups FOR SELECT
  USING (public.is_master_admin());

CREATE POLICY "groups_select_assigned_admin"
  ON public.groups FOR SELECT
  USING (id = public.get_my_group_id());

-- INSERT: Master Admin only
CREATE POLICY "groups_insert_master_admin"
  ON public.groups FOR INSERT
  WITH CHECK (public.is_master_admin());

-- UPDATE:
-- Master Admin can update all fields
-- Group Admin can update their own group's description, poster_url, logo_url
CREATE POLICY "groups_update_master_admin"
  ON public.groups FOR UPDATE
  USING (public.is_master_admin());

CREATE POLICY "groups_update_assigned_admin"
  ON public.groups FOR UPDATE
  USING (id = public.get_my_group_id())
  WITH CHECK (
    id = public.get_my_group_id()
    AND is_published = (SELECT g.is_published FROM public.groups g WHERE g.id = id)
    AND slug = (SELECT g.slug FROM public.groups g WHERE g.id = id)
  );

-- DELETE: Master Admin only
CREATE POLICY "groups_delete_master_admin"
  ON public.groups FOR DELETE
  USING (public.is_master_admin());

-- ==============================================================================
-- 4. PRODUCTS POLICIES
-- ==============================================================================

-- SELECT:
-- 1. Public can view active products belonging to published groups
-- 2. Master Admin can view all products
-- 3. Group Admin can view all products of their own group
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_id AND g.is_published = true
    )
  );

CREATE POLICY "products_select_master_admin"
  ON public.products FOR SELECT
  USING (public.is_master_admin());

CREATE POLICY "products_select_group_admin"
  ON public.products FOR SELECT
  USING (group_id = public.get_my_group_id());

-- INSERT: Master Admin (any group) or Group Admin (own group)
CREATE POLICY "products_insert_master_admin"
  ON public.products FOR INSERT
  WITH CHECK (public.is_master_admin());

CREATE POLICY "products_insert_group_admin"
  ON public.products FOR INSERT
  WITH CHECK (
    group_id = public.get_my_group_id()
    AND auth.uid() IS NOT NULL
  );

-- UPDATE: Master Admin (any product) or Group Admin (own group products)
CREATE POLICY "products_update_master_admin"
  ON public.products FOR UPDATE
  USING (public.is_master_admin());

CREATE POLICY "products_update_group_admin"
  ON public.products FOR UPDATE
  USING (group_id = public.get_my_group_id())
  WITH CHECK (group_id = public.get_my_group_id());

-- DELETE: Master Admin (any product) or Group Admin (own group products)
CREATE POLICY "products_delete_master_admin"
  ON public.products FOR DELETE
  USING (public.is_master_admin());

CREATE POLICY "products_delete_group_admin"
  ON public.products FOR DELETE
  USING (group_id = public.get_my_group_id());

-- ==============================================================================
-- 5. PRODUCT_VARIANTS POLICIES
-- ==============================================================================

-- SELECT: Public (active variant, active product, published group), Master Admin, or Group Admin
CREATE POLICY "variants_select_public"
  ON public.product_variants FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM public.products p
      JOIN public.groups g ON g.id = p.group_id
      WHERE p.id = product_id
        AND p.is_active = true
        AND g.is_published = true
    )
  );

CREATE POLICY "variants_select_master_admin"
  ON public.product_variants FOR SELECT
  USING (public.is_master_admin());

CREATE POLICY "variants_select_group_admin"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.group_id = public.get_my_group_id()
    )
  );

-- INSERT: Master Admin or Group Admin for own products
CREATE POLICY "variants_insert_master_admin"
  ON public.product_variants FOR INSERT
  WITH CHECK (public.is_master_admin());

CREATE POLICY "variants_insert_group_admin"
  ON public.product_variants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.group_id = public.get_my_group_id()
    )
  );

-- UPDATE: Master Admin or Group Admin for own products
CREATE POLICY "variants_update_master_admin"
  ON public.product_variants FOR UPDATE
  USING (public.is_master_admin());

CREATE POLICY "variants_update_group_admin"
  ON public.product_variants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.group_id = public.get_my_group_id()
    )
  );

-- DELETE: Master Admin or Group Admin for own products
CREATE POLICY "variants_delete_master_admin"
  ON public.product_variants FOR DELETE
  USING (public.is_master_admin());

CREATE POLICY "variants_delete_group_admin"
  ON public.product_variants FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id AND p.group_id = public.get_my_group_id()
    )
  );

-- ==============================================================================
-- 6. ORDERS POLICIES
-- NOTE: Public users CANNOT directly SELECT or INSERT orders table.
-- Public orders go through submit_public_order() RPC / Edge Function.
-- Public confirmation lookup goes through get_order_confirmation() RPC with access_token.
-- ==============================================================================

-- SELECT: Master Admin sees all; Group Admin sees only assigned group
CREATE POLICY "orders_select_master_admin"
  ON public.orders FOR SELECT
  USING (public.is_master_admin());

CREATE POLICY "orders_select_group_admin"
  ON public.orders FOR SELECT
  USING (group_id = public.get_my_group_id());

-- INSERT: Authenticated manual orders only (Master Admin or Group Admin)
CREATE POLICY "orders_insert_master_admin"
  ON public.orders FOR INSERT
  WITH CHECK (public.is_master_admin());

CREATE POLICY "orders_insert_group_admin"
  ON public.orders FOR INSERT
  WITH CHECK (
    group_id = public.get_my_group_id()
    AND auth.uid() IS NOT NULL
  );

-- UPDATE:
-- Master Admin can update any order
-- Group Admin can update order_status and payment_status for own group
CREATE POLICY "orders_update_master_admin"
  ON public.orders FOR UPDATE
  USING (public.is_master_admin());

CREATE POLICY "orders_update_group_admin"
  ON public.orders FOR UPDATE
  USING (group_id = public.get_my_group_id())
  WITH CHECK (group_id = public.get_my_group_id());

-- DELETE: Master Admin only
CREATE POLICY "orders_delete_master_admin"
  ON public.orders FOR DELETE
  USING (public.is_master_admin());

-- ==============================================================================
-- 7. ORDER_ITEMS POLICIES
-- ==============================================================================

-- SELECT: Inherits from parent order ownership
CREATE POLICY "order_items_select_master_admin"
  ON public.order_items FOR SELECT
  USING (public.is_master_admin());

CREATE POLICY "order_items_select_group_admin"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.group_id = public.get_my_group_id()
    )
  );

-- INSERT: Manual order insertion by authenticated admins
CREATE POLICY "order_items_insert_master_admin"
  ON public.order_items FOR INSERT
  WITH CHECK (public.is_master_admin());

CREATE POLICY "order_items_insert_group_admin"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.group_id = public.get_my_group_id()
    )
  );

-- UPDATE: Explicitly disallowed for all roles (price snapshots must be immutable)
-- No UPDATE policy created for order_items

-- DELETE: Master Admin only (cascades on order delete)
CREATE POLICY "order_items_delete_master_admin"
  ON public.order_items FOR DELETE
  USING (public.is_master_admin());

-- ==============================================================================
-- 8. ACTIVITY_LOGS POLICIES
-- ==============================================================================

-- SELECT: Master Admin only
CREATE POLICY "logs_select_master_admin"
  ON public.activity_logs FOR SELECT
  USING (public.is_master_admin());

-- INSERT: Any authenticated user can append audit logs
CREATE POLICY "logs_insert_authenticated"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE & DELETE: Explicitly disallowed to guarantee tamper-proof audit trail

-- ==============================================================================
-- 9. SITE_SETTINGS POLICIES
-- ==============================================================================

-- SELECT: Publicly readable by everyone
CREATE POLICY "site_settings_select_all"
  ON public.site_settings FOR SELECT
  USING (true);

-- UPDATE: Master Admin only
CREATE POLICY "site_settings_update_master_admin"
  ON public.site_settings FOR UPDATE
  USING (public.is_master_admin())
  WITH CHECK (public.is_master_admin());

-- INSERT & DELETE: Disallowed (singleton row enforced by check constraint id = 1)
