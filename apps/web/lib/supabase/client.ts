import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { Capacitor } from '@capacitor/core';
import { capacitorStorage } from '@/lib/storage/capacitorStorage';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
    if (!supabaseInstance) {
        if (Capacitor.isNativePlatform()) {
            supabaseInstance = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
