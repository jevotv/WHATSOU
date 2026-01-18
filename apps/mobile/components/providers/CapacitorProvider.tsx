'use client';

import { useEffect, useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CapacitorProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();
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
            const { Preferences } = await import('@capacitor/preferences');
            const { value } = await Preferences.get({ key: 'biometric_enabled' });

            if (value === 'true') {
                setIsLocked(true);
                setIsChecking(false);

                isVerifying.current = true;
                try {
                    const { NativeBiometric } = await import('capacitor-native-biometric');
                    await NativeBiometric.verifyIdentity({
                        reason: "فتح التطبيق",
                        title: "المصادقة مطلوبة",
                        subtitle: "استخدم بصمتك أو رمز القفل للمتابعة",
                        description: "",
                        useFallback: true, // Enable PIN/Pattern fallback
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

            // Listen for app state changes (resume from background)
            const setupAppStateListener = async () => {
                const { App } = await import('@capacitor/app');

                App.addListener('appStateChange', ({ isActive }) => {
                    if (!isActive) {
                        backgroundTime.current = Date.now();
                    } else {
                        const timeGone = Date.now() - backgroundTime.current;
                        // Only re-lock if gone for more than 5 seconds (prevents loop with biometric dialog)
                        if (timeGone > 5000) {
                            checkBiometricLock();
                        }
                    }
                });

                // App Deep Links
                App.addListener('appUrlOpen', async (data) => {
                    const url = new URL(data.url);
                    if (url.pathname) {
                        if (url.pathname.startsWith('/dashboard')) {
                            router.push(url.pathname + url.search);
                        }
                    }
                });

                return () => {
                    App.removeAllListeners();
                };
            };

            setupAppStateListener();
        } else {
            setIsChecking(false);
        }
    }, [user, router]);

    // Show blank screen while checking (prevents flash)
    if (isChecking && Capacitor.isNativePlatform()) {
        return <div className="min-h-screen bg-white" />;
    }

    // Show lock screen if locked
    if (isLocked) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 space-y-6" dir="rtl">
                <div className="bg-green-100 p-6 rounded-full animate-bounce">
                    <Lock className="w-12 h-12 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">التطبيق مقفل</h2>
                    <p className="text-gray-500">يرجى التحقق من هويتك للمتابعة</p>
                </div>
                <Button
                    onClick={checkBiometricLock}
                    className="w-full max-w-xs h-12 rounded-xl bg-[#008069] hover:bg-green-700 text-lg font-semibold text-white"
                >
                    فتح القفل
                </Button>
            </div>
        );
    }

    return <>{children}</>;
}
