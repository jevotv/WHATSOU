'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSubscriptionStatus, SubscriptionStatus } from '@/app/actions/subscription';

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

    const refresh = async () => {
        try {
            const status = await getSubscriptionStatus();
            setSubscription(status);
        } catch (error) {
            console.error('Error fetching subscription status:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

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
