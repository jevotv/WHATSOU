
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 });
}

// PUT: Update a product
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();
        const productId = params.id;

        // Verify product ownership
        const { data: existingProduct } = await supabase
            .from('products')
            .select('store_id, stores!inner(user_id)')
            .eq('id', productId)
            .single();

        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if ((existingProduct as any).stores?.user_id !== auth.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const data = await req.json();

        // Validate image limit
        if (data.images && data.images.length > 5) {
            return NextResponse.json(
                { error: 'Maximum 5 images allowed per product' },
                { status: 400 }
            );
        }

        const mainImage = data.images?.[0]?.url || null;
        const thumbnailImage = data.images?.[0]?.thumbnailUrl || null;

        // Update product
        const { error: updateError } = await supabase
            .from('products')
            .update({
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
                updated_at: new Date().toISOString(),
            })
            .eq('id', productId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Update images (delete and re-insert)
        await supabase.from('product_images').delete().eq('product_id', productId);

        if (data.images && data.images.length > 0) {
            const imagesToInsert = data.images.map((img: any, index: number) => ({
                product_id: productId,
                image_url: img.url,
                thumbnail_url: img.thumbnailUrl,
                display_order: index,
                alt_text: img.altText || null,
            }));

            await supabase.from('product_images').insert(imagesToInsert);
        }

        // Update variants
        if (data.variants !== undefined) {
            await supabase.from('product_variants').delete().eq('product_id', productId);

            if (data.variants.length > 0) {
                const variantsToInsert = data.variants.map((v: any) => ({
                    product_id: productId,
                    option_values: v.option_values,
                    price: v.price,
                    quantity: v.quantity,
                    unlimited_stock: data.unlimited_stock,
                    sku: v.sku,
                    image_index: v.image_index ?? null,
                }));

                await supabase.from('product_variants').insert(variantsToInsert);
            }
        }

        return NextResponse.json({ success: true });
    });
}

// DELETE: Delete a product
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return withAuth(request, async (req, auth) => {
        const supabase = getSupabaseAdmin();
        const productId = params.id;

        // Verify product ownership
        const { data: existingProduct } = await supabase
            .from('products')
            .select('store_id, stores!inner(user_id)')
            .eq('id', productId)
            .single();

        if (!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if ((existingProduct as any).stores?.user_id !== auth.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Delete product (cascades to images and variants due to FK constraints)
        const { error } = await supabase.from('products').delete().eq('id', productId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    });
}
