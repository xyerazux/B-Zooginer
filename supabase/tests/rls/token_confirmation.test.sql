-- Test Suite: Token-Gated Public Order Confirmation & Anti-Enumeration
-- Project: B-Zooginer Pre-Order Platform

BEGIN;

DO $$
DECLARE
  v_code  text := 'BZG-20261121-7K9M';
  v_token text := 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  v_wrong_token text := '0000000000000000000000000000000000000000000000000000000000000000';
  v_row_count integer;
BEGIN
  -- 1. Test query with CORRECT code and CORRECT token (must return 1 row)
  SELECT count(*) INTO v_row_count
  FROM public.get_order_confirmation(v_code, v_token);
  
  IF v_row_count <> 1 THEN
    RAISE EXCEPTION 'Order confirmation lookup failed with valid token! Rows: %', v_row_count;
  ELSE
    RAISE NOTICE 'SUCCESS: Order retrieved successfully with valid code and token';
  END IF;

  -- 2. Test query with CORRECT code but WRONG token (must return 0 rows — anti-enumeration)
  SELECT count(*) INTO v_row_count
  FROM public.get_order_confirmation(v_code, v_wrong_token);
  
  IF v_row_count <> 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH: Order retrieved with invalid token! Anti-enumeration broken.';
  ELSE
    RAISE NOTICE 'SUCCESS: Order query blocked with invalid token (0 rows returned)';
  END IF;

  -- 3. Test query with WRONG code and CORRECT token (must return 0 rows)
  SELECT count(*) INTO v_row_count
  FROM public.get_order_confirmation('BZG-20261121-0000', v_token);
  
  IF v_row_count <> 0 THEN
    RAISE EXCEPTION 'SECURITY BREACH: Order retrieved with mismatched order code!';
  ELSE
    RAISE NOTICE 'SUCCESS: Order query blocked with mismatched code';
  END IF;
END $$;

ROLLBACK;
