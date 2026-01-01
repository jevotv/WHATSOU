'use client';

import { useEffect, useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { App } from '@capacitor/app';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@capawesome/capacitor-badge';
import { Preferences } from '@capacitor/preferences';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isLocked, setIsLocked] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const backgroundTime = useRef<number>(Date.now());
    const isVerifying = useRef(false);

    const checkBiometricLock = async () => {
        if (!Capacitor.isNativePlatform()) {
            setIsChecking(false);
            return;
        }

        // If already verifying, don't start another check
        if (isVerifying.current) return;

        try {
            const { value } = await Preferences.get({ key: 'biometric_enabled' });
            if (value === 'true') {
                setIsLocked(true);
                setIsChecking(false);

                isVerifying.current = true;
                try {
                    await NativeBiometric.verifyIdentity({
                        reason: "Unlock Dashboard",
                        title: "Authentication Required",
                        subtitle: "Verify your identity to access the dashboard",
                        description: ""
                    });
                    setIsLocked(false);
                } catch (e) {
                    console.error("Biometric verify failed", e);
                    // Keep locked
                } finally {
                    // Small delay to allow app to fully resume before clearing flag
                    setTimeout(() => {
                        isVerifying.current = false;
                    }, 500);
                }
            } else {
                setIsChecking(false);
            }
        } catch (e) {
            console.error("Biometric pref check failed", e);
            setIsChecking(false);
        }
    };

    useEffect(() => {
        // Run checks only on native
        if (Capacitor.isNativePlatform()) {
            checkBiometricLock();

            // Define badge updater
            const updateBadgeCount = async () => {
                try {
                    const { getOrdersCount } = await import('@/app/actions/dashboard');
                    const { count } = await getOrdersCount();
                    if (count !== undefined) {
                        try {
                            await Badge.set({ count });
                        } catch (err) {
                            console.warn('Badge set failed', err);
                        }
                    }
                } catch (e) {
                    console.error("Error setting badge:", e);
                }
            };

            // Listen for app state changes
            App.addListener('appStateChange', ({ isActive }) => {
                if (!isActive) {
                    backgroundTime.current = Date.now();
                } else {
                    updateBadgeCount(); // Update badge on resume
                    const timeGone = Date.now() - backgroundTime.current;
                    // Only re-lock if gone for more than 5 seconds (prevents loop with biometric dialog)
                    if (timeGone > 5000) {
                        checkBiometricLock();
                    }
                }
            });

            // 1. App Deep Links
            App.addListener('appUrlOpen', async (data) => {
                const url = new URL(data.url);
                if (url.pathname) {
                    if (url.pathname.startsWith('/dashboard')) {
                        router.push(url.pathname + url.search);
                    }
                }
            });

            // 2. Push Notifications
            const setupPushNotifications = async () => {
                try {
                    let permStatus = await PushNotifications.checkPermissions();

                    // If prompt, requested on load
                    if (permStatus.receive === 'prompt') {
                        permStatus = await PushNotifications.requestPermissions();
                    }

                    if (permStatus.receive !== 'granted') return;

                    await PushNotifications.register();

                    PushNotifications.addListener('registration', async (token) => {
                        console.log('Push Registration Success', token.value);
                        if (user?.id) {
                            const { error } = await supabase
                                .from('users')
                                .update({ fcm_token: token.value })
                                .eq('id', user.id);

                            if (error) {
                                console.error('Error saving FCM token:', error);
                                toast({ title: 'Token Save Failed', description: error.message, variant: 'destructive' });
                            } else {
                                // Temporary Debug Toast
                                // toast({ title: 'Device Registered', description: 'Ready to receive orders!' });
                            }
                        }
                    });

                    PushNotifications.addListener('registrationError', (error: any) => {
                        console.error('Push registration error: ', error);
                        toast({
                            title: 'Push Error',
                            description: 'Google Play Services likely missing or updated required.',
                            variant: 'destructive'
                        });
                    });
                    PushNotifications.addListener('pushNotificationReceived', (notification) => {
                        toast({
                            title: notification.title || 'New Notification',
                            description: notification.body,
                        });
                    });

                    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                        const data = notification.notification.data;
                        if (data?.url) {
                            router.push(data.url);
                        } else if (data?.orderId) {
                            router.push(`/dashboard/orders/${data.orderId}`);
                        } else {
                            router.push('/dashboard');
                        }
                    });
                } catch (error) {
                    console.error('Push notification setup failed:', error);
                }
            };

            if (user) {
                setupPushNotifications();
                updateBadgeCount();
            }

            return () => {
                App.removeAllListeners();
                PushNotifications.removeAllListeners();
            };
        } else {
            setIsChecking(false);
        }
    }, [user, router, toast]);

    if (isChecking && Capacitor.isNativePlatform()) {
        return <div className="min-h-screen bg-white" />;
    }

    if (isLocked) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 space-y-6">
                <div className="bg-green-100 p-6 rounded-full animate-bounce">
                    <Lock className="w-12 h-12 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard Locked</h2>
                    <p className="text-gray-500">Please verify your identity to continue</p>
                </div>
                <Button
                    onClick={checkBiometricLock}
                    className="w-full max-w-xs h-12 rounded-xl bg-green-600 hover:bg-green-700 text-lg font-semibold"
                >
                    Unlock
                </Button>
            </div>
        );
    }

    return <>{children}</>;
}
