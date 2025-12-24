import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';

// Force dynamic rendering to prevent build-time data fetching
export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: {
    slug: string;
    id: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const supabase = await createServerClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('id', params.id)
    .maybeSingle();

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const { data: store } = await supabase
    .from('stores')
    .select('name')
    .eq('slug', params.slug)
    .maybeSingle();

  const storeName = store?.name || 'WhatSou';

  const fullUrl = `https://whatsou.com/${params.slug}/p/${params.id}`;

  return {
    title: `${product.name} | ${storeName}`,
    description: product.description,
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  };
}


async function getProductData(slug: string, productId: string) {
  const supabase = await createServerClient();
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!store) {
    return null;
  }

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('store_id', store.id)
    .maybeSingle();

  if (!product) {
    return null;
  }

  return { store, product };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const data = await getProductData(params.slug, params.id);

  if (!data) {
    notFound();
  }

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.product.name,
    image: data.product.image_url,
    description: data.product.description,
    offers: {
      '@type': 'Offer',
      price: data.product.current_price,
      priceCurrency: 'EGP', // Or dynamic based on store currency if available
      availability: (data.product.unlimited_stock || data.product.quantity > 0)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://whatsou.com/${params.slug}/p/${params.id}`
    }
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://whatsou.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: data.store.name,
        item: `https://whatsou.com/${params.slug}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: data.product.name,
        item: `https://whatsou.com/${params.slug}/p/${params.id}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient store={data.store} product={data.product} />
    </>
  );
}
