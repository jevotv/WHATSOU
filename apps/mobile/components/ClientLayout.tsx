'use client';

import { AuthProvider } from '@/lib/contexts/AuthContext';
import { LanguageProvider } from '@whatsou/shared';
import { CapacitorProvider } from '@/components/providers/CapacitorProvider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <AuthProvider>
                <CapacitorProvider>
                    {children}
                </CapacitorProvider>
            </AuthProvider>
        </LanguageProvider>
    );
}
