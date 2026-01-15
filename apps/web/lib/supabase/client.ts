import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { Capacitor } from '@capacitor/core';
import { capacitorStorage } from '@/lib/storage/capacitorStorage';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
    if (!supabaseInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Supabase Client Error: Missing env vars');

            // Safe debugging: Log keys present
            if (typeof window !== 'undefined') {
                const availableKeys = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_SUPABASE'));
                console.error('Available SUPABASE env vars:', availableKeys);
                console.error('Expected: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
                console.error('Current values status:', {
                    url: !!supabaseUrl,
                    key: !!supabaseAnonKey,
                    keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
                });

                console.warn('Initializing Supabase with dummy values to prevent crash. Check your environment variables.');
            }
        }

        if (Capacitor.isNativePlatform()) {
            supabaseInstance = createClient(
                supabaseUrl || 'https://placeholder.supabase.co',
                supabaseAnonKey || 'placeholder-key',
                {
                    auth: {
                        storage: capacitorStorage,
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true,
                    },
                }
            );
        } else {
            supabaseInstance = createBrowserClient(
                supabaseUrl || 'https://placeholder.supabase.co',
                supabaseAnonKey || 'placeholder-key'
            );
        }
    }
    return supabaseInstance;
};

// For backward compatibility - lazy getter
export const supabase = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        return getSupabaseClient()[prop as keyof SupabaseClient];
    }
});
