'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Package, LogOut, Copy, Settings, Globe, Share, QrCode, Download, MoreVertical, MessageCircle, CreditCard, Smartphone, PlusSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import QRCode from 'qrcode';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@whatsou/shared';
import { useToast } from '@/hooks/use-toast';
import { Store } from '@/lib/types/database';
import { Capacitor } from '@capacitor/core';

interface DashboardHeaderProps {
    store: Store | null;
}

export default function DashboardHeader({ store }: DashboardHeaderProps) {
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [platform, setPlatform] = useState<'native' | 'ios' | null>(null);
    const [showIosInstructions, setShowIosInstructions] = useState(false);
    const { signOut } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { t, direction, language, setLanguage } = useLanguage();

    useEffect(() => {
        if (store) {
            if (store.qr_code) {
                setQrCodeUrl(store.qr_code);
            } else {
                // Generate client-side if missing
                // Use dynamic redirect URL: /go/[store_id]
                const url = `https://whatsou.vercel.app/go/${store.id}`;
                QRCode.toDataURL(url).then(setQrCodeUrl).catch(console.error);
            }
        }

        // PWA Install prompt detection
        // Detect iOS
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isIos && !isStandalone) {
            setPlatform('ios');
        }

        // Capture install prompt for Android/Desktop
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setPlatform('native');
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, [store]);

    const handleInstallClick = () => {
        if (platform === 'native' && deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    toast({
                        title: t('pwa.install_title'),
                        description: t('pwa.install_subtitle'),
                    });
                }
                setDeferredPrompt(null);
            });
        } else if (platform === 'ios') {
            setShowIosInstructions(true);
        } else {
            // App is already installed or not available
            toast({
                title: t('pwa.install_title'),
                description: t('pwa.not_install_subtitle'),
            });
        }
    };

    const handleCopyStoreLink = () => {
        if (!store) return;
        const url = `https://whatsou.vercel.app/${store.slug}`;
        navigator.clipboard.writeText(url);
        toast({
            title: t('dashboard.link_copied'),
            description: t('dashboard.link_copied_desc'),
        });
    };

    return (
        <header className="bg-[#008069] text-white sticky top-0 z-40 shadow-lg pt-[var(--sat)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 shrink-0 object-contain brightness-0 invert" />
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold truncate">{store?.name}</h1>
                            <p className="text-xs text-green-100 hidden sm:block">{t('dashboard.whatsapp_commerce')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="text-white hover:bg-[#017561] rounded-2xl px-2 sm:px-4 h-9 sm:h-10"
                                >
                                    <Share className="w-4 h-4 ml-0 md:ml-0" />
                                    <span className="hidden md:inline ml-2">{t('dashboard.share')}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={handleCopyStoreLink} className="cursor-pointer">
                                    <Copy className="w-4 h-4 mr-2" />
                                    {t('dashboard.copy_link')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={async () => {
                                        if (!store) return;
                                        const url = `https://whatsou.vercel.app/${store.slug}`;

                                        if (Capacitor.isNativePlatform()) {
                                            try {
                                                const { Share: CapacitorShare } = await import('@capacitor/share');
                                                await CapacitorShare.share({
                                                    title: store.name,
                                                    text: store.description || '',
                                                    url: url,
                                                    dialogTitle: t('dashboard.share_store'),
                                                });
                                                return;
                                            } catch (e) {
                                                console.error('Share failed', e);
                                            }
                                        }

                                        if (navigator.share) {
                                            navigator.share({
                                                title: store.name,
                                                text: store.description || '',
                                                url: url,
                                            }).catch(console.error);
                                        } else {
                                            handleCopyStoreLink();
                                        }
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Share className="w-4 h-4 mr-2" />
                                    {t('dashboard.share_link')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowQrModal(true)}
                                    className="cursor-pointer"
                                >
                                    <QrCode className="w-4 h-4 mr-2" />
                                    {t('dashboard.share_qr')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-[#017561] rounded-2xl w-9 h-9 sm:w-10 sm:h-10"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                                    className="cursor-pointer"
                                >
                                    <Globe className="w-4 h-4 mr-2" />
                                    {language === 'en' ? 'العربية' : 'English'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => router.push('/dashboard/settings')}
                                    className="cursor-pointer"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    {t('dashboard.settings')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={async () => {
                                        const phone = '201000499431';
                                        if (Capacitor.isNativePlatform()) {
                                            try {
                                                const { AppLauncher } = await import('@capacitor/app-launcher');
                                                const canOpen = await AppLauncher.canOpenUrl({ url: 'whatsapp://' });
                                                if (canOpen.value) {
                                                    await AppLauncher.openUrl({ url: `whatsapp://send?phone=${phone}` });
                                                    return;
                                                }
                                            } catch (e) {
                                                console.error('AppLauncher error', e);
                                            }
                                        }
                                        window.open(`https://wa.me/${phone}`, '_blank');
                                    }}
                                    className="cursor-pointer"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    {t('dashboard.chat_support')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleInstallClick}
                                    className="cursor-pointer"
                                >
                                    <Smartphone className="w-4 h-4 mr-2" />
                                    {t('dashboard.install_app')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={signOut}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    {t('dashboard.logout')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-center">{t('dashboard.share_qr')}</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                                    {qrCodeUrl ? (
                                        <>
                                            <div className="relative w-64 h-64 border-4 border-[#008069] rounded-xl overflow-hidden p-2 bg-white">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={qrCodeUrl} alt="Store QR Code" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex gap-2 w-full">
                                                <Button
                                                    className="flex-1 bg-[#008069] hover:bg-[#017561]"
                                                    onClick={async () => {
                                                        try {
                                                            const response = await fetch(qrCodeUrl);
                                                            const blob = await response.blob();
                                                            const file = new File([blob], `${store?.slug}-qr.png`, { type: 'image/png' });

                                                            if (navigator.share) {
                                                                await navigator.share({
                                                                    files: [file],
                                                                    title: store?.name || 'Store QR Code',
                                                                    text: store?.name,
                                                                });
                                                            } else {
                                                                // Fallback
                                                                const link = document.createElement('a');
                                                                link.href = qrCodeUrl;
                                                                link.download = `${store?.slug}-qr.png`;
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }
                                                        } catch (error) {
                                                            console.error('Error sharing:', error);
                                                        }
                                                    }}
                                                >
                                                    <Share className="w-4 h-4 mr-2" />
                                                    {t('dashboard.share')}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={async () => {
                                                        try {
                                                            if (Capacitor.isNativePlatform()) {
                                                                // Native: Use Capacitor Filesystem
                                                                const { Filesystem, Directory } = await import('@capacitor/filesystem');

                                                                // Convert data URL to base64
                                                                const base64Data = qrCodeUrl.split(',')[1];
                                                                const fileName = `${store?.slug || 'store'}-qr-${Date.now()}.png`;

                                                                // Save to Downloads folder
                                                                await Filesystem.writeFile({
                                                                    path: fileName,
                                                                    data: base64Data,
                                                                    directory: Directory.Documents,
                                                                });

                                                                toast({
                                                                    title: t('common.download'),
                                                                    description: language === 'ar' ? 'تم حفظ الصورة بنجاح' : 'Image saved successfully',
                                                                });
                                                            } else {
                                                                // Web: Use traditional download
                                                                const link = document.createElement('a');
                                                                link.href = qrCodeUrl;
                                                                link.download = `${store?.slug}-qr.png`;
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }
                                                        } catch (error) {
                                                            console.error('Download error:', error);
                                                            toast({
                                                                title: t('common.error'),
                                                                description: String(error),
                                                                variant: 'destructive',
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    {t('common.download')}
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008069] mx-auto mb-4"></div>
                                            <p>{t('common.loading')}</p>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

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

                    </div>
                </div>
            </div>
        </header>
    );
}
