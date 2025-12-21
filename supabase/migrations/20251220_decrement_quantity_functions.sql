/*
  # Decrement Quantity Functions

  Creates database functions to decrement product and variant quantities.
  These are called via RPC when an order is placed via WhatsApp checkout.

  ## Functions
  1. decrement_product_quantity: Decreases quantity for simple products
  2. decrement_variant_quantity: Decreases quantity for product variants
*/

-- Function to decrement product quantity
CREATE OR REPLACE FUNCTION decrement_product_quantity(
  p_product_id uuid,
  p_quantity integer
)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET quantity = GREATEST(0, quantity - p_quantity)
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement variant quantity
CREATE OR REPLACE FUNCTION decrement_variant_quantity(
  p_variant_id uuid,
  p_quantity integer
)
RETURNS void AS $$
BEGIN
  UPDATE product_variants
  SET quantity = GREATEST(0, quantity - p_quantity)
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to anonymous users (for storefront checkout)
GRANT EXECUTE ON FUNCTION decrement_product_quantity(uuid, integer) TO anon;
GRANT EXECUTE ON FUNCTION decrement_variant_quantity(uuid, integer) TO anon;
