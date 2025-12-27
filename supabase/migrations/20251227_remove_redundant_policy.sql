/*
  # Remove Redundant RLS Policy

  Removes "Store owners can view their variants" from `product_variants`.
  This policy is redundant because "Store owners can manage variants" is defined as `FOR ALL`, which already includes `SELECT`.
*/

DROP POLICY IF EXISTS "Store owners can view their variants" ON product_variants;
