/*
  # Add image_index to product_variants
  
  This migration adds an optional image_index column to product_variants.
  When a customer selects a variant, the storefront will show the corresponding image.
  
  - NULL = use default (first) image
  - 0-4 = index of the image in product_images (ordered by display_order)
  
  This is backward compatible - existing variants will have NULL (default behavior).
*/

ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS image_index integer DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN product_variants.image_index IS 'Index of the product image to show when this variant is selected (0-based). NULL = use default image.';
