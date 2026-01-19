import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/auth-middleware';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { deleteMultipleFromR2 } from '@/lib/r2/client';

// OPTIONS: Handle CORS preflight explicitly
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
        },
    });
}

// POST: Delete user account
export async function POST(request: NextRequest) {
    return withAuth(request, async (req, auth) => {
        try {
            const body = await req.json();
            const { reason } = body;

            if (!reason || !reason.trim()) {
                return NextResponse.json(
                    { error: 'Deletion reason is required' },
                    { status: 400 }
                );
            }

            const supabase = getSupabaseAdmin();

            // 1. Get User Info
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('phone')
                .eq('id', auth.userId)
                .single();

            if (userError || !user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // 2. Get Store Info
            const { data: store } = await supabase
                .from('stores')
                .select('id, name, logo_url')
                .eq('user_id', auth.userId)
                .single();

            // 3. Create Audit Record
            const { error: auditError } = await supabase
                .from('deleted_users')
                .insert({
                    phone: user.phone,
                    store_name: store?.name || null,
                    deletion_reason: reason,
                    user_id: auth.userId,
                });

            if (auditError) {
                console.error('Audit error:', auditError);
                // Continue with deletion even if audit fails (priority is closing the account)
            }

            if (store) {
                // 4. Collect Files to Delete (R2)
                const filesToDelete: string[] = [];
                if (store.logo_url) filesToDelete.push(store.logo_url);

                // Get all products
                const { data: products } = await supabase
                    .from('products')
                    .select('id, image_url, thumbnail_url')
                    .eq('store_id', store.id);

                if (products && products.length > 0) {
                    const productIds = products.map(p => p.id);

                    // Add product main images
                    products.forEach(p => {
                        if (p.image_url) filesToDelete.push(p.image_url);
                        if (p.thumbnail_url) filesToDelete.push(p.thumbnail_url);
                    });

                    // Get extra product images
                    const { data: productImages } = await supabase
                        .from('product_images')
                        .select('image_url, thumbnail_url')
                        .in('product_id', productIds);

                    if (productImages) {
                        productImages.forEach(img => {
                            if (img.image_url) filesToDelete.push(img.image_url);
                            if (img.thumbnail_url) filesToDelete.push(img.thumbnail_url);
                        });
                    }
                }

                // Execute R2 Deletion (Async - don't block strict DB failure on this)
                if (filesToDelete.length > 0) {
                    // We await this to be "nice" to the cleanup process, but catch errors so they don't stop account deletion
                    try {
                        await deleteMultipleFromR2(filesToDelete);
                    } catch (r2Error) {
                        console.error('Failed to cleanup R2 files:', r2Error);
                    }
                }

                // 5. Database Cascade Deletion (Manual Safe Order)

                // A. Delete Product Images
                if (products && products.length > 0) {
                    const productIds = products.map(p => p.id);
                    await supabase.from('product_images').delete().in('product_id', productIds);
                    await supabase.from('product_variants').delete().in('product_id', productIds);
                    // Order items *should* be deleted via orders, but if they reference products directly:
                    // We delete orders first to clear order_items via cascade (if set) or manually if needed.
                }

                // B. Delete Orders (and Order Items)
                // Get orders first
                const { data: orders } = await supabase
                    .from('orders')
                    .select('id')
                    .eq('store_id', store.id);

                if (orders && orders.length > 0) {
                    const orderIds = orders.map(o => o.id);
                    // Delete order items manually to be safe
                    await supabase.from('order_items').delete().in('order_id', orderIds);
                    // Delete orders
                    await supabase.from('orders').delete().in('id', orderIds);
                }

                // C. Delete Products
                await supabase.from('products').delete().eq('store_id', store.id);

                // D. Delete Store
                const { error: storeDeleteError } = await supabase
                    .from('stores')
                    .delete()
                    .eq('id', store.id);

                if (storeDeleteError) {
                    console.error('Store delete error:', storeDeleteError);
                    throw new Error(`Failed to delete store: ${storeDeleteError.message}`);
                }
            }

            // 6. Delete User
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', auth.userId);

            if (deleteError) {
                console.error('User delete error:', deleteError);
                return NextResponse.json({ error: deleteError.message }, { status: 500 });
            }

            return NextResponse.json({ success: true });

        } catch (error: any) {
            console.error('Delete account error:', error);
            return NextResponse.json(
                { error: error.message || 'Internal server error' },
                { status: 500 }
            );
        }
    });
}
