/*
  # WhatSou - WhatsApp Commerce Platform

  ## Overview
  Complete multi-tenant SaaS schema for WhatsApp-based e-commerce.

  ## Tables Created
  
  ### 1. stores
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `name` (text) - Store display name
  - `slug` (text, unique) - URL-friendly identifier
  - `whatsapp_number` (text) - WhatsApp contact number
  - `logo_url` (text) - Store logo image URL
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 2. products
  - `id` (uuid, primary key)
  - `store_id` (uuid, references stores)
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `current_price` (numeric) - Selling price
  - `original_price` (numeric) - Original/compare price
  - `image_url` (text) - Product image URL
  - `category` (text) - Product category
  - `quantity` (integer) - Stock quantity
  - `options` (jsonb) - Product variants (max 3 options)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

  ### 3. orders
  - `id` (uuid, primary key)
  - `store_id` (uuid, references stores)
  - `customer_name` (text)
  - `customer_phone` (text)
  - `customer_address` (text)
  - `order_items` (jsonb) - Cart snapshot with selected options
  - `total_price` (numeric)
  - `created_at` (timestamp)

  ## Security
  - RLS enabled on all tables
  - Store owners can only access their own data
  - Public read access to stores and products by slug
  - Orders are private to store owners
*/

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  whatsapp_number text NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  current_price numeric(10,2) NOT NULL DEFAULT 0,
  original_price numeric(10,2),
  image_url text,
  category text,
  quantity integer DEFAULT 0,
  options jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  order_items jsonb NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);

-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores table
CREATE POLICY "Store owners can view their own stores"
  ON stores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Store owners can create stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Store owners can update their own stores"
  ON stores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Store owners can delete their own stores"
  ON stores FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view stores by slug"
  ON stores FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for products table
CREATE POLICY "Store owners can view their products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update their products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete their products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view products from public stores"
  ON products FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for orders table
CREATE POLICY "Store owners can view their orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();