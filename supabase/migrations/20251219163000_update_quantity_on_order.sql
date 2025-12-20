/*
  # Inventory Management - Auto-update quantity on order

  This migration adds a trigger that automatically decreases product quantities
  when an order is placed.

  ## Changes
  1. Creates a function `update_product_quantities_on_order` that:
     - Loops through order_items in the new order
     - Decrements the quantity for each product
  2. Creates a trigger on the `orders` table that fires AFTER INSERT
*/

-- Function to update product quantities when an order is placed
CREATE OR REPLACE FUNCTION update_product_quantities_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item jsonb;
  product_id_val uuid;
  quantity_val integer;
BEGIN
  -- Loop through each item in the order_items array
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.order_items)
  LOOP
    product_id_val := (item->>'product_id')::uuid;
    quantity_val := (item->>'quantity')::integer;

    -- Decrease the product quantity
    UPDATE products
    SET quantity = quantity - quantity_val
    WHERE id = product_id_val;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after an order is inserted
CREATE TRIGGER trigger_update_quantities_on_order
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION update_product_quantities_on_order();
