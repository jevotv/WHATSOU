'use client';

import { useEffect, useState } from 'react';
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

    const checkBiometricLock = async () => {
        if (!Capacitor.isNativePlatform()) {
            setIsChecking(false);
            return;
        }

        try {
            const { value } = await Preferences.get({ key: 'biometric_enabled' });
            if (value === 'true') {
                setIsLocked(true);
                setIsChecking(false);

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

            // Listen for app resume
            App.addListener('appStateChange', ({ isActive }) => {
                if (isActive) {
                    checkBiometricLock();
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
                let permStatus = await PushNotifications.checkPermissions();

                // If prompt, requested on load for Merchant App utility
                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') return;

                await PushNotifications.register();

                PushNotifications.addListener('registration', async (token) => {
                    if (user?.id) {
                        const { error } = await supabase
                            .from('users')
                            .update({ fcm_token: token.value })
                            .eq('id', user.id);
                        if (error) console.error('Error saving FCM token:', error);
                    }
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
            };

            if (user) {
                setupPushNotifications();
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
