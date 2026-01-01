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

    const isOwner = await verifyStoreOwnership(data.store_id, session.id)
    if (!isOwner) {
        return { error: 'Unauthorized: You do not own this store' }
    }

    const supabase = getSupabaseAdmin()

    // 1. Insert Product
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
            image_url: data.image_url,
            thumbnail_url: data.thumbnail_url,
            options: data.options
        })
        .select()
        .single()

    if (error) {
        console.error('Create product error:', error)
        return { error: error.message }
    }

    // 2. Insert Variants if any
    if (data.variants && data.variants.length > 0) {
        const variantsToInsert = data.variants.map((v: any) => ({
            product_id: product.id,
            option_values: v.option_values,
            price: v.price,
            quantity: v.quantity,
            unlimited_stock: data.unlimited_stock,
            sku: v.sku
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
            image_url: data.image_url,
            thumbnail_url: data.thumbnail_url,
            options: data.options,
            updated_at: new Date().toISOString()
        })
        .eq('id', productId)

    if (error) return { error: error.message }

    // Handle Variants
    if (data.variants) {
        // Delete existing
        await supabase.from('product_variants').delete().eq('product_id', productId)

        if (data.variants.length > 0) {
            const variantsToInsert = data.variants.map((v: any) => ({
                product_id: productId,
                option_values: v.option_values,
                price: v.price,
                quantity: v.quantity,
                unlimited_stock: data.unlimited_stock,
                sku: v.sku
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
