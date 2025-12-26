'use server'

import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { sendNewUserAlert } from '@/lib/telegram'

// Initialize a Supabase client with the service role key for admin access
// though we are mostly using a custom table where we can just use the anon key 
// IF we set up policies correctly. However, for "bypassing auth" and custom implementation,
// service role is safest for server-side operations if we want to be sure.

const SESSION_COOKIE_NAME = 'app-session';

function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // DEBUG LOGGING
    console.log('--- DEBUG AUTH ---');
    console.log('URL:', supabaseUrl);
    console.log('Service Role Key Present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Anon Key Present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('Selected Key (first 10 chars):', supabaseServiceKey?.substring(0, 10));
    console.log('------------------');

    if (!supabaseUrl) console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseServiceKey) console.error('Missing SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase configuration missing (URL or Key)');
    }

    if (!supabaseServiceKey.startsWith('ey')) {
        console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not a valid JWT (does not start with "ey").');
        console.error('Current value starts with:', supabaseServiceKey.substring(0, 5));
        throw new Error('Invalid SUPABASE_SERVICE_ROLE_KEY format. It must be a JWT starting with "ey..." (like your Anon key). You likely copied the wrong key/id from the dashboard.');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        }
    })
}



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
