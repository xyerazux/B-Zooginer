-- Migration 009: Storage Buckets Setup & Atomic Admin Manual Order Submission RPC
-- Project: B-Zooginer Pre-Order Platform

-- ==============================================================================
-- 1. STORAGE BUCKETS CONFIGURATION
-- ==============================================================================

-- Create buckets for media if storage schema is available
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('groups-media',   'groups-media',   true, 2097152, '{image/webp,image/jpeg,image/png}'),
  ('products-media', 'products-media', true, 2097152, '{image/webp,image/jpeg,image/png}'),
  ('site-assets',    'site-assets',    true, 2097152, '{image/webp,image/jpeg,image/png,image/svg+xml}')
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS: Public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access on Media Buckets'
  ) THEN
    CREATE POLICY "Public Access on Media Buckets"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('groups-media', 'products-media', 'site-assets'));
  END IF;
END $$;

-- Storage RLS: Authenticated admin upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Admins can upload media'
  ) THEN
    CREATE POLICY "Admins can upload media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id IN ('groups-media', 'products-media', 'site-assets')
      AND (
        public.is_master_admin()
        OR (
          public.get_my_role() = 'group_admin'
          AND bucket_id IN ('groups-media', 'products-media')
        )
      )
    );
  END IF;
END $$;

-- Storage RLS: Authenticated admin delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Admins can delete media'
  ) THEN
    CREATE POLICY "Admins can delete media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id IN ('groups-media', 'products-media', 'site-assets')
      AND (
        public.is_master_admin()
        OR (
          public.get_my_role() = 'group_admin'
          AND bucket_id IN ('groups-media', 'products-media')
        )
      )
    );
  END IF;
END $$;

-- ==============================================================================
-- 2. ATOMIC ADMIN MANUAL ORDER SUBMISSION RPC
-- Supports Roadshow Mode / Manual POS Order Entry
-- Supports Order Sources: 'master_admin' or 'group_admin'
-- Validates caller permissions, atomic stock deductions, and preserves historical snapshots
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.submit_admin_order(
  p_group_id       uuid,
  p_buyer_name     text,
  p_buyer_class    text,
  p_whatsapp       text,
  p_payment_method public.payment_method_type,
  p_payment_status public.payment_status_type,
  p_notes          text,
  p_items          jsonb -- Array of { product_id: uuid, variant_id: uuid|null, quantity: integer }
)
RETURNS TABLE (
  order_id     uuid,
  order_code   text,
  access_token text,
  total        numeric
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_caller_role     public.role_type;
  v_my_group_id     uuid;
  v_order_source    public.order_source_type;
  v_order_id        uuid;
  v_order_code      text;
  v_access_token    text;
  v_calculated_total numeric(12,2) := 0.00;
  v_item_elem       jsonb;
  v_product_id      uuid;
  v_variant_id      uuid;
  v_qty             integer;
  
  -- Product validation variables
  v_prod_group_id   uuid;
  v_prod_name       text;
  v_prod_base_price numeric(12,2);
  v_prod_is_active  boolean;
  v_prod_has_var    boolean;
  v_prod_track_stk  boolean;
  v_prod_max_qty    integer;
  
  -- Variant validation variables
  v_var_prod_id     uuid;
  v_var_title       text;
  v_var_attrs       jsonb;
  v_var_adj         numeric(12,2);
  v_var_active      boolean;
  v_unit_price      numeric(12,2);
  v_subtotal        numeric(12,2);
BEGIN
  -- 1. Check Caller Authentication & Role
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Akses ditolak: Pengguna harus login untuk membuat pesanan manual';
  END IF;
  
  v_caller_role := public.get_my_role();
  IF v_caller_role IS NULL THEN
    RAISE EXCEPTION 'Akses ditolak: Profil pengguna tidak memiliki peran admin yang valid';
  END IF;
  
  -- Determine order source based on admin role
  IF v_caller_role = 'master_admin' THEN
    v_order_source := 'master_admin';
  ELSIF v_caller_role = 'group_admin' THEN
    v_order_source := 'group_admin';
    v_my_group_id := public.get_my_group_id();
    IF v_my_group_id IS NULL OR v_my_group_id <> p_group_id THEN
      RAISE EXCEPTION 'Akses ditolak: Group Admin hanya dapat membuat pesanan untuk stan kelompok sendiri';
    END IF;
  ELSE
    RAISE EXCEPTION 'Peran tidak diizinkan membuat pesanan manual';
  END IF;
  
  -- 2. Validate Target Group Exists
  IF NOT EXISTS (SELECT 1 FROM public.groups WHERE id = p_group_id) THEN
    RAISE EXCEPTION 'Stan / Kelompok sasaran (%) tidak ditemukan', p_group_id;
  END IF;
  
  -- 3. Validate Items Array
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Pesanan harus memiliki minimal 1 produk';
  END IF;
  
  -- 4. Generate Identifiers
  v_order_id := gen_random_uuid();
  v_order_code := public.generate_order_code();
  v_access_token := encode(gen_random_bytes(32), 'hex');
  
  -- 5. Calculate Total & Validate Products/Variants Server-Side
  FOR v_item_elem IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item_elem->>'product_id')::uuid;
    v_variant_id := (v_item_elem->>'variant_id')::uuid;
    v_qty := (v_item_elem->>'quantity')::integer;
    
    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Jumlah kuantitas tidak valid (harus lebih dari 0)';
    END IF;
    
    -- Verify product
    SELECT group_id, name, base_price, is_active, has_variants, track_stock, max_po_qty
    INTO v_prod_group_id, v_prod_name, v_prod_base_price, v_prod_is_active,
         v_prod_has_var, v_prod_track_stk, v_prod_max_qty
    FROM public.products
    WHERE id = v_product_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produk tidak ditemukan: %', v_product_id;
    END IF;
    
    IF v_prod_group_id <> p_group_id THEN
      RAISE EXCEPTION 'Produk % bukan milik kelompok terpilih', v_prod_name;
    END IF;
    
    -- Validate variants
    IF v_prod_has_var THEN
      IF v_variant_id IS NULL THEN
        RAISE EXCEPTION 'Varian wajib dipilih untuk produk %', v_prod_name;
      END IF;
      
      SELECT product_id, title, attributes, price_adjustment, is_active
      INTO v_var_prod_id, v_var_title, v_var_attrs, v_var_adj, v_var_active
      FROM public.product_variants
      WHERE id = v_variant_id;
      
      IF NOT FOUND OR v_var_prod_id <> v_product_id THEN
        RAISE EXCEPTION 'Varian tidak valid untuk produk %', v_prod_name;
      END IF;
      
      v_unit_price := v_prod_base_price + v_var_adj;
    ELSE
      v_variant_id := NULL;
      v_var_title := NULL;
      v_var_attrs := '{}'::jsonb;
      v_unit_price := v_prod_base_price;
    END IF;
    
    v_subtotal := v_unit_price * v_qty;
    v_calculated_total := v_calculated_total + v_subtotal;
  END LOOP;
  
  -- 6. Insert Order Record
  INSERT INTO public.orders (
    id,
    order_code,
    access_token,
    group_id,
    buyer_name,
    buyer_class,
    whatsapp,
    source,
    payment_method,
    payment_status,
    order_status,
    total,
    notes,
    created_by
  ) VALUES (
    v_order_id,
    v_order_code,
    v_access_token,
    p_group_id,
    trim(p_buyer_name),
    trim(p_buyer_class),
    trim(p_whatsapp),
    v_order_source,
    p_payment_method,
    COALESCE(p_payment_status, 'unpaid'),
    'new',
    v_calculated_total,
    p_notes,
    auth.uid()
  );
  
  -- 7. Insert Order Items & Deduct Stock Atomically
  FOR v_item_elem IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item_elem->>'product_id')::uuid;
    v_variant_id := (v_item_elem->>'variant_id')::uuid;
    v_qty := (v_item_elem->>'quantity')::integer;
    
    SELECT name, base_price, has_variants INTO v_prod_name, v_prod_base_price, v_prod_has_var
    FROM public.products WHERE id = v_product_id;
    
    IF v_prod_has_var THEN
      SELECT title, attributes, price_adjustment
      INTO v_var_title, v_var_attrs, v_var_adj
      FROM public.product_variants WHERE id = v_variant_id;
      v_unit_price := v_prod_base_price + v_var_adj;
      
      -- Deduct variant stock atomically (enforces row-lock & prevents overselling)
      PERFORM public.deduct_variant_stock(v_variant_id, v_qty);
    ELSE
      v_var_title := NULL;
      v_var_attrs := '{}'::jsonb;
      v_unit_price := v_prod_base_price;
    END IF;
    
    v_subtotal := v_unit_price * v_qty;
    
    -- Save immutable snapshot
    INSERT INTO public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name_snapshot,
      variant_snapshot,
      variant_attributes_snapshot,
      unit_price_snapshot,
      quantity,
      subtotal
    ) VALUES (
      v_order_id,
      v_product_id,
      v_variant_id,
      v_prod_name,
      v_var_title,
      v_var_attrs,
      v_unit_price,
      v_qty,
      v_subtotal
    );
  END LOOP;
  
  -- 8. Log Order Creation Activity
  INSERT INTO public.activity_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'order.manual_created',
    'order',
    v_order_id::text,
    jsonb_build_object(
      'order_code', v_order_code,
      'group_id', p_group_id,
      'source', v_order_source,
      'total', v_calculated_total,
      'payment_status', p_payment_status
    )
  );
  
  RETURN QUERY SELECT v_order_id, v_order_code, v_access_token, v_calculated_total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_admin_order(
  uuid, text, text, text, public.payment_method_type, public.payment_status_type, text, jsonb
) TO authenticated;
