'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, Copy, Settings, Globe, Share, QrCode, Download, MoreVertical, MessageCircle } from 'lucide-react';
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
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Store } from '@/lib/types/database';

interface MockDashboardHeaderProps {
    store: Store | null;
}

export default function MockDashboardHeader({ store }: MockDashboardHeaderProps) {
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();
    const { t, language, setLanguage } = useLanguage();

    useEffect(() => {
        if (store) {
            if (store.qr_code) {
                setQrCodeUrl(store.qr_code);
            } else {
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

    const handleMockAction = (action: string) => {
        toast({
            title: "Demo Mode",
            description: `${action} is simulated or disabled in demo.`
        });
    };

    return (
        <header className="bg-[#008069] text-white sticky top-0 z-40 shadow-lg">
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
                                    onClick={() => handleMockAction('Sharing')}
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
                                    onClick={() => handleMockAction('Settings')}
                                    className="cursor-pointer"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    {t('dashboard.settings')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => window.open('https://wa.me/201000499431', '_blank')}
                                    className="cursor-pointer"
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    {t('dashboard.chat_support')}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => router.push('/')}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Quit Demo
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
                                                    onClick={() => handleMockAction('Share QR')}
                                                >
                                                    <Share className="w-4 h-4 mr-2" />
                                                    {t('dashboard.share')}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => handleMockAction('Download QR')}
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
