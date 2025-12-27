/*
  # Secure Functions (Search Path Vulnerability Fix)

  Updates the following functions to have an explicit `search_path` set to `public`.
  This prevents potential security issues where the function could be executed with a malicious search path.

  Functions updated:
  1. decrement_product_quantity
  2. decrement_variant_quantity
  3. update_updated_at_column
*/

-- 1. Secure decrement_product_quantity
CREATE OR REPLACE FUNCTION decrement_product_quantity(
  p_product_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unlimited boolean;
BEGIN
  -- Check if product has unlimited stock
  SELECT unlimited_stock INTO v_unlimited
  FROM products
  WHERE id = p_product_id;

  -- Only decrement if NOT unlimited
  IF v_unlimited IS NULL OR v_unlimited = false THEN
    UPDATE products
    SET quantity = GREATEST(0, quantity - p_quantity)
    WHERE id = p_product_id;
  END IF;
END;
$$;

-- 2. Secure decrement_variant_quantity
CREATE OR REPLACE FUNCTION decrement_variant_quantity(
  p_variant_id uuid,
  p_quantity integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unlimited boolean;
BEGIN
  -- Check if variant has unlimited stock
  SELECT unlimited_stock INTO v_unlimited
  FROM product_variants
  WHERE id = p_variant_id;

  -- Only decrement if NOT unlimited
  IF v_unlimited IS NULL OR v_unlimited = false THEN
    UPDATE product_variants
    SET quantity = GREATEST(0, quantity - p_quantity)
    WHERE id = p_variant_id;
  END IF;
END;
$$;

-- 3. Secure update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
