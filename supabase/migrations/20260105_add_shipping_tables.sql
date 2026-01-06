/*
  # Shipping Zones Feature
  
  ## Tables Created
  1. cities - Egyptian governorates (28 cities)
  2. districts - City districts (3580+ districts)
  
  ## Columns Added to stores
  - shipping_config (JSONB) - Shipping configuration
  - free_shipping_threshold (NUMERIC) - Minimum order for free shipping
*/

-- =============================================
-- 1. جدول المحافظات
-- =============================================
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL
);

-- =============================================
-- 2. جدول المناطق
-- =============================================
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL
);

-- =============================================
-- 3. إضافة أعمدة الشحن للمتاجر
-- =============================================
ALTER TABLE stores ADD COLUMN IF NOT EXISTS shipping_config JSONB DEFAULT '{"type":"none"}'::jsonb;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS free_shipping_threshold NUMERIC(10,2) DEFAULT NULL;

-- =============================================
-- 4. Check Constraints
-- =============================================
ALTER TABLE stores ADD CONSTRAINT chk_free_shipping_threshold_positive 
    CHECK (free_shipping_threshold IS NULL OR free_shipping_threshold >= 0);

-- =============================================
-- 5. Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_cities_name_ar ON cities(name_ar);
CREATE INDEX IF NOT EXISTS idx_districts_city_id ON districts(city_id);
CREATE INDEX IF NOT EXISTS idx_districts_name_ar ON districts(name_ar);
CREATE INDEX IF NOT EXISTS idx_stores_shipping_config ON stores USING GIN (shipping_config);

-- =============================================
-- 6. Row Level Security
-- =============================================
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Anyone can read cities and districts (public reference data)
CREATE POLICY "Anyone can read cities" ON cities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can read districts" ON districts FOR SELECT TO anon, authenticated USING (true);
