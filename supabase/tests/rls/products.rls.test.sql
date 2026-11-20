-- RLS Test Suite: Products & Variants Isolation
-- Project: B-Zooginer Pre-Order Platform

BEGIN;

-- 1. TEST SCENARIO: Anonymous Storefront Visibility
SET ROLE anon;

-- Expected: Anon can ONLY see active products belonging to published groups
DO $$
DECLARE
  v_invalid_count integer;
BEGIN
  SELECT count(*) INTO v_invalid_count
  FROM public.products p
  JOIN public.groups g ON g.id = p.group_id
  WHERE (p.is_active = false) OR (g.is_published = false);
  
  IF v_invalid_count > 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH: Anon can see inactive products or unpublished groups!';
  ELSE
    RAISE NOTICE 'SUCCESS: Anon only sees active products from published groups';
  END IF;
END $$;

-- Expected: Anon CANNOT INSERT or UPDATE products
DO $$
BEGIN
  BEGIN
    INSERT INTO public.products (group_id, name, slug, base_price)
    VALUES ('a1111111-1111-1111-1111-111111111111', 'Spam Product', 'spam', 1000);
    RAISE EXCEPTION 'SECURITY BREACH: Anon created a product!';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'SUCCESS: Anon blocked from product creation';
  END;
END $$;

-- 2. TEST SCENARIO: Group Admin Isolation
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "u1111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);

-- Expected: Group Admin 1 cannot insert a product into Stan 02
DO $$
BEGIN
  BEGIN
    INSERT INTO public.products (group_id, name, slug, base_price)
    VALUES ('a2222222-2222-2222-2222-222222222222', 'Illegal Product', 'illegal', 5000);
    RAISE EXCEPTION 'SECURITY BREACH: Group Admin 1 created product for Group 2!';
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN
    RAISE NOTICE 'SUCCESS: Group Admin 1 blocked from creating product for Group 2';
  END;
END $$;

ROLLBACK;
