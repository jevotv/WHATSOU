'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { usePathname } from 'next/navigation';
import { Package, ArrowLeft, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StorefrontNotFound() {
    const { t, language, setLanguage, direction } = useLanguage();
    const pathname = usePathname();

    // Extract store slug from pathname (e.g., /my-store/p/123 -> my-store)
    const storeSlug = pathname.split('/')[1] || '';

    return (
        <div
            className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f6]"
            dir={direction}
        >
            {/* Header - Similar to StorefrontClient */}
            <header className="bg-white w-full pt-8 pb-4 border-b border-gray-100 relative">
                <div className="absolute top-4 right-4 sm:right-8 z-10">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#19e65e]"
                    >
                        <Globe className="w-4 h-4" />
                        <span className="font-medium">{language === 'en' ? 'العربية' : 'English'}</span>
                    </Button>
                </div>
                <div className="flex justify-center">
                    <div className="flex flex-col items-center max-w-[960px] w-full px-4">
                        <div className="flex flex-col items-center gap-4">
                            {/* Store Logo Placeholder */}
                            <div className="relative h-24 w-24 rounded-full ring-4 ring-[#19e65e]/10 overflow-hidden bg-gradient-to-br from-[#19e65e] to-[#0a8f35]">
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-10 h-10 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex justify-center py-16">
                <div className="flex flex-col items-center max-w-md w-full px-4 text-center">
                    {/* Error Icon */}
                    <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                        <Package className="w-16 h-16 text-gray-300" />
                    </div>

                    {/* Error Badge */}
                    <div className="inline-block px-4 py-1.5 rounded-full bg-[#111813] text-white text-sm font-medium mb-4">
                        {t('error.error_code')}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-[#111813] mb-3">
                        {t('error.page_not_found')}
                    </h1>

                    {/* Description */}
                    <p className="text-gray-500 mb-8">
                        {t('error.page_not_found_desc')}
                    </p>

                    {/* Back to Store Button */}
                    <Link
                        href={`/${storeSlug}`}
                        className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-[#111813] hover:opacity-90 text-white rounded-full font-medium transition-opacity"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>{t('error.back_to_store')}</span>
                    </Link>
                </div>
            </main>

            {/* Footer - Same as StorefrontClient */}
            <footer className="mt-auto bg-white border-t border-gray-100 py-10">
                <div className="flex flex-col gap-6 px-5 text-center items-center">
                    <p className="text-gray-400 text-xs">
                        {t('common.copyright', { year: new Date().getFullYear(), storeName: 'WhatSou' })}
                    </p>
                </div>
            </footer>

            {/* Powered by WhatSou - Fixed Bottom Left */}
            <div className="fixed bottom-6 left-6 z-50">
                <button className="flex items-center justify-center h-12 px-6 gap-2 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20bd5a] transition-transform hover:scale-105 active:scale-95">
                    <Zap className="w-5 h-5" />
                    <span className="font-bold text-sm">{t('common.powered_by')}</span>
                </button>
            </div>
        </div>
    );
}
