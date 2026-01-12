import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

// GET: Get all products for the user's store
export async function GET(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();

        // Get user's store
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id')
            .eq('user_id', auth.userId)
            .single();

        if (storeError || !store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        // Get products with images and variants
        const { data: products, error } = await supabase
            .from('products')
            .select('*, images:product_images(*)')
            .eq('store_id', store.id)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Load variants for all products
        if (products && products.length > 0) {
            const productIds = products.map((p: any) => p.id);
            const { data: variants } = await supabase
                .from('product_variants')
                .select('*')
                .in('product_id', productIds);

            // Attach variants to products
            const productsWithVariants = products.map((p: any) => ({
                ...p,
                variants: variants?.filter((v: any) => v.product_id === p.id) || [],
            }));

            return NextResponse.json({ products: productsWithVariants });
        }

        return NextResponse.json({ products: [] });
    });
}

// POST: Create a new product
export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();

        // Get user's store
        const { data: store, error: storeError } = await supabase
            .from('stores')
            .select('id')
            .eq('user_id', auth.userId)
            .single();

        if (storeError || !store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        const data = await req.json();

        // Validate image limit
        if (data.images && data.images.length > 5) {
            return NextResponse.json(
                { error: 'Maximum 5 images allowed per product' },
                { status: 400 }
            );
        }

        // Use the first image as main image for backward compatibility
        const mainImage = data.images?.[0]?.url || null;
        const thumbnailImage = data.images?.[0]?.thumbnailUrl || null;

        // Insert product
        const { data: product, error: productError } = await supabase
            .from('products')
            .insert({
                store_id: store.id,
                name: data.name,
                description: data.description,
                current_price: data.current_price,
                original_price: data.original_price,
                category: data.category,
                quantity: data.quantity,
                unlimited_stock: data.unlimited_stock,
                image_url: mainImage,
                thumbnail_url: thumbnailImage,
                options: data.options,
            })
            .select()
            .single();

        if (productError) {
            return NextResponse.json({ error: productError.message }, { status: 500 });
        }

        // Insert images
        if (data.images && data.images.length > 0) {
            const imagesToInsert = data.images.map((img: any, index: number) => ({
                product_id: product.id,
                image_url: img.url,
                thumbnail_url: img.thumbnailUrl,
                display_order: index,
                alt_text: img.altText || null,
            }));

            await supabase.from('product_images').insert(imagesToInsert);
        }

        // Insert variants if any
        if (data.variants && data.variants.length > 0) {
            const variantsToInsert = data.variants.map((v: any) => ({
                product_id: product.id,
                option_values: v.option_values,
                price: v.price,
                quantity: v.quantity,
                unlimited_stock: data.unlimited_stock,
                sku: v.sku,
                image_index: v.image_index ?? null,
            }));

            await supabase.from('product_variants').insert(variantsToInsert);
        }

        return NextResponse.json({ success: true, product });
    });
}
