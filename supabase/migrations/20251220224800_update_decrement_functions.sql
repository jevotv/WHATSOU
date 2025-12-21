/*
  # Update Decrement Quantity Functions

  Updates the decrement functions to check for `unlimited_stock` flag.
  If `unlimited_stock` is true, the quantity will NOT be decremented.
*/

-- Function to decrement product quantity
CREATE OR REPLACE FUNCTION decrement_product_quantity(
  p_product_id uuid,
  p_quantity integer
)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement variant quantity
CREATE OR REPLACE FUNCTION decrement_variant_quantity(
  p_variant_id uuid,
  p_quantity integer
)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
