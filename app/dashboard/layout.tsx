'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import BottomNav from '@/components/dashboard/BottomNav';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PwaInstallBanner from '@/components/dashboard/PwaInstallBanner';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { Store } from '@/lib/types/database';
import { getStoreForCurrentUser } from '@/app/actions/store';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState<any>(null); // DEBUG STATE
    const { user } = useAuth();
    const { direction } = useLanguage();
    const router = useRouter();

    useEffect(() => {
        async function loadStore() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const { store, error, debug_session } = await getStoreForCurrentUser();

                if (error === 'Unauthorized') {
                    // DEBUG: Show why it is unauthorized
                    setDebugInfo({ error, session: debug_session });
                    return;
                }

                if (!store) {
                    router.push('/onboarding');
                    return;
                }

                setStore(store);
            } catch (error) {
                console.error('Error loading store:', error);
                setDebugInfo({ error: 'Exception', details: error });
            } finally {
                setLoading(false);
            }
        }

        loadStore();
    }, [user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
                {debugInfo ? (
                    <div className="bg-white p-8 rounded shadow max-w-lg">
                        <h2 className="text-red-600 text-xl font-bold mb-4">Debug Mode: Access Denied</h2>
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                            {JSON.stringify(debugInfo, null, 2)}
                        </pre>
                        <p className="mt-4 text-sm text-gray-500">Please send a screenshot of this to support.</p>
                        <button onClick={() => router.push('/login')} className="mt-4 bg-gray-200 px-4 py-2 rounded">Go to Login</button>
                    </div>
                ) : (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008069]"></div>
                )}
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-[#f0f2f5] overflow-x-hidden" dir={direction}>
                <PwaInstallBanner />
                <DashboardHeader store={store} />
                <div className="pb-24">
                    {children}
                </div>
                <BottomNav />
            </div>
        </AuthGuard>
    );
}
