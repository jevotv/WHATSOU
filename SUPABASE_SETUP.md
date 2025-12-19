# Supabase Setup Guide for WhatSou

This guide walks you through setting up Supabase for your WhatSou installation.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: WhatSou (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (takes about 2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, click on "Settings" (gear icon in sidebar)
2. Click on "API" in the settings menu
3. Find these two values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
4. Copy these values to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Database is Already Set Up!

The database tables and Row Level Security policies are automatically created when you first run the application. The migration includes:

- ✅ `stores` table with user authentication
- ✅ `products` table with JSONB options
- ✅ `orders` table for order history
- ✅ All RLS policies for multi-tenant security
- ✅ Indexes for optimal performance

**You don't need to run any SQL manually!**

## Step 4: Set Up Storage Bucket for Product Images

1. In your Supabase dashboard, click on "Storage" in the sidebar
2. Click "Create a new bucket"
3. Enter bucket details:
   - **Name**: `products`
   - **Public bucket**: Toggle ON (required for public image access)
4. Click "Create bucket"

### Configure Bucket Policies (Important!)

After creating the bucket, you need to set up policies:

1. Click on the `products` bucket
2. Click on "Policies" tab
3. Click "New Policy"

#### Policy 1: Public Read Access
- **Policy name**: `Public read access for product images`
- **Allowed operation**: SELECT
- **Target roles**: `public`
- **Policy definition**:
  ```sql
  true
  ```
- Click "Review" then "Save policy"

#### Policy 2: Authenticated Upload
- **Policy name**: `Authenticated users can upload`
- **Allowed operation**: INSERT
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  true
  ```
- Click "Review" then "Save policy"

#### Policy 3: Users can update their uploads
- **Policy name**: `Users can update own uploads`
- **Allowed operation**: UPDATE
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  true
  ```
- Click "Review" then "Save policy"

#### Policy 4: Users can delete their uploads
- **Policy name**: `Users can delete own uploads`
- **Allowed operation**: DELETE
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  true
  ```
- Click "Review" then "Save policy"

## Step 5: Configure Authentication (Optional)

By default, email/password authentication is enabled. If you want to customize:

1. Go to "Authentication" > "Providers" in your Supabase dashboard
2. Enable/disable authentication methods as needed
3. For production, consider:
   - Enabling email confirmations
   - Setting up custom SMTP for email delivery
   - Adding password strength requirements

## Step 6: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`

3. Click "Get Started" and create an account

4. Complete the onboarding to set up your store

5. Try adding a product with an image

6. Visit your storefront at `http://localhost:3000/your-store-slug`

## Common Issues & Solutions

### Issue: Images not uploading
**Solution**: Make sure the `products` bucket is public and has the correct policies set up.

### Issue: "Invalid API key" error
**Solution**: Double-check your `.env.local` file has the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Issue: Can't sign up
**Solution**: Check that email authentication is enabled in Supabase > Authentication > Providers.

### Issue: RLS policy errors
**Solution**: The database migration should run automatically. If you see RLS errors, check the Supabase SQL Editor for any failed migrations.

## Production Deployment Checklist

Before deploying to production:

- [ ] Set up custom domain in Supabase (optional but recommended)
- [ ] Enable email confirmations for new signups
- [ ] Configure custom SMTP for branded emails
- [ ] Set up database backups (automatic in paid plans)
- [ ] Review RLS policies for your use case
- [ ] Add `metadataBase` to your Next.js metadata for proper OG images
- [ ] Test the entire user flow from signup to checkout
- [ ] Monitor your Supabase dashboard for usage and errors

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**You're all set!** Your WhatSou platform is now connected to Supabase and ready to use.
