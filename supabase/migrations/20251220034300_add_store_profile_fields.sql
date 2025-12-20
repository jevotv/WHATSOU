-- Add new profile fields to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS facebook_url text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS twitter_url text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS tiktok_url text;
