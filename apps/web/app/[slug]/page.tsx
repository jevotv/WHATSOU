import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { Product, ProductVariant } from '@/lib/types/database';
import StorefrontClient from '@/components/storefront/StorefrontClient';
import StorePausedPage from '@/components/storefront/StorePausedPage';
import { unstable_cache } from 'next/cache';

// Force dynamic rendering to prevent build-time data fetching
export const dynamic = 'force-dynamic';

interface StorefrontPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const supabase = await createServerClient();
  const { data: store } = await supabase
    .from('stores')
    .select('name, description, logo_url')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!store) {
    return {
      title: 'Store Not Found',
    };
  }

  const fullUrl = `https://whatsou.com/${params.slug}`;

  return {
    title: `${store.name} | Whatsou`,
    description: store.description,
    alternates: {
      canonical: fullUrl,
    },
    icons: {
      icon: store.logo_url || '/favicon.ico',
      apple: store.logo_url || '/apple-icon.png',
    },
    openGraph: {
      title: store.name,
      description: store.description || undefined,
      images: store.logo_url ? [{ url: store.logo_url }] : [],
    },
  };
}

// Cached function to check subscription status (revalidates every 5 minutes)
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// Cached function to check subscription status (revalidates every 5 minutes)
const getCachedSubscriptionStatus = unstable_cache(
  async (userId: string) => {
    // Use Admin client to bypass RLS and avoid connection to request cookies (which fails in cache)
    const supabase = getSupabaseAdmin();
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, storefront_paused_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (!subscription) {
      return { isPaused: false }; // No subscription = allow access (new stores)
    }

    // Check if storefront should be paused
    if (subscription.storefront_paused_at) {
      const pausedAt = new Date(subscription.storefront_paused_at);
      if (new Date() > pausedAt) {
        return { isPaused: true };
      }
    }

    return { isPaused: false };
  },
  ['subscription-status'],
  { revalidate: 300 } // Cache for 5 minutes
);

async function getStoreData(slug: string) {
  const supabase = await createServerClient();
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!store) {
    return null;
  }

  const { data: products } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  // Load variants for all products
  if (products && products.length > 0) {
    const productIds = products.map((p: Product) => p.id);
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
      .in('product_id', productIds);

    // Attach variants to products
    const productsWithVariants = products.map((p: Product) => ({
      ...p,
      variants: variants?.filter((v: ProductVariant) => v.product_id === p.id) || [],
    }));

    return { store, products: productsWithVariants };
  }

  return { store, products: products || [] };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const data = await getStoreData(params.slug);

  if (!data) {
    notFound();
  }

  // Check subscription status with caching
  const subscriptionStatus = await getCachedSubscriptionStatus(data.store.user_id);

  // Show paused page if storefront is paused due to expired subscription
  if (subscriptionStatus.isPaused) {
    return (
      <StorePausedPage
        whatsappNumber={data.store.whatsapp_number}
        storeName={data.store.name}
      />
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: data.store.name,
    image: data.store.logo_url,
    description: data.store.description,
    url: `https://whatsou.com/${params.slug}`,
    sameAs: [
      data.store.facebook_url,
      data.store.instagram_url,
      data.store.twitter_url,
      data.store.tiktok_url,
      data.store.location_url
    ].filter(Boolean)
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StorefrontClient store={data.store} products={data.products} />
    </>
  );
}
