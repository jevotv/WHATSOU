'use server'

import { getSession } from './auth'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { Product, ProductVariant, ProductOption, Store } from '@/lib/types/database'
import { revalidatePath } from 'next/cache'

async function verifyStoreOwnership(storeId: string, userId: string) {
    const supabase = getSupabaseAdmin()
    const { data: store } = await supabase
        .from('stores')
        .select('id, user_id')
        .eq('id', storeId)
        .single()

    return store && store.user_id === userId
}

export async function createProduct(data: any) {
    const session = await getSession()
    if (!session || !session.id) {
        return { error: 'Unauthorized' }
    }

    if (!data.store_id) {
        return { error: 'Store ID required' }
    }

    // Validate image limit
    if (data.images && data.images.length > 5) {
        return { error: 'Maximum 5 images allowed per product' }
    }

    const isOwner = await verifyStoreOwnership(data.store_id, session.id)
    if (!isOwner) {
        return { error: 'Unauthorized: You do not own this store' }
    }

    const supabase = getSupabaseAdmin()

    // 1. Insert Product
    // Use the first image as the main image_url for backward compatibility
    const mainImage = data.images && data.images.length > 0 ? data.images[0].url : null;
    const thumbnailImage = data.images && data.images.length > 0 ? data.images[0].thumbnailUrl : null;

    const { data: product, error } = await supabase
        .from('products')
        .insert({
            store_id: data.store_id,
            name: data.name,
            description: data.description,
            current_price: data.current_price,
            original_price: data.original_price,
            category: data.category,
            quantity: data.quantity,
            unlimited_stock: data.unlimited_stock,
            image_url: mainImage,
            thumbnail_url: thumbnailImage,
            options: data.options
        })
        .select()
        .single()

    if (error) {
        console.error('Create product error:', error)
        return { error: error.message }
    }

    // 2. Insert Images
    if (data.images && data.images.length > 0) {
        const imagesToInsert = data.images.map((img: any, index: number) => ({
            product_id: product.id,
            image_url: img.url,
            thumbnail_url: img.thumbnailUrl,
            display_order: index,
            alt_text: img.altText || null
        }))

        const { error: imagesError } = await supabase
            .from('product_images')
            .insert(imagesToInsert)

        if (imagesError) {
            console.error('Create images error:', imagesError)
            return { error: 'Product created but failed to save images' }
        }
    }

    // 3. Insert Variants if any
    if (data.variants && data.variants.length > 0) {
        const variantsToInsert = data.variants.map((v: any) => ({
            product_id: product.id,
            option_values: v.option_values,
            price: v.price,
            quantity: v.quantity,
            unlimited_stock: data.unlimited_stock,
            sku: v.sku,
            image_index: v.image_index ?? null
        }))

        const { error: variantError } = await supabase
            .from('product_variants')
            .insert(variantsToInsert)

        if (variantError) {
            console.error('Create variants error:', variantError)
            return { error: 'Product created but failed to save variants' }
        }
    }

    revalidatePath('/dashboard')
    return { success: true, product }
}

export async function updateProduct(productId: string, data: any) {
    const session = await getSession()
    if (!session || !session.id) {
        return { error: 'Unauthorized' }
    }

    // Validate image limit
    if (data.images && data.images.length > 5) {
        return { error: 'Maximum 5 images allowed per product' }
    }

    // Need to fetch product first to check store ownership
    const supabase = getSupabaseAdmin()
    const { data: existingProduct } = await supabase
        .from('products')
        .select('store_id')
        .eq('id', productId)
        .single()

    if (!existingProduct) return { error: 'Product not found' }

    const isOwner = await verifyStoreOwnership(existingProduct.store_id, session.id)
    if (!isOwner) {
        return { error: 'Unauthorized' }
    }

    // STORAGE CLEANUP LOGIC
    // 1. Get existing images
    const { data: existingImages } = await supabase
        .from('product_images')
        .select('image_url, thumbnail_url')
        .eq('product_id', productId)

    // Also consider the main product image if it was set independently (legacy)
    // For now, we assume product_images is source of truth if we are migrating fully.
    // However, if we are transitioning, we should be careful.
    // Strategy: Delete files that are NOT in the new data.images list.

    const newImageUrls = new Set(data.images?.map((img: any) => img.url) || []);

    if (existingImages) {
        const imagesToDelete = existingImages.filter(img => !newImageUrls.has(img.image_url));

        for (const img of imagesToDelete) {
            try {
                // Extract path from URL. Assuming standard Supabase Storage URL format
                // .../storage/v1/object/public/products/path/to/image.webp
                const urlObj = new URL(img.image_url);
                const pathParts = urlObj.pathname.split('/products/'); // Assuming bucket name 'products'
                if (pathParts.length > 1) {
                    const filePath = pathParts[1];
                    await supabase.storage.from('products').remove([filePath]);
                }

                if (img.thumbnail_url) {
                    const thumbUrlObj = new URL(img.thumbnail_url);
                    const thumbPathParts = thumbUrlObj.pathname.split('/products/');
                    if (thumbPathParts.length > 1) {
                        const thumbPath = thumbPathParts[1];
                        await supabase.storage.from('products').remove([thumbPath]);
                    }
                }
            } catch (e) {
                console.error("Failed to delete image from storage:", e);
            }
        }
    }

    const mainImage = data.images && data.images.length > 0 ? data.images[0].url : null;
    const thumbnailImage = data.images && data.images.length > 0 ? data.images[0].thumbnailUrl : null;

    const { error } = await supabase
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
            updated_at: new Date().toISOString()
        })
        .eq('id', productId)

    if (error) return { error: error.message }

    // Handle Images Updates (Delete all and re-insert for simplicity and order guarantee)
    // Since we handled storage cleanup above, we can safely clear the table for this product
    const { error: deleteImagesError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId)

    if (deleteImagesError) return { error: 'Failed to update images' }

    if (data.images && data.images.length > 0) {
        const imagesToInsert = data.images.map((img: any, index: number) => ({
            product_id: productId,
            image_url: img.url,
            thumbnail_url: img.thumbnailUrl,
            display_order: index,
            alt_text: img.altText || null
        }))

        const { error: insertImagesError } = await supabase
            .from('product_images')
            .insert(imagesToInsert)

        if (insertImagesError) return { error: 'Failed to save new images' }
    }

    // Handle Variants (Existing Logic)
    if (data.variants) {
        await supabase.from('product_variants').delete().eq('product_id', productId)

        if (data.variants.length > 0) {
            const variantsToInsert = data.variants.map((v: any) => ({
                product_id: productId,
                option_values: v.option_values,
                price: v.price,
                quantity: v.quantity,
                unlimited_stock: data.unlimited_stock,
                sku: v.sku,
                image_index: v.image_index ?? null
            }))

            const { error: varError } = await supabase
                .from('product_variants')
                .insert(variantsToInsert)

            if (varError) return { error: 'Failed to update variants' }
        }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteProduct(productId: string) {
    const session = await getSession()
    if (!session || !session.id) return { error: 'Unauthorized' }

    const supabase = getSupabaseAdmin()
    const { data: existingProduct } = await supabase
        .from('products')
        .select('store_id')
        .eq('id', productId)
        .single()

    if (!existingProduct) return { error: 'Product not found' }

    const isOwner = await verifyStoreOwnership(existingProduct.store_id, session.id)
    if (!isOwner) return { error: 'Unauthorized' }

    // STORAGE CLEANUP - Clean ALL images associated with product
    const { data: images } = await supabase
        .from('product_images')
        .select('image_url, thumbnail_url')
        .eq('product_id', productId)

    if (images) {
        const filesToDelete: string[] = [];
        for (const img of images) {
            try {
                const urlObj = new URL(img.image_url);
                const pathParts = urlObj.pathname.split('/products/');
                if (pathParts.length > 1) filesToDelete.push(pathParts[1]);

                if (img.thumbnail_url) {
                    const thumbUrlObj = new URL(img.thumbnail_url);
                    const thumbPathParts = thumbUrlObj.pathname.split('/products/');
                    if (thumbPathParts.length > 1) filesToDelete.push(thumbPathParts[1]);
                }
            } catch (e) {
                console.error("Url parsing error", e);
            }
        }

        // Also check legacy/main image in products table if not covered (though product_images should cover it)
        // For safety, let's rely on product_images as the comprehensive source if populated.

        if (filesToDelete.length > 0) {
            await supabase.storage.from('products').remove(filesToDelete);
        }
    }

    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateStore(storeId: string, data: Partial<Store>) {
    const session = await getSession();
    if (!session || !session.id) {
        return { error: 'Unauthorized' };
    }

    const supabase = getSupabaseAdmin();

    // Verify ownership
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, user_id')
        .eq('id', storeId)
        .single();

    if (storeError || !store) {
        return { error: 'Store not found' };
    }

    if (store.user_id !== session.id) {
        return { error: 'Unauthorized: You do not own this store' };
    }

    // Perform update
    const { error } = await supabase
        .from('stores')
        .update(data)
        .eq('id', storeId);

    if (error) {
        console.error('Store update error:', error);
        return { error: 'Failed to update store settings' };
    }

    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');

    return { success: true };
}

export async function getCustomers() {
    const session = await getSession();
    if (!session || !session.id) {
        return { error: 'Unauthorized' };
    }

    const supabase = getSupabaseAdmin();

    // 1. Get Store ID
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', session.id)
        .single();

    if (storeError || !store) {
        return { error: 'Store not found' };
    }

    // 2. Get Orders for aggregation
    const { data: orders, error } = await supabase
        .from('orders')
        .select('customer_name, customer_phone, created_at')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching customers:', error);
        return { error: 'Failed to fetch customers' };
    }

    return { success: true, data: orders };
}

export async function getOrders() {
    const session = await getSession();
    if (!session || !session.id) {
        return { error: 'Unauthorized' };
    }

    const supabase = getSupabaseAdmin();

    // 1. Get Store ID & Delivery settings
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, allow_delivery, allow_pickup')
        .eq('user_id', session.id)
        .single();

    if (storeError || !store) {
        return { error: 'Store not found' };
    }

    // 2. Get Orders
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return { error: 'Failed to fetch orders' };
    }



    return { success: true, orders, storeSettings: { allow_delivery: store.allow_delivery, allow_pickup: store.allow_pickup } };
}

export async function getOrdersCount() {
    const session = await getSession();
    if (!session || !session.id) return { count: 0 };

    const supabase = getSupabaseAdmin();

    const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', session.id)
        .single();

    if (!store) return { count: 0 };

    const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id);

    if (error) return { count: 0 };

    return { count: count || 0 };
}

export async function getProductsForStore(storeId: string) {
    const session = await getSession();
    if (!session || !session.id) {
        return { error: 'Unauthorized' };
    }

    // Verify ownership (or at least that the user belongs to the store if multi-user)
    const isOwner = await verifyStoreOwnership(storeId, session.id);
    if (!isOwner) {
        return { error: 'Unauthorized' };
    }

    const supabase = getSupabaseAdmin();

    try {
        const { data: productsData, error } = await supabase
            .from('products')
            .select('*, images:product_images(*)')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Load variants for all products
        if (productsData && productsData.length > 0) {
            const productIds = productsData.map((p: Product) => p.id);
            const { data: variantsData } = await supabase
                .from('product_variants')
                .select('*')
                .in('product_id', productIds);

            // Attach variants to products
            const productsWithVariants = productsData.map((p: Product) => ({
                ...p,
                variants: variantsData?.filter((v: ProductVariant) => v.product_id === p.id) || [],
            }));

            return { success: true, products: productsWithVariants };
        }

        return { success: true, products: [] };
    } catch (error: any) {
        console.error('Error fetching products:', error);
        return { error: error.message };
    }
}
