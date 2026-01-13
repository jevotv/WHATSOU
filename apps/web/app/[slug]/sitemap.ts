import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function sitemap({
    id,
}: {
    id: string; // matches [slug]
}): Promise<MetadataRoute.Sitemap> {
    const supabase = await createServerClient();
    const slug = id; // Ensure we get the correct param

    // 1. Fetch store
    const { data: store } = await supabase
        .from('stores')
        .select('id, slug, updated_at')
        .eq('slug', slug)
        .maybeSingle();

    if (!store) {
        return [];
    }

    const baseUrl = `https://whatsou.com/${slug}`;

    // 2. Fetch products
    const { data: products } = await supabase
        .from('products')
        .select('id, updated_at')
        .eq('store_id', store.id);

    const productEntries = (products || []).map((product) => ({
        url: `${baseUrl}/p/${product.id}`,
        lastModified: product.updated_at || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: store.updated_at || new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        ...productEntries,
    ];
}
