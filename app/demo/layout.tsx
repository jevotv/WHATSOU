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

    let demoStore = stores?.[0];
    let demoProducts: any[] = [];
    let demoOrders: any[] = [];

    // Fallback Mock Data if "John" store doesn't exist (e.g. locally or deleted)
    if (!demoStore) {
        demoStore = {
            id: 'mock-store-id',
            user_id: 'mock-user',
            name: 'John Store',
            slug: 'john',
            description: 'This is a demo store for testing purposes.',
            qr_code: '/demo/john-qr.png',
            whatsapp_number: '201000000000',
            currency: 'EGP',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            allow_delivery: true,
            allow_pickup: true
        } as any; // Cast to avoid strict type checks on optional mock fields

        // Mock Products
        demoProducts = [
            {
                id: 'p1',
                store_id: 'mock-store-id',
                name: 'Premium Headphones',
                description: 'High quality noise cancelling headphones.',
                current_price: 2500,
                quantity: 10,
                category: 'Electronics',
                image_url: '/demo/1766646435982-full.webp',
                thumbnail_url: '/demo/1766646435982-full.webp',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                options: []
            },
            {
                id: 'p2',
                store_id: 'mock-store-id',
                name: 'Cotton T-Shirt',
                description: '100% Organic Cotton.',
                current_price: 300,
                quantity: 50,
                category: 'Clothing',
                image_url: '/demo/1766646655020-full.webp',
                thumbnail_url: '/demo/1766646655020-full.webp',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                options: [{ name: 'Size', values: ['S', 'M', 'L'] }]
            }
        ];
    } else {
        // 2. Fetch Products
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('store_id', demoStore.id)
            .order('created_at', { ascending: false });

        demoProducts = products || [];

        // 3. Fetch Variants & Attach
        if (demoProducts.length > 0) {
            const productIds = demoProducts.map((p: { id: string }) => p.id);
            const { data: variants } = await supabase
                .from('product_variants')
                .select('*')
                .in('product_id', productIds);

            demoProducts = demoProducts.map((p: Product) => ({
                ...p,
                variants: variants?.filter((v: ProductVariant) => v.product_id === p.id) || [],
            }));
        }

        // 4. Fetch Orders
        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('store_id', demoStore.id)
            .order('created_at', { ascending: false })
            .limit(10);

        demoOrders = orders || [];
    }

    return (
        <MockDashboardProvider
            initialStore={demoStore}
            initialProducts={demoProducts}
            initialOrders={demoOrders}
        >
            <DemoLayoutClient>
                {children}
            </DemoLayoutClient>
        </MockDashboardProvider>
    );
}
