'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import BottomNav from '@/components/dashboard/BottomNav';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PwaInstallBanner from '@/components/dashboard/PwaInstallBanner';
import SubscriptionCountdown from '@/components/dashboard/SubscriptionCountdown';
import { SubscriptionProvider } from '@/lib/contexts/SubscriptionContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Store } from '@/lib/types/database';
import { StoreProvider } from '@/lib/contexts/StoreContext';
import { api } from '@/lib/api/client';

interface StoreResponse {
    store: Store | null;
    error?: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const { user, loading: authLoading } = useAuth();
    const { direction } = useLanguage();
    const router = useRouter();

    const loadStore = useCallback(async () => {
        // Wait for auth to finish loading before checking user
        if (authLoading) {
            return;
        }

        if (!user) {
            console.log("DashboardLayout: User is null after auth loaded");
            setLoading(false);
            return;
        }

        try {
            const result = await api.get<StoreResponse>('/api/dashboard/store');

            if (result.error) {
                setDebugInfo({ error: result.error });
                return;
            }

            if (!result.store) {
                router.push('/onboarding');
                return;
            }

            setStore(result.store);
        } catch (error: any) {
            console.error('Error loading store:', error);
            // If unauthorized, don't show debug - just redirect to login
            if (error.message?.includes('Unauthorized')) {
                api.clearToken();
                router.push('/login');
                return;
            }
            setDebugInfo({ error: 'Exception', details: error.message });
        } finally {
            setLoading(false);
        }
    }, [user, authLoading, router]);

    const refetchStore = useCallback(async () => {
        try {
            const result = await api.get<StoreResponse>('/api/dashboard/store');
            if (result.store) {
                setStore(result.store);
            }
        } catch (error) {
            console.error('Error refetching store:', error);
        }
    }, []);

    useEffect(() => {
        loadStore();
    }, [loadStore]);

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
            <StoreProvider value={{ store, loading, refetchStore }}>
                <SubscriptionProvider>
                    <div className="min-h-screen bg-[#f0f2f5] overflow-x-hidden" dir={direction}>
                        <PwaInstallBanner />
                        <DashboardHeader store={store} />
                        <SubscriptionCountdown />
                        <div className="pb-24">
                            {children}
                        </div>
                        <BottomNav />
                    </div>
                </SubscriptionProvider>
            </StoreProvider>
        </AuthGuard>
    );
}
