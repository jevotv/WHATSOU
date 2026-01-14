'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import BottomNav from '@/components/dashboard/BottomNav';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SubscriptionCountdown from '@/components/dashboard/SubscriptionCountdown';
import { SubscriptionProvider } from '@/lib/contexts/SubscriptionContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@whatsou/shared';
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
    const { user, loading: authLoading } = useAuth();
    const { direction } = useLanguage();
    const router = useRouter();

    const loadStore = useCallback(async () => {
        if (authLoading) return;

        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const result = await api.get<StoreResponse>('/api/dashboard/store');

            if (result.error) {
                console.error("Store load error:", result.error);
                return;
            }

            if (!result.store) {
                router.push('/onboarding');
                return;
            }

            setStore(result.store);
        } catch (error: any) {
            console.error('Error loading store:', error);
            if (error.message?.includes('Unauthorized')) {
                api.clearToken();
                router.push('/login');
            }
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008069]"></div>
            </div>
        );
    }

    return (
        <AuthGuard>
            <StoreProvider value={{ store, loading, refetchStore }}>
                <SubscriptionProvider>
                    <div className="min-h-screen bg-[#f0f2f5] overflow-x-hidden" dir={direction}>
                        <DashboardHeader store={store} />
                        <SubscriptionCountdown />
                        <div className="pb-32">
                            {children}
                        </div>
                        <BottomNav />
                    </div>
                </SubscriptionProvider>
            </StoreProvider>
        </AuthGuard>
    );
}
