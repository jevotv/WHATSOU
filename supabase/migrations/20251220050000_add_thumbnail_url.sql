-- Add thumbnail_url column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS thumbnail_url text;
