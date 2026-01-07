-- Add sales_count column to products table if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sales_count INTEGER DEFAULT 0;

-- Function to backfill sales_count based on confirmed orders
DO $$
DECLARE
BEGIN
    -- Reset all counts first to ensure accuracy if re-run
    UPDATE products SET sales_count = 0;

    -- Update products based on aggregation from orders.order_items (JSONB)
    WITH product_sales AS (
        SELECT 
            (item ->> 'product_id')::uuid as product_id,
            SUM((item ->> 'quantity')::int) as total_sold
        FROM 
            orders,
            jsonb_array_elements(order_items::jsonb) as item
        GROUP BY 
            (item ->> 'product_id')::uuid
    )
    UPDATE products
    SET sales_count = product_sales.total_sold
    FROM product_sales
    WHERE products.id = product_sales.product_id;

END $$;
