'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api/client';

export interface SubscriptionStatus {
    id: string | null;
    status: 'inactive' | 'active' | 'grace' | 'expired';
    expiresAt: string | null;
    daysRemaining: number | null;
    isReadOnly: boolean;
    amount: number;
    isFirstSubscription: boolean;
}

interface SubscriptionContextType {
    subscription: SubscriptionStatus | null;
    loading: boolean;
    refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
    subscription: null,
    loading: true,
    refresh: async () => { },
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            // Only fetch if authenticated
            if (!api.isAuthenticated()) {
                setLoading(false);
                return;
            }

            const status = await api.get<SubscriptionStatus>('/api/dashboard/subscription/status');
            setSubscription(status);
        } catch (error) {
            console.error('Error fetching subscription status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <SubscriptionContext.Provider value={{ subscription, loading, refresh }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
