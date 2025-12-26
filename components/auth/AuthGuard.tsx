'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            // router.push('/login'); // DEBUG: Disable redirect
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        // DEBUG: Show client-side auth failure
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center bg-red-50 text-red-600 p-4">
                <h1 className="text-2xl font-bold mb-2">AuthGuard Blocked</h1>
                <p>Client User is NULL</p>
                <div className="mt-4 p-4 bg-white rounded shadow text-xs font-mono text-black">
                    Cookies: {typeof document !== 'undefined' ? document.cookie : 'N/A'}
                </div>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-200 rounded">Force Reload</button>
            </div>
        );
    }

    return <>{children}</>;
}
