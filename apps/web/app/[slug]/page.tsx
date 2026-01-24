import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
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
  // Use Admin client for public data to avoid cookie dependencies in metadata generation
  const supabase = getSupabaseAdmin();
  const { data: store } = await supabase
    .from('stores')
    .select('name, description, logo_url, default_language')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!store) {
    return {
      title: 'Store Not Found',
    };
  }

  const fullUrl = `https://whatsou.com/${params.slug}`;
  const fallbackDescription = `Shop at ${store.name} on Whatsou. Order via WhatsApp.`;
  const description = store.description || fallbackDescription;
  const imageUrl = store.logo_url || 'https://whatsou.com/opengraph-image.png';
  const locale = store.default_language === 'ar' ? 'ar_EG' : 'en_US';

  return {
    title: `${store.name} | Whatsou`,
    description: description,
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    icons: {
      icon: store.logo_url || '/favicon.ico',
      apple: store.logo_url || '/apple-icon.png',
    },
    openGraph: {
      type: 'website',
      siteName: 'Whatsou',
      locale: locale,
      url: fullUrl,
      title: store.name,
      description: description,
      images: [{ url: imageUrl, alt: `${store.name} Logo` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: store.name,
      description: description,
      images: [imageUrl],
    },
  };
}

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
  // Use Admin client for consistent server-side fetching of public data
  const supabase = getSupabaseAdmin();
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

  const fullUrl = `https://whatsou.com/${params.slug}`;

  const storeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: data.store.name,
    image: data.store.logo_url,
    description: data.store.description || `Shop at ${data.store.name} on Whatsou`,
    url: fullUrl,
    telephone: data.store.whatsapp_number,
    priceRange: 'EGP',
    sameAs: [
      data.store.facebook_url,
      data.store.instagram_url,
      data.store.twitter_url,
      data.store.tiktok_url,
      data.store.location_url
    ].filter(Boolean)
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Whatsou',
        item: 'https://whatsou.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: data.store.name,
        item: fullUrl
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <StorefrontClient store={data.store} products={data.products} />
    </>
  );
}
