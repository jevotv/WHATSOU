'use client';

import { useLanguage } from '@whatsou/shared';
import MockBottomNav from '@/components/demo/MockBottomNav';
import MockDashboardHeader from '@/components/demo/MockDashboardHeader';
import { useMockDashboard } from '@/lib/contexts/MockDashboardContext';
// import PwaInstallBanner from '@/components/dashboard/PwaInstallBanner';

export default function DemoLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const { store } = useMockDashboard();
    const { direction } = useLanguage();

    return (
        <div className="min-h-screen bg-[#f0f2f5] overflow-x-hidden" dir={direction}>
            {/* <PwaInstallBanner /> - Optional for demo */}
            <MockDashboardHeader store={store} />
            <div className="pb-24">
                {children}
            </div>
            <MockBottomNav />
        </div>
    );
}
