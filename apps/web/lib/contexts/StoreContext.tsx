'use client';

import { createContext, useContext } from 'react';
import { Store } from '@/lib/types/database';

interface StoreContextType {
    store: Store | null;
    loading: boolean;
    refetchStore: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType>({
    store: null,
    loading: true,
    refetchStore: async () => { },
});

export function StoreProvider({
    children,
    value
}: {
    children: React.ReactNode;
    value: StoreContextType;
}) {
    return (
        <StoreContext.Provider value={value}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => useContext(StoreContext);
