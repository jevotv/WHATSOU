import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import ProductDetailClient from '@/components/storefront/ProductDetailClient';

// Force dynamic rendering to prevent build-time data fetching
export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: {
    slug: string;
    id: string;
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

  return <ProductDetailClient store={data.store} product={data.product} />;
}
