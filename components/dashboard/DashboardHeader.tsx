'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Package, LogOut, Copy, Settings, Globe, Share, QrCode, Download, MoreVertical, MessageCircle, CreditCard } from 'lucide-react';
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
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Store } from '@/lib/types/database';
import { AppLauncher } from '@capacitor/app-launcher';
import { Capacitor } from '@capacitor/core';
import { Share as CapacitorShare } from '@capacitor/share';

interface DashboardHeaderProps {
    store: Store | null;
}

export default function DashboardHeader({ store }: DashboardHeaderProps) {
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
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
                const url = `${window.location.origin}/go/${store.id}`;
                QRCode.toDataURL(url).then(setQrCodeUrl).catch(console.error);
            }
        }
    }, [store]);

    const handleCopyStoreLink = () => {
        if (!store) return;
        const url = `${window.location.origin}/${store.slug}`;
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
                                        const url = `${window.location.origin}/${store.slug}`;

                                        if (Capacitor.isNativePlatform()) {
                                            try {
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
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = qrCodeUrl;
                                                        link.download = `${store?.slug}-qr.png`;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
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

                    </div>
                </div>
            </div>
        </header>
    );
}
