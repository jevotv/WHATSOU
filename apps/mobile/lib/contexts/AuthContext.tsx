'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { NotificationService } from '@/lib/services/notifications';
import { Capacitor } from '@capacitor/core';

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

    const [verifying, setVerifying] = useState(false);

    const verifyBiometric = async (): Promise<boolean> => {
        // Dynamic import for Toast to ensure it's available
        const { Toast } = await import('@capacitor/toast');

        // DEBUG: Proof of Life - Entry
        // await Toast.show({ text: 'Bio Check Starting...', duration: 'short' });

        if (!Capacitor.isNativePlatform()) {
            console.log('Biometric: Not native platform');
            // DEBUG: Show if we think we are not native
            // await Toast.show({ text: 'Bio Check: Not Native Platform', duration: 'long' });
            return true;
        }
        try {
            const { Preferences } = await import('@capacitor/preferences');
            const { value } = await Preferences.get({ key: 'biometric_enabled' });
            console.log('Biometric: Preference value is', value);

            if (value !== 'true') {
                // DEBUG: Remove this after fixing
                // await Toast.show({ text: `Bio Disabled. Pref: ${value}`, duration: 'short' });
                return true;
            }

            const { NativeBiometric } = await import('capacitor-native-biometric');
            const result = await NativeBiometric.isAvailable();
            console.log('Biometric: Availability result:', result);

            if (!result.isAvailable) {
                await Toast.show({ text: 'Bio Not Available on Device' });
                return true;
            }

            // await Toast.show({ text: 'Starting Verification Prompt...' });
            setVerifying(true);
            const verificationResult = await NativeBiometric.verifyIdentity({
                reason: 'المصادقة مطلوبة للدخول',
                title: 'تسجيل الدخول',
                subtitle: 'استخدم بصمتك أو رمز القفل للمتابعة',
                description: ' ',
                useFallback: true, // Enable PIN/Pattern fallback
            }).then(() => true).catch(() => false);

            if (verificationResult) {
                console.log('Biometric: Verified successfully');
                // await Toast.show({ text: 'Bio Verified OK' });
                return true;
            } else {
                console.log('Biometric: Verification failed or cancelled');
                await Toast.show({ text: 'Bio Verification FAILED/Cancelled' });
                return false;
            }
        } catch (error: any) {
            console.error('Biometric verification failed:', error);
            await Toast.show({ text: `Bio Error: ${error?.message || error}` });
            return false;
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            if (!api.isAuthenticated()) {
                setLoading(false);
                return;
            }

            try {
                const session = await api.get<SessionResponse>('/api/auth/session');
                if (session.authenticated && session.user) {
                    // Check biometric before setting user
                    const bioSuccess = await verifyBiometric();
                    if (!bioSuccess) {
                        api.clearToken();
                        setLoading(false);
                        return;
                    }

                    setUser(session.user);
                    // Initialize Notification Service (Push & Badge)
                    console.log('AuthContext: Initializing NotificationService');
                    NotificationService.init();

                    // Setup Resume Listener for Biometric
                    if (Capacitor.isNativePlatform()) {
                        const { App } = await import('@capacitor/app');
                        App.addListener('appStateChange', async ({ isActive }) => {
                            if (isActive && api.isAuthenticated() && !verifying) {
                                // Small delay to ensure app is fully active
                                setTimeout(async () => {
                                    const success = await verifyBiometric();
                                    if (!success) {
                                        signOut();
                                    }
                                }, 100);
                            }
                        });
                    }

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
