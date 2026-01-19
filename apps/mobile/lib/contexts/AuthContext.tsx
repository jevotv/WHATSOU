'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { NotificationService } from '@/lib/services/notifications';

type User = {
    id: string;
    phone: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    signIn: (phone: string, password: string) => Promise<{ error?: string }>;
    signUp: (phone: string, password: string) => Promise<{ error?: string }>;
    signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

type SessionResponse = {
    authenticated: boolean;
    user?: User;
};

type AuthResponse = {
    token: string;
    user: User;
    error?: string;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            if (!api.isAuthenticated()) {
                setLoading(false);
                return;
            }

            try {
                const session = await api.get<SessionResponse>('/api/auth/session');
                if (session.authenticated && session.user) {
                    setUser(session.user);
                    // Initialize Notification Service (Push & Badge)
                    console.log('AuthContext: Initializing NotificationService');
                    NotificationService.init();
                } else {
                    api.clearToken();
                }
            } catch (error) {
                console.error('Session check failed:', error);
                api.clearToken();
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const signIn = async (phone: string, password: string) => {
        try {
            const response = await api.post<AuthResponse>('/api/auth/login', {
                phone,
                password,
            });

            if (response.error) {
                return { error: response.error };
            }

            api.setToken(response.token);
            setUser(response.user);
            // Initialize Notification Service
            NotificationService.init();
            router.push('/dashboard');
            return {};
        } catch (error: any) {
            return { error: error.message };
        }
    };

    const signUp = async (phone: string, password: string) => {
        try {
            const response = await api.post<AuthResponse>('/api/auth/signup', {
                phone,
                password,
            });

            if (response.error) {
                return { error: response.error };
            }

            api.setToken(response.token);
            setUser(response.user);
            // Initialize Notification Service
            NotificationService.init();
            router.push('/onboarding');
            return {};
        } catch (error: any) {
            return { error: error.message };
        }
    };

    const signOut = () => {
        api.clearToken();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
