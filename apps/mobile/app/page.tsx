'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function HomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.push('/dashboard');
            } else {
                router.push('/login');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008069]"></div>
        </div>
    );
}
