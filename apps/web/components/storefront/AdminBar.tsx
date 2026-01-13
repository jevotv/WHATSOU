'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

export default function AdminBar() {
    const { t } = useLanguage();

    return (
        <div className="sticky top-0 z-[100] w-full bg-[#111813] text-white px-4 py-3 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-[#19e65e]" />
                <span className="font-medium text-sm sm:text-base">
                    {t('storefront.admin_viewing_store')}
                </span>
            </div>
            <Link
                href="/dashboard"
                className="bg-[#19e65e] text-[#111813] px-4 py-1.5 rounded-full text-sm font-bold hover:bg-[#16cc52] transition-colors"
            >
                {t('storefront.go_to_dashboard')}
            </Link>
        </div>
    );
}
