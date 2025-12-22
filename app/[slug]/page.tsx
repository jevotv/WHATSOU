import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Product, ProductVariant } from '@/lib/types/database';
import StorefrontClient from '@/components/storefront/StorefrontClient';

// Force dynamic rendering to prevent build-time data fetching
export const dynamic = 'force-dynamic';

interface StorefrontPageProps {
  params: {
    slug: string;
  };
}

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
    .select('*')
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

  return <StorefrontClient store={data.store} products={data.products} />;
}
