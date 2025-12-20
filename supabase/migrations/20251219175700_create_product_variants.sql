/*
  # Product Variants - Variant-Based Pricing System

  This migration creates the product_variants table for per-combination pricing.
  Each variant represents a specific combination of options (e.g., XL + Red).

  ## Features
  - Separate price and quantity for each variant
  - Optional SKU field for inventory management
  - Full RLS policies for security

  ## Usage
  - Simple products (no options): Use products.current_price and products.quantity
  - Products with variants: Use product_variants for price/quantity per combination
*/

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  option_values jsonb NOT NULL,  -- e.g., {"Size": "XL", "Color": "Red"}
  price numeric(10,2) NOT NULL,
  quantity integer DEFAULT 0,
  sku text,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Store owners can view their variants"
  ON product_variants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_variants.product_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can create variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_variants.product_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_variants.product_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_variants.product_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view variants from public stores"
  ON product_variants FOR SELECT
  TO anon
  USING (true);

-- Update inventory trigger to handle variants
DROP TRIGGER IF EXISTS trigger_update_quantities_on_order ON orders;
DROP FUNCTION IF EXISTS update_product_quantities_on_order();

CREATE OR REPLACE FUNCTION update_product_quantities_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item jsonb;
  product_id_val uuid;
  variant_id_val uuid;
  quantity_val integer;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.order_items)
  LOOP
    product_id_val := (item->>'product_id')::uuid;
    variant_id_val := (item->>'variant_id')::uuid;
    quantity_val := (item->>'quantity')::integer;

    IF variant_id_val IS NOT NULL THEN
      -- Product with variants: decrement variant quantity
      UPDATE product_variants
      SET quantity = quantity - quantity_val
      WHERE id = variant_id_val;
    ELSE
      -- Simple product: decrement product quantity
      UPDATE products
      SET quantity = quantity - quantity_val
      WHERE id = product_id_val;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quantities_on_order
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION update_product_quantities_on_order();
