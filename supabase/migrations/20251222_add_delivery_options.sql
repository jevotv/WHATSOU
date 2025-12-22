/*
  # Add Delivery Options
  
  ## Changes
  1. Add delivery options to stores table
  2. Add delivery_type to orders table
  3. Make customer_address nullable in orders
*/

-- Add delivery options to stores
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS allow_delivery boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_pickup boolean DEFAULT false;

-- Add delivery_type to orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_type text DEFAULT 'delivery';

-- Make customer_address nullable
ALTER TABLE orders 
ALTER COLUMN customer_address DROP NOT NULL;

-- Add check constraint for delivery_type
ALTER TABLE orders 
ADD CONSTRAINT orders_delivery_type_check 
CHECK (delivery_type IN ('delivery', 'pickup'));
