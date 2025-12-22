/*
  # Remove Order Quantity Trigger

  This migration removes the `trigger_update_quantities_on_order` and its associated function.
  
  Reasons:
  1. It causes double counting because the frontend already calls `decrement_product_quantity`.
  2. The trigger logic does not verify `unlimited_stock`, leading to incorrect decrements for unlimited items.
  3. We are consolidating stock logic in the `decrement_product_quantity` RPC functions which are correctly updated.
*/

DROP TRIGGER IF EXISTS trigger_update_quantities_on_order ON orders;
DROP FUNCTION IF EXISTS update_product_quantities_on_order();
