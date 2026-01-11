'use server'

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { sendNewUserAlert } from '@/lib/telegram'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// Initialize a Supabase client with the service role key for admin access
// though we are mostly using a custom table where we can just use the anon key 
// IF we set up policies correctly. However, for "bypassing auth" and custom implementation,
// service role is safest for server-side operations if we want to be sure.

const SESSION_COOKIE_NAME = 'app-session';





export async function signUp(formData: FormData) {
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    if (!phone || !password) {
        return { error: 'Phone and password are required' }
    }

    // Check if user exists
    const supabase = getSupabaseAdmin()
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single()

    if (existingUser) {
        return { error: 'User already exists' }
    }

    const passwordHash = await bcrypt.hash(password, 10)


    const { data: newUser, error } = await supabase
        .from('users')
        .insert({
            phone,
            password_hash: passwordHash,
        })
        .select()
        .single()

    if (error) {
        console.error('Signup error:', error)
        return { error: 'Failed to create user' }
    }

    // Create inactive subscription record for new user
    const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
            user_id: newUser.id,
            status: 'inactive',
            is_first_subscription: true,
        });

    if (subError) {
        console.error('Subscription creation error:', subError);
        // Don't fail signup, just log the error
    }

    // Send Telegram Notification (Fire and forget)
    sendNewUserAlert(newUser.phone, newUser.created_at).catch(console.error);

    // Set session
    const payload = JSON.stringify({ id: newUser.id, phone: newUser.phone });
    const encodedValue = Buffer.from(payload).toString('base64');

    cookies().set(SESSION_COOKIE_NAME, encodedValue, {
        httpOnly: false, // DEBUG: Allow client to see if cookie is set
        secure: false, // DEBUG: Disable secure flag
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    })

    return { success: true, token: encodedValue }
}

export async function signIn(formData: FormData) {
    const phone = formData.get('phone') as string
    const password = formData.get('password') as string

    if (!phone || !password) {
        return { error: 'Phone and password are required' }
    }

    // DEBUG: Check for service key
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // We only show this in non-production usually, but we are debugging Prod
        // return { error: 'Config: Missing Service Role Key' } 
        // actually let's just log it or return it if user matches specific phone?
    }

    const supabase = getSupabaseAdmin()
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

    if (error) {
        return { error: `DB Error: ${error.message} (${error.code})` }
    }

    if (!user) {
        return { error: 'User not found' }
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
        return { error: 'Password incorrect' }
    }

    // Set session
    const payload = JSON.stringify({ id: user.id, phone: user.phone });
    const encodedValue = Buffer.from(payload).toString('base64');

    cookies().set(SESSION_COOKIE_NAME, encodedValue, {
        httpOnly: false, // DEBUG: Allow client to see if cookie is set
        secure: false, // DEBUG: Disable secure flag
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    })

    return { success: true, token: encodedValue }
}

export async function signOut() {
    cookies().delete(SESSION_COOKIE_NAME)
    return { success: true }
}

export async function getSession() {
    const sessionCookie = cookies().get(SESSION_COOKIE_NAME)
    if (!sessionCookie) return null
    try {
        // Decode Base64 value
        const jsonString = Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
        const session = JSON.parse(jsonString)

        // MANUAL BLACKLIST: Known deleted user causing zombie sessions
        // This is safer than checking DB if permissions are flaky or connection is bad
        if (session.id === 'bba49af4-d8d7-44cc-879b-0cb3b9b60538') {
            cookies().delete(SESSION_COOKIE_NAME)
            return null
        }


        return session
    } catch (e) {
        return null
    }
}

export async function changePassword(formData: FormData) {
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string

    if (!currentPassword || !newPassword) {
        return { error: 'Current and new passwords are required' }
    }

    const session = await getSession()
    if (!session || !session.id) {
        return { error: 'Unauthorized' }
    }

    // Get user to verify current password
    const supabase = getSupabaseAdmin()
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', session.id)
        .single()

    if (userError || !user) {
        return { error: 'User not found' }
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isMatch) {
        return { error: 'Incorrect current password' }
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', session.id)

    if (updateError) {
        console.error('Password update error:', updateError)
        return { error: 'Failed to update password' }
    }

    return { success: true }
}

export async function saveFcmToken(token: string) {
    const session = await getSession()
    if (!session || !session.id) {
        return { error: 'Unauthorized' }
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
        .from('users')
        .update({ fcm_token: token })
        .eq('id', session.id)

    if (error) {
        console.error('FCM token save error:', error)
        return { error: error.message }
    }

    return { success: true }
}

/**
 * Delete user account and all associated data
 * - Creates audit record in deleted_users table
 * - Deletes all images from Cloudflare R2
 * - Deletes user from database (cascades to stores, products, orders, subscriptions)
 * - Clears session cookie
 */
export async function deleteAccount(reason: string) {
    const session = await getSession()
    if (!session?.id) {
        return { error: 'Unauthorized' }
    }

    const supabase = getSupabaseAdmin()

    try {
        // 1. Get user phone for audit
        const { data: user } = await supabase
            .from('users')
            .select('phone')
            .eq('id', session.id)
            .single()

        // 2. Get user's store and related data for audit
        const { data: store } = await supabase
            .from('stores')
            .select(`
                id,
                name,
                slug,
                logo_url
            `)
            .eq('user_id', session.id)
            .single()

        // 3. Get products with images
        let products: { id: string; image_url: string | null; thumbnail_url: string | null }[] = []
        let orderCount = 0

        if (store) {
            const { data: productData } = await supabase
                .from('products')
                .select('id, image_url, thumbnail_url')
                .eq('store_id', store.id)

            products = productData || []

            const { count } = await supabase
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('store_id', store.id)

            orderCount = count || 0
        }

        // 4. Collect all image URLs for R2 deletion
        const imagesToDelete: string[] = []

        if (store?.logo_url) {
            imagesToDelete.push(store.logo_url)
        }

        for (const product of products) {
            if (product.image_url) imagesToDelete.push(product.image_url)
            if (product.thumbnail_url) imagesToDelete.push(product.thumbnail_url)
        }

        // 5. Insert audit record BEFORE deletion
        const { error: auditError } = await supabase.from('deleted_users').insert({
            original_user_id: session.id,
            phone: user?.phone || 'unknown',
            store_name: store?.name || null,
            store_slug: store?.slug || null,
            deletion_reason: reason,
            total_orders: orderCount,
            total_products: products.length,
        })

        if (auditError) {
            console.error('Audit insert error:', auditError)
            // Don't fail deletion if audit fails, just log it
        }

        // 6. Delete images from R2
        if (imagesToDelete.length > 0) {
            try {
                const { deleteMultipleFromR2 } = await import('@/lib/r2/client')
                await deleteMultipleFromR2(imagesToDelete)
            } catch (r2Error) {
                console.error('R2 deletion error:', r2Error)
                // Continue with deletion even if R2 cleanup fails
            }
        }

        // 7. Delete store first (cascades to products, product_variants, orders)
        // Note: stores.user_id references auth.users, not custom users table
        // So we need to delete store manually before user
        if (store) {
            const { error: storeDeleteError } = await supabase
                .from('stores')
                .delete()
                .eq('id', store.id)

            if (storeDeleteError) {
                console.error('Delete store error:', storeDeleteError)
                return { error: 'Failed to delete store' }
            }
        }

        // 8. Delete user (cascades to subscriptions, payment_transactions)
        const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', session.id)

        if (deleteError) {
            console.error('Delete user error:', deleteError)
            return { error: 'Failed to delete account' }
        }

        // 9. Clear session cookie
        cookies().delete(SESSION_COOKIE_NAME)

        return { success: true }
    } catch (error: any) {
        console.error('Account deletion error:', error)
        return { error: error.message || 'Failed to delete account' }
    }
}
