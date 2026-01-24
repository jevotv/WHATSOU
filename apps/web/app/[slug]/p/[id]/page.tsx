import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
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
  // Use Admin client for public data to avoid cookie dependencies in metadata generation
  const supabase = getSupabaseAdmin();

  // Fetch product with all images
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url, images:product_images(image_url)')
    .eq('id', params.id)
    .maybeSingle();

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const { data: store } = await supabase
    .from('stores')
    .select('name, default_language')
    .eq('slug', params.slug)
    .maybeSingle();

  const storeName = store?.name || 'WhatSou';
  const fullUrl = `https://whatsou.com/${params.slug}/p/${params.id}`;
  const fallbackDescription = `Buy ${product.name} from ${storeName}. Order via WhatsApp.`;
  const description = product.description || fallbackDescription;
  const locale = store?.default_language === 'ar' ? 'ar_EG' : 'en_US';

  // Build images array from product_images or fallback to main image
  const productImages = product.images && product.images.length > 0
    ? product.images.map((img: { image_url: string }) => ({ url: img.image_url, alt: product.name }))
    : product.image_url ? [{ url: product.image_url, alt: product.name }] : [];

  return {
    title: `${product.name} | ${storeName}`,
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
    openGraph: {
      type: 'website',
      siteName: 'Whatsou',
      locale: locale,
      url: fullUrl,
      title: product.name,
      description: description,
      images: productImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: description,
      images: productImages.map((img: { url: string }) => img.url),
    },
  };
}


async function getProductData(slug: string, productId: string) {
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

  const { data: product } = await supabase
    .from('products')
    .select('*, images:product_images(*)')
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

  // Build product images array for JSON-LD
  const productImages = data.product.images && data.product.images.length > 0
    ? data.product.images.map((img: { image_url: string }) => img.image_url)
    : data.product.image_url ? [data.product.image_url] : [];

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.product.name,
    image: productImages, // Array of all product images
    description: data.product.description || `Buy ${data.product.name} from ${data.store.name}`,
    brand: {
      '@type': 'Brand',
      name: data.store.name
    },
    offers: {
      '@type': 'Offer',
      price: data.product.current_price,
      priceCurrency: 'EGP',
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
