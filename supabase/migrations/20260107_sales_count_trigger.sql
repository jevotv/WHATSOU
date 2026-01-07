-- Function to increment sales_count
CREATE OR REPLACE FUNCTION increment_product_sales()
RETURNS TRIGGER AS $$
DECLARE
    item jsonb;
BEGIN
    -- Loop through the items in the new order (parse JSON)
    -- We assume order_items is stored as JSONB
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.order_items::jsonb)
    LOOP
        -- Update the product's sales_count
        UPDATE products
        SET sales_count = COALESCE(sales_count, 0) + (item ->> 'quantity')::int
        WHERE id = (item ->> 'product_id')::uuid;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after a new order is created
DROP TRIGGER IF EXISTS on_order_created ON orders;
CREATE TRIGGER on_order_created
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION increment_product_sales();
