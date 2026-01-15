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
            console.error('Supabase Client Error: Missing env vars', {
                url: !!supabaseUrl,
                key: !!supabaseAnonKey
            });
            // Return a dummy client or throw a clearer error to avoid SDK crash with confusing message
            if (typeof window !== 'undefined') {
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
