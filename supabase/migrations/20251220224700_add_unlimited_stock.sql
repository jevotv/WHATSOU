/*
  # Add Unlimited Stock Flag

  Adds an `unlimited_stock` boolean column to both `products` and `product_variants` tables.
  Default is false to maintain existing behavior.
*/

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS unlimited_stock boolean DEFAULT false;

ALTER TABLE product_variants
ADD COLUMN IF NOT EXISTS unlimited_stock boolean DEFAULT false;
