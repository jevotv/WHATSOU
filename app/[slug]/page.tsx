import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import StorefrontClient from '@/components/storefront/StorefrontClient';

interface StorefrontPageProps {
  params: {
    slug: string;
  };
}

async function getStoreData(slug: string) {
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

  return { store, products: products || [] };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const data = await getStoreData(params.slug);

  if (!data) {
    notFound();
  }

  return <StorefrontClient store={data.store} products={data.products} />;
}
