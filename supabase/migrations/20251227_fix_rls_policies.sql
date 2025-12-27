/*
  # Fix RLS Policies (Performance & Redundancy)

  1. Optimization:
     - Replaces direct `auth.uid()` calls with `(select auth.uid())` to prevent per-row re-evaluation.

  2. Cleanup:
     - Drops redundant/duplicate policies identified in warnings.
     - Consolidates permissions into single, clear policies per action.

  Affected Tables: stores, products, orders, product_variants, users
*/

-- ==========================================
-- 1. STORES
-- ==========================================

-- Drop potentially redundant policies
DROP POLICY IF EXISTS "Store owners can view their own stores" ON stores;
DROP POLICY IF EXISTS "Store owners can view their stores" ON stores;
DROP POLICY IF EXISTS "Store owners can create stores" ON stores;
DROP POLICY IF EXISTS "Users can create their own store" ON stores;
DROP POLICY IF EXISTS "Store owners can update their own stores" ON stores;
DROP POLICY IF EXISTS "Users can update their own store" ON stores;
DROP POLICY IF EXISTS "Store owners can delete their own stores" ON stores;
DROP POLICY IF EXISTS "Users can delete their own store" ON stores;
DROP POLICY IF EXISTS "Anyone can view stores by slug" ON stores;
DROP POLICY IF EXISTS "Public can view stores" ON stores;
DROP POLICY IF EXISTS "Public stores are viewable by everyone" ON stores;

-- Re-create optimized policies
CREATE POLICY "Store owners can view their own stores"
  ON stores FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Store owners can create stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Store owners can update their own stores"
  ON stores FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Store owners can delete their own stores"
  ON stores FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Anyone can view stores by slug"
  ON stores FOR SELECT
  TO anon
  USING (true);


-- ==========================================
-- 2. PRODUCTS
-- ==========================================

-- Drop potentially redundant policies
DROP POLICY IF EXISTS "Store owners can view their products" ON products;
DROP POLICY IF EXISTS "Store owners can create products" ON products;
DROP POLICY IF EXISTS "Store owners can insert products" ON products;
DROP POLICY IF EXISTS "Store owners can update their products" ON products;
DROP POLICY IF EXISTS "Store owners can update products" ON products;
DROP POLICY IF EXISTS "Store owners can delete their products" ON products;
DROP POLICY IF EXISTS "Store owners can delete products" ON products;
DROP POLICY IF EXISTS "Anyone can view products from public stores" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;

-- Re-create optimized policies
CREATE POLICY "Store owners can view their products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Store owners can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Store owners can update their products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Store owners can delete their products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Anyone can view products from public stores"
  ON products FOR SELECT
  TO anon
  USING (true);


-- ==========================================
-- 3. ORDERS
-- ==========================================

-- Drop potentially redundant policies
DROP POLICY IF EXISTS "Store owners can view their orders" ON orders;
DROP POLICY IF EXISTS "Store owners can view orders" ON orders;
DROP POLICY IF EXISTS "Store owners can update orders" ON orders;
DROP POLICY IF EXISTS "Store owners can update their orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Re-create optimized policies
CREATE POLICY "Store owners can view their orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = (select auth.uid())
    )
  );
  
CREATE POLICY "Store owners can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = orders.store_id
      AND stores.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);


-- ==========================================
-- 4. PRODUCT VARIANTS
-- ==========================================

-- Drop potentially redundant policies
DROP POLICY IF EXISTS "Store owners can insert variants" ON product_variants;
DROP POLICY IF EXISTS "Store owners can create variants" ON product_variants;
DROP POLICY IF EXISTS "Store owners can view their variants" ON product_variants;
DROP POLICY IF EXISTS "Store owners can update variants" ON product_variants;
DROP POLICY IF EXISTS "Store owners can delete variants" ON product_variants;
DROP POLICY IF EXISTS "Public variants are viewable by everyone" ON product_variants;
DROP POLICY IF EXISTS "Anyone can view variants from public stores" ON product_variants;

CREATE POLICY "Store owners can view their variants"
  ON product_variants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_variants.product_id
      AND s.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Store owners can manage variants"
  ON product_variants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_variants.product_id
      AND s.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      JOIN stores s ON s.id = p.store_id
      WHERE p.id = product_variants.product_id
      AND s.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Anyone can view variants from public stores"
  ON product_variants FOR SELECT
  TO anon
  USING (true);


-- ==========================================
-- 5. USERS (if exists per warnings)
-- ==========================================

DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));
