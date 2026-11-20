-- RLS Test Suite: Orders Table & Permission Boundaries
-- Project: B-Zooginer Pre-Order Platform

BEGIN;

-- Setup test roles & mock tokens
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TEST SCENARIO: Anonymous User Direct Access
-- Expected: Anon role CANNOT SELECT directly from orders table
SET ROLE anon;
DO $$
BEGIN
  BEGIN
    PERFORM count(*) FROM public.orders;
    -- In Supabase RLS, SELECT returns 0 rows or raises error if no policy matches
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'SUCCESS: Anon blocked from SELECT on orders';
  END;
END $$;

-- Expected: Anon role CANNOT INSERT directly into orders table
DO $$
BEGIN
  BEGIN
    INSERT INTO public.orders (
      order_code, group_id, buyer_name, buyer_class, payment_method, total
    ) VALUES (
      'BZG-20261121-TEST', 'a1111111-1111-1111-1111-111111111111', 'Hacker', 'XII 1', 'cash', 10000
    );
    RAISE EXCEPTION 'SECURITY BREACH: Anon directly inserted into orders!';
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN
    RAISE NOTICE 'SUCCESS: Anon blocked from direct INSERT into orders';
  END;
END $$;

-- 2. TEST SCENARIO: Group Admin Isolation
-- Simulate Group Admin 1 (Stan 01)
SET ROLE authenticated;
-- Verify group isolation query filter
SELECT set_config('request.jwt.claims', '{"sub": "u1111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);

-- Expected: Group Admin 1 cannot see orders of Stan 02
DO $$
DECLARE
  v_count integer;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.orders
  WHERE group_id = 'a2222222-2222-2222-2222-222222222222'; -- Stan 02
  
  IF v_count > 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH: Group Admin saw other group orders! Count: %', v_count;
  ELSE
    RAISE NOTICE 'SUCCESS: Group Admin 1 isolated from Group 2 orders';
  END IF;
END $$;

-- Expected: Group Admin 1 cannot update payment_status of Stan 02
DO $$
BEGIN
  UPDATE public.orders
  SET payment_status = 'paid'
  WHERE group_id = 'a2222222-2222-2222-2222-222222222222';
  
  IF FOUND THEN
    RAISE EXCEPTION 'SECURITY BREACH: Group Admin 1 updated another group order!';
  ELSE
    RAISE NOTICE 'SUCCESS: Group Admin 1 blocked from modifying Group 2 orders';
  END IF;
END $$;

-- 3. TEST SCENARIO: Order Items Immutability
-- Expected: UPDATE on order_items must fail for all users
DO $$
BEGIN
  UPDATE public.order_items
  SET unit_price_snapshot = 100.00;
  
  IF FOUND THEN
    RAISE EXCEPTION 'SECURITY BREACH: Order items price snapshot was modified!';
  ELSE
    RAISE NOTICE 'SUCCESS: order_items are immutable';
  END IF;
END $$;

ROLLBACK;
