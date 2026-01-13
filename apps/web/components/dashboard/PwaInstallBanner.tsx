'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Share, PlusSquare, Download } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function PwaInstallBanner() {
    const [showBanner, setShowBanner] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [platform, setPlatform] = useState<'native' | 'ios' | null>(null);
    const [showIosInstructions, setShowIosInstructions] = useState(false);
    const { t, direction } = useLanguage();

    useEffect(() => {
        // Check if dismissed
        const isDismissed = localStorage.getItem('pwa_banner_dismissed');
        if (isDismissed) return;

        // Detect iOS
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isIos && !isStandalone) {
            setPlatform('ios');
            setShowBanner(true);
        }

        // Capture install prompt for Android/Desktop
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setPlatform('native');
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('pwa_banner_dismissed', 'true');
    };

    const handleInstallClick = () => {
        if (platform === 'native' && deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                setDeferredPrompt(null);
                setShowBanner(false);
            });
        } else if (platform === 'ios') {
            setShowIosInstructions(true);
        }
    };

    if (!showBanner) return null;

    return (
        <>
            <div
                className="fixed top-0 left-0 right-0 z-50 bg-[#008069] text-white p-3 shadow-md flex items-center justify-between gap-4 animate-in slide-in-from-top duration-300"
                dir={direction}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-lg shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="App Icon" className="w-8 h-8 object-contain" />
                    </div>
                    <div className="text-sm font-medium leading-tight">
                        <div className="text-sm font-medium leading-tight">
                            <div>{t('pwa.install_title')}</div>
                            <div className="text-xs opacity-90">{t('pwa.install_subtitle')}</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 rounded-full bg-white text-[#008069] hover:bg-gray-100 font-bold"
                        onClick={handleInstallClick}
                    >
                        {platform === 'ios' ? t('pwa.guide_button') : t('pwa.install_button')}
                    </Button>
                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* iOS Instructions Dialog */}
            <Dialog open={showIosInstructions} onOpenChange={setShowIosInstructions}>
                <DialogContent className="max-w-xs sm:max-w-sm rounded-2xl" dir={direction}>
                    <DialogHeader>
                        <DialogTitle className="text-center">{t('pwa.ios_guide_title')}</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-6 py-4">
                        {/* Step 1 */}
                        <div className="flex items-center gap-4">
                            <div className="flex bg-gray-100 rounded-xl p-3 shrink-0">
                                <Share className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">{t('pwa.step_1_label')}</div>
                                <p className="text-sm text-gray-500">{t('pwa.step_1_text')}</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-center gap-4">
                            <div className="flex bg-gray-100 rounded-xl p-3 shrink-0">
                                <PlusSquare className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <div className="font-bold text-sm">{t('pwa.step_2_label')}</div>
                                <p className="text-sm text-gray-500">{t('pwa.step_2_text')}</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-center gap-4">
                            <div className="flex bg-gray-100 rounded-xl p-3 shrink-0 px-4">
                                <span className="font-bold text-blue-600">Add</span>
                            </div>
                            <div>
                                <div className="font-bold text-sm">{t('pwa.step_3_label')}</div>
                                <p className="text-sm text-gray-500">{t('pwa.step_3_text')}</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full rounded-xl"
                        onClick={() => setShowIosInstructions(false)}
                    >
                        {t('pwa.got_it')}
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}
