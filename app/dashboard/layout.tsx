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
                const { store, error } = await getStoreForCurrentUser();

                if (error === 'Unauthorized') {
                    router.push('/login');
                    return;
                }

                if (!store) {
                    router.push('/onboarding');
                    return;
                }

                setStore(store);
            } catch (error) {
                console.error('Error loading store:', error);
            } finally {
                setLoading(false);
            }
        }

        loadStore();
    }, [user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008069]"></div>
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
