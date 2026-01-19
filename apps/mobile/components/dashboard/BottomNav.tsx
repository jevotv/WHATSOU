'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Users } from 'lucide-react';
import { useLanguage } from '@whatsou/shared';

export default function BottomNav() {
    const pathname = usePathname();
    const { t } = useLanguage();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-[calc(1.5rem+var(--sab))] left-1/2 transform -translate-x-1/2 z-50 w-full px-4 sm:w-auto safe-area-bottom">
            <nav className="flex items-center justify-center gap-2 px-2 py-2 bg-white/80 backdrop-blur-lg border border-white/20 shadow-2xl rounded-full mx-auto max-w-fit">
                {/* Orders */}
                <Link
                    href="/dashboard/orders"
                    className={`flex flex-col items-center justify-center min-w-[64px] px-4 h-14 rounded-full transition-all duration-300 ${isActive('/dashboard/orders')
                        ? 'bg-[#008069] text-white shadow-lg translate-y-[-4px]'
                        : 'text-gray-500 hover:text-[#111813] hover:bg-gray-100'
                        }`}
                >
                    <ShoppingBag className={`w-5 h-5 ${isActive('/dashboard/orders') ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-bold mt-1 text-center leading-3 whitespace-nowrap">
                        {t('dashboard.nav_orders') || 'Orders'}
                    </span>
                </Link>

                {/* Home */}
                <Link
                    href="/dashboard"
                    className={`flex flex-col items-center justify-center min-w-[64px] px-4 h-14 rounded-full transition-all duration-300 ${isActive('/dashboard')
                        ? 'bg-[#008069] text-white shadow-lg translate-y-[-4px]'
                        : 'text-gray-500 hover:text-[#111813] hover:bg-gray-100'
                        }`}
                >
                    <Home className={`w-5 h-5 ${isActive('/dashboard') ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-bold mt-1 text-center leading-3 whitespace-nowrap">
                        {t('dashboard.nav_home') || 'Home'}
                    </span>
                </Link>

                {/* Customers */}
                <Link
                    href="/dashboard/customers"
                    className={`flex flex-col items-center justify-center min-w-[64px] px-4 h-14 rounded-full transition-all duration-300 ${isActive('/dashboard/customers')
                        ? 'bg-[#008069] text-white shadow-lg translate-y-[-4px]'
                        : 'text-gray-500 hover:text-[#111813] hover:bg-gray-100'
                        }`}
                >
                    <Users className={`w-5 h-5 ${isActive('/dashboard/customers') ? 'fill-current' : ''}`} />
                    <span className="text-[10px] font-bold mt-1 text-center leading-3 whitespace-nowrap">
                        {t('dashboard.nav_customers') || 'Customers'}
                    </span>
                </Link>
            </nav>
        </div>
    );
}
