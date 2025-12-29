/*
  # Subscription and Payment Tables
  
  Creates tables for managing subscriptions and tracking payments.
  
  ## Tables:
  - subscriptions: Tracks user subscription status and expiry
  - payment_transactions: Records all payment attempts/results
  
  ## Indexes:
  - Optimized for user lookups, status checks, and webhook processing
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'inactive',
  -- Status values: 'inactive', 'active', 'grace', 'expired'
  is_first_subscription boolean DEFAULT true,
  amount_paid numeric(10,2),
  started_at timestamptz,
  expires_at timestamptz,
  grace_ends_at timestamptz, -- 48 hours after expires_at
  storefront_paused_at timestamptz, -- When storefront should show paused page
  last_notified_at timestamptz, -- For WhatsApp reminder tracking
  paymob_order_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES subscriptions(id),
  paymob_transaction_id text UNIQUE,
  paymob_order_id text,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'EGP',
  status text NOT NULL DEFAULT 'pending',
  -- Status values: 'pending', 'success', 'failed', 'refunded'
  payment_method text, -- 'card', 'wallet'
  hmac_verified boolean DEFAULT false,
  raw_response jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Performance indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paymob_order ON subscriptions(paymob_order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_storefront_paused ON subscriptions(storefront_paused_at);

-- Performance indexes for payment_transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paymob_order ON payment_transactions(paymob_order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paymob_txn ON payment_transactions(paymob_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON payment_transactions(status);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
-- Users can only read their own subscription
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = subscriptions.user_id
    )
  );

-- Service role handles all writes (via edge functions)
-- No INSERT/UPDATE/DELETE policies for authenticated users

-- RLS Policies for payment_transactions
-- Users can only read their own transactions
CREATE POLICY "Users can view their own transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = payment_transactions.user_id
    )
  );

-- Allow anon to read subscriptions for storefront caching check
CREATE POLICY "Anon can check subscription status via store"
  ON subscriptions FOR SELECT
  TO anon
  USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
