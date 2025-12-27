import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
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
