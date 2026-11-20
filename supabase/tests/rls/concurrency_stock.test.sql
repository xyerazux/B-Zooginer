-- Test Suite: Concurrency Stock Reservation & Negative Stock Prevention
-- Project: B-Zooginer Pre-Order Platform

BEGIN;

-- 1. Setup a test variant with exact stock = 2
DO $$
DECLARE
  v_prod_id uuid := gen_random_uuid();
  v_var_id  uuid := gen_random_uuid();
  v_stock1  integer;
  v_stock2  integer;
BEGIN
  -- Insert dummy product
  INSERT INTO public.products (
    id, group_id, name, slug, base_price, track_stock, has_variants, is_active
  ) VALUES (
    v_prod_id, 'a1111111-1111-1111-1111-111111111111', 'Stock Test Product', 'stock-test', 10000, true, true, true
  );

  -- Insert dummy variant with stock = 2
  INSERT INTO public.product_variants (
    id, product_id, title, attributes, stock, is_active
  ) VALUES (
    v_var_id, v_prod_id, 'Ukuran: Reguler', '{"ukuran": "Reguler"}'::jsonb, 2, true
  );

  -- First deduction: 2 units (should succeed and leave stock = 0)
  v_stock1 := public.deduct_variant_stock(v_var_id, 2);
  IF v_stock1 <> 0 THEN
    RAISE EXCEPTION 'Stock deduction failed: expected 0, got %', v_stock1;
  END IF;

  -- Second deduction: 1 unit (must fail with Insufficient Stock exception)
  BEGIN
    v_stock2 := public.deduct_variant_stock(v_var_id, 1);
    RAISE EXCEPTION 'SECURITY BREACH: Stock went negative! Allowed deduction on 0 stock';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'SUCCESS: Atomic stock guard rejected over-reservation on zero stock: %', SQLERRM;
  END;

  -- Test stock restoration on cancellation
  PERFORM public.restore_variant_stock(v_var_id, 2);
  SELECT stock INTO v_stock1 FROM public.product_variants WHERE id = v_var_id;
  IF v_stock1 <> 2 THEN
    RAISE EXCEPTION 'Stock restoration failed: expected 2, got %', v_stock1;
  ELSE
    RAISE NOTICE 'SUCCESS: Stock restoration restored stock to %', v_stock1;
  END IF;
END $$;

ROLLBACK;
