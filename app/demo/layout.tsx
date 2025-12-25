import { createServerClient } from '@/lib/supabase/server';
import { MockDashboardProvider } from '@/lib/contexts/MockDashboardContext';
import { Product, ProductVariant } from '@/lib/types/database';
import DemoLayoutClient from './DemoLayoutClient';

export const dynamic = 'force-dynamic';

export default async function DemoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerClient();

    // 1. Fetch John Store directly
    const { data: stores } = await supabase
        .from('stores')
        .select('*')
        .ilike('name', '%John%')
        .limit(1);

    const johnStore = stores?.[0];

    if (!johnStore) {
        return <div>Error loading Demo: John Store not found.</div>;
    }

    // 2. Fetch Products
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', johnStore.id)
        .order('created_at', { ascending: false });

    // 3. Fetch Variants & Attach
    let productsWithVariants: Product[] = [];
    if (products && products.length > 0) {
        const productIds = products.map((p: { id: string }) => p.id);
        const { data: variants } = await supabase
            .from('product_variants')
            .select('*')
            .in('product_id', productIds);

        productsWithVariants = products.map((p: Product) => ({
            ...p,
            variants: variants?.filter((v: ProductVariant) => v.product_id === p.id) || [],
        }));
    }

    // 4. Fetch a few sample orders for context (can also mock these if privacy is a concern, but request said real data)
    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', johnStore.id)
        .order('created_at', { ascending: false })
        .limit(10);

    return (
        <MockDashboardProvider
            initialStore={johnStore}
            initialProducts={productsWithVariants}
            initialOrders={orders || []}
        >
            <DemoLayoutClient>
                {children}
            </DemoLayoutClient>
        </MockDashboardProvider>
    );
}
