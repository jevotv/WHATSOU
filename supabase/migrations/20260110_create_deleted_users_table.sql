/*
  # Deleted Users Audit Table
  
  Creates a table to track deleted accounts for compliance and analytics.
  Records are created BEFORE user deletion to preserve audit trail.
*/

CREATE TABLE IF NOT EXISTS deleted_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_user_id uuid NOT NULL,
  phone text NOT NULL,
  store_name text,
  store_slug text,
  deletion_reason text,
  total_orders integer DEFAULT 0,
  total_products integer DEFAULT 0,
  deleted_at timestamptz DEFAULT now()
);

-- Indexes for audit queries
CREATE INDEX idx_deleted_users_phone ON deleted_users(phone);
CREATE INDEX idx_deleted_users_deleted_at ON deleted_users(deleted_at);

-- No RLS - accessed only via service role from server actions
