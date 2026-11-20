-- Migration 007: Stored Functions, Procedures, Triggers, and Atomic Operations
-- Project: B-Zooginer Pre-Order Platform

-- ==============================================================================
-- 1. SECURITY DEFINER HELPER FUNCTIONS (Used in RLS & RPCs)
-- ==============================================================================

-- Check if current authenticated user has the 'master_admin' role
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'master_admin'
  );
$$;

-- Get the role of current authenticated user
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.role_type LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Get the assigned group_id for current authenticated user
CREATE OR REPLACE FUNCTION public.get_my_group_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT group_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ==============================================================================
-- 2. SAFE ORDER CODE GENERATION
-- Format: BZG-YYYYMMDD-XXXX (Uppercase, collision-proof retry loop)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  v_date_part  text;
  v_rand_part  text;
  v_candidate  text;
  v_safe_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- No ambiguous chars: 0/O, 1/I/L
  v_attempts   integer := 0;
BEGIN
  v_date_part := to_char(now() AT TIME ZONE 'UTC', 'YYYYMMDD');
  LOOP
    v_rand_part := '';
    FOR i IN 1..4 LOOP
      v_rand_part := v_rand_part ||
        substr(v_safe_chars, floor(random() * length(v_safe_chars) + 1)::integer, 1);
    END LOOP;
    
    v_candidate := 'BZG-' || v_date_part || '-' || v_rand_part;
    
    -- Verify uniqueness
    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_code = v_candidate) THEN
      RETURN v_candidate;
    END IF;
    
    v_attempts := v_attempts + 1;
    IF v_attempts > 20 THEN
      RAISE EXCEPTION 'Gagal menghasilkan kode pesanan unik setelah 20 percobaan';
    END IF;
  END LOOP;
END;
$$;

-- ==============================================================================
-- 3. ATOMIC STOCK RESERVATION & RESTORATION
-- ==============================================================================

-- Deduct variant stock atomically with row-level lock (FOR UPDATE)
CREATE OR REPLACE FUNCTION public.deduct_variant_stock(
  p_variant_id uuid,
  p_quantity   integer
)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE
  v_current_stock integer;
  v_track_stock   boolean;
BEGIN
  -- Check whether product enforces stock tracking
  SELECT p.track_stock INTO v_track_stock
  FROM public.product_variants pv
  JOIN public.products p ON p.id = pv.product_id
  WHERE pv.id = p_variant_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Varian tidak ditemukan: %', p_variant_id;
  END IF;
  
  -- If stock tracking is not enabled for this product, skip deduction
  IF NOT v_track_stock THEN
    RETURN NULL;
  END IF;
  
  -- Atomic conditional decrement with row lock
  UPDATE public.product_variants
  SET stock = stock - p_quantity
  WHERE id = p_variant_id AND stock >= p_quantity
  RETURNING stock INTO v_current_stock;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stok tidak mencukupi untuk varian % (permintaan: % unit)', p_variant_id, p_quantity;
  END IF;
  
  RETURN v_current_stock;
END;
$$;

-- Restore variant stock atomically
CREATE OR REPLACE FUNCTION public.restore_variant_stock(
  p_variant_id uuid,
  p_quantity   integer
)
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE
  v_current_stock integer;
  v_track_stock   boolean;
BEGIN
  SELECT p.track_stock INTO v_track_stock
  FROM public.product_variants pv
  JOIN public.products p ON p.id = pv.product_id
  WHERE pv.id = p_variant_id;
  
  IF NOT FOUND OR NOT v_track_stock THEN
    RETURN NULL;
  END IF;
  
  UPDATE public.product_variants
  SET stock = stock + p_quantity
  WHERE id = p_variant_id
  RETURNING stock INTO v_current_stock;
  
  RETURN v_current_stock;
END;
$$;

-- Trigger: Automatically restore reserved stock when order status changes to 'cancelled'
CREATE OR REPLACE FUNCTION public.handle_order_cancellation_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Only trigger when order moves from non-cancelled to cancelled
  IF NEW.order_status = 'cancelled' AND OLD.order_status <> 'cancelled' THEN
    FOR v_item IN
      SELECT variant_id, quantity
      FROM public.order_items
      WHERE order_id = NEW.id AND variant_id IS NOT NULL
    LOOP
      PERFORM public.restore_variant_stock(v_item.variant_id, v_item.quantity);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restore_stock_on_order_cancel
  AFTER UPDATE OF order_status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_cancellation_stock();

-- ==============================================================================
-- 4. SECURE TOKEN-GATED PUBLIC ORDER CONFIRMATION RPC
-- Protects student PII and prevents order enumeration
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_order_confirmation(
  p_order_code   text,
  p_access_token text
)
RETURNS TABLE (
  order_code       text,
  buyer_name       text,
  buyer_class      text,
  whatsapp         text,
  group_name       text,
  order_status     public.order_status_type,
  payment_status   public.payment_status_type,
  payment_method   public.payment_method_type,
  total            numeric,
  order_date       date,
  items            json
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.order_code,
    o.buyer_name,
    o.buyer_class,
    o.whatsapp,
    g.name AS group_name,
    o.order_status,
    o.payment_status,
    o.payment_method,
    o.total,
    o.order_date,
    COALESCE(
      json_agg(
        json_build_object(
          'product_name', oi.product_name_snapshot,
          'variant', oi.variant_snapshot,
          'variant_attributes', oi.variant_attributes_snapshot,
          'unit_price', oi.unit_price_snapshot,
          'quantity', oi.quantity,
          'subtotal', oi.subtotal
        )
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'::json
    ) AS items
  FROM public.orders o
  JOIN public.groups g ON g.id = o.group_id
  LEFT JOIN public.order_items oi ON oi.order_id = o.id
  WHERE o.order_code = p_order_code
    AND o.access_token = p_access_token
  GROUP BY o.order_code, o.buyer_name, o.buyer_class, o.whatsapp, g.name,
           o.order_status, o.payment_status, o.payment_method,
           o.total, o.order_date;
END;
$$;

-- Grant execution to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_order_confirmation(text, text) TO anon, authenticated;

-- ==============================================================================
-- 5. ATOMIC PROTECTED PUBLIC ORDER SUBMISSION (Transaction-Safe RPC)
-- Validates: group publish/PO window, product active, variant ownership, stock, and prices
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.submit_public_order(
  p_group_id       uuid,
  p_buyer_name     text,
  p_buyer_class    text,
  p_whatsapp       text,
  p_payment_method public.payment_method_type,
  p_notes          text,
  p_items          jsonb -- Array of { product_id: uuid, variant_id: uuid|null, quantity: integer }
)
RETURNS TABLE (
  order_code   text,
  access_token text,
  total        numeric
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_group_published boolean;
  v_group_po_status public.po_status_type;
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
  v_prod_po_open    timestamptz;
  v_prod_po_close   timestamptz;
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
  -- 1. Validate Group Existence & Availability
  SELECT is_published, po_status INTO v_group_published, v_group_po_status
  FROM public.groups
  WHERE id = p_group_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stan / Kelompok tidak ditemukan';
  END IF;
  
  IF NOT v_group_published OR v_group_po_status <> 'open' THEN
    RAISE EXCEPTION 'Pre-order untuk kelompok ini sedang tidak dibuka';
  END IF;
  
  -- 2. Validate Items Array
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Pesanan harus memiliki minimal 1 produk';
  END IF;
  
  -- 3. Generate Order Code and High-Entropy Access Token
  v_order_code := public.generate_order_code();
  v_access_token := encode(gen_random_bytes(32), 'hex');
  v_order_id := gen_random_uuid();
  
  -- 4. Calculate Total & Validate Products/Variants Server-Side
  FOR v_item_elem IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item_elem->>'product_id')::uuid;
    v_variant_id := (v_item_elem->>'variant_id')::uuid;
    v_qty := (v_item_elem->>'quantity')::integer;
    
    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Jumlah kuantitas tidak valid (harus lebih dari 0)';
    END IF;
    
    -- Verify product
    SELECT group_id, name, base_price, is_active, po_open_at, po_close_at,
           has_variants, track_stock, max_po_qty
    INTO v_prod_group_id, v_prod_name, v_prod_base_price, v_prod_is_active,
         v_prod_po_open, v_prod_po_close, v_prod_has_var, v_prod_track_stk, v_prod_max_qty
    FROM public.products
    WHERE id = v_product_id;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produk tidak ditemukan: %', v_product_id;
    END IF;
    
    IF v_prod_group_id <> p_group_id THEN
      RAISE EXCEPTION 'Produk % bukan milik kelompok terpilih', v_prod_name;
    END IF;
    
    IF NOT v_prod_is_active THEN
      RAISE EXCEPTION 'Produk % sedang tidak aktif', v_prod_name;
    END IF;
    
    -- Check product PO window
    IF v_prod_po_open IS NOT NULL AND now() < v_prod_po_open THEN
      RAISE EXCEPTION 'Pre-order untuk produk % belum dibuka', v_prod_name;
    END IF;
    IF v_prod_po_close IS NOT NULL AND now() > v_prod_po_close THEN
      RAISE EXCEPTION 'Pre-order untuk produk % sudah ditutup', v_prod_name;
    END IF;
    
    -- Check max quantity per order
    IF v_prod_max_qty IS NOT NULL AND v_qty > v_prod_max_qty THEN
      RAISE EXCEPTION 'Jumlah pesanan melebihi batas maksimal % unit untuk produk %', v_prod_max_qty, v_prod_name;
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
      
      IF NOT v_var_active THEN
        RAISE EXCEPTION 'Varian % sedang tidak aktif', v_var_title;
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
  
  -- 5. Insert Parent Order Record
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
    'public',
    p_payment_method,
    'unpaid',
    'new',
    v_calculated_total,
    p_notes,
    NULL
  );
  
  -- 6. Insert Order Items & Deduct Stock Atomically
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
      
      -- Deduct stock atomically
      PERFORM public.deduct_variant_stock(v_variant_id, v_qty);
    ELSE
      v_var_title := NULL;
      v_var_attrs := '{}'::jsonb;
      v_unit_price := v_prod_base_price;
    END IF;
    
    v_subtotal := v_unit_price * v_qty;
    
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
  
  -- Return generated identifiers
  RETURN QUERY SELECT v_order_code, v_access_token, v_calculated_total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_public_order(uuid, text, text, text, public.payment_method_type, text, jsonb) TO anon, authenticated;

-- ==============================================================================
-- 6. MASTER ADMIN BOOTSTRAP PROCEDURE
-- Safely promotes an existing auth user to master_admin if no master_admin exists,
-- or allows existing master_admin to assign/rotate master role.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.bootstrap_master_admin(
  p_user_id   uuid,
  p_full_name text
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_master_count integer;
BEGIN
  -- Count current master admins
  SELECT count(*) INTO v_master_count
  FROM public.profiles
  WHERE role = 'master_admin';
  
  -- Only allow open bootstrap if ZERO master admins exist, OR caller is already a master admin
  IF v_master_count > 0 AND NOT public.is_master_admin() THEN
    RAISE EXCEPTION 'Akses ditolak: Master admin sudah terdaftar dalam sistem';
  END IF;
  
  -- Upsert master admin profile
  INSERT INTO public.profiles (id, role, group_id, full_name)
  VALUES (p_user_id, 'master_admin', NULL, p_full_name)
  ON CONFLICT (id) DO UPDATE SET
    role = 'master_admin',
    group_id = NULL,
    full_name = EXCLUDED.full_name,
    updated_at = now();
    
  RETURN true;
END;
$$;

-- ==============================================================================
-- 7. SECURE SERVER-SIDE GROUP ADMIN ACCOUNT CREATION PROCEDURE
-- Callable strictly by Master Admin to configure a group leader profile
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_group_admin_profile(
  p_user_id   uuid,
  p_full_name text,
  p_group_id  uuid
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Strict permission check: caller MUST be master_admin
  IF NOT public.is_master_admin() THEN
    RAISE EXCEPTION 'Hanya Master Admin yang berhak membuat atau mengatur akun Group Admin';
  END IF;
  
  -- Verify target group exists
  IF NOT EXISTS (SELECT 1 FROM public.groups WHERE id = p_group_id) THEN
    RAISE EXCEPTION 'Kelompok sasaran (%) tidak ditemukan', p_group_id;
  END IF;
  
  -- Upsert profile with group_admin role locked to group_id
  INSERT INTO public.profiles (id, role, group_id, full_name)
  VALUES (p_user_id, 'group_admin', p_group_id, p_full_name)
  ON CONFLICT (id) DO UPDATE SET
    role = 'group_admin',
    group_id = p_group_id,
    full_name = EXCLUDED.full_name,
    updated_at = now();
    
  -- Log action
  INSERT INTO public.activity_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'admin.group_admin_assigned',
    'profile',
    p_user_id::text,
    jsonb_build_object('group_id', p_group_id, 'full_name', p_full_name)
  );
  
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_group_admin_profile(uuid, text, uuid) TO authenticated;
