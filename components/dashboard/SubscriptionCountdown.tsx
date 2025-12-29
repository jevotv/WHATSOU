'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useSubscription } from '@/lib/contexts/SubscriptionContext';
import { Crown, AlertTriangle, Lock } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionCountdown() {
    const { language } = useLanguage();
    const { subscription, loading } = useSubscription();

    if (loading || !subscription) {
        return null;
    }

    // Show payment prompt for inactive (unpaid) subscriptions
    if (subscription.status === 'inactive') {
        return (
            <Link href="/dashboard/subscription" className="block">
                <div className="mx-4 mt-2 bg-amber-100 border-2 border-amber-500 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                    <Crown className="w-8 h-8 text-amber-600" />
                    <div className="flex-1">
                        <p className="text-amber-700 font-bold">
                            {language === 'ar' ? 'فعّل اشتراكك' : 'Activate Your Subscription'}
                        </p>
                        <p className="text-amber-600 text-sm">
                            {language === 'ar'
                                ? 'ادفع الآن للوصول الكامل لمتجرك'
                                : 'Pay now to unlock full access to your store'}
                        </p>
                    </div>
                    <span className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
                        {language === 'ar' ? 'ادفع الآن' : 'Pay Now'}
                    </span>
                </div>
            </Link>
        );
    }

    const { status, daysRemaining, isReadOnly } = subscription;

    // Determine color based on days remaining
    let bgColor = 'bg-green-500';
    let textColor = 'text-green-600';
    let progressColor = 'bg-green-500';

    if (daysRemaining !== null) {
        if (daysRemaining <= 3) {
            bgColor = 'bg-red-500';
            textColor = 'text-red-600';
            progressColor = 'bg-red-500';
        } else if (daysRemaining <= 7) {
            bgColor = 'bg-yellow-500';
            textColor = 'text-yellow-600';
            progressColor = 'bg-yellow-500';
        }
    }

    // For grace/expired, show warning colors
    if (status === 'grace' || status === 'expired') {
        bgColor = status === 'grace' ? 'bg-yellow-500' : 'bg-red-500';
        textColor = status === 'grace' ? 'text-yellow-600' : 'text-red-600';
        progressColor = status === 'grace' ? 'bg-yellow-500' : 'bg-red-500';
    }

    // Calculate progress (30 days = 100%)
    const progress = daysRemaining !== null ? Math.max(0, Math.min(100, (daysRemaining / 30) * 100)) : 0;

    return (
        <>
            {/* Read-Only Warning Banner */}
            {isReadOnly && (
                <div className="mx-4 mt-2 bg-red-100 border-2 border-red-500 rounded-xl p-3 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-red-700 font-bold text-sm">
                            {language === 'ar' ? 'وضع القراءة فقط' : 'Read-Only Mode'}
                        </p>
                        <p className="text-red-600 text-xs">
                            {language === 'ar'
                                ? 'اشتراكك منتهي. لا يمكنك تعديل المنتجات أو الإعدادات حتى تجدد.'
                                : 'Your subscription has expired. You cannot edit products or settings until you renew.'}
                        </p>
                    </div>
                    <Link
                        href="/dashboard/subscription"
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700"
                    >
                        {language === 'ar' ? 'جدد الآن' : 'Renew Now'}
                    </Link>
                </div>
            )}

            {/* Progress Bar */}
            <Link href="/dashboard/subscription" className="block">
                <div className={`mx-4 mt-2 rounded-xl overflow-hidden shadow-sm ${status === 'grace' || status === 'expired' ? 'animate-pulse' : ''
                    }`}>
                    {/* Progress bar background */}
                    <div className="bg-gray-200 h-2">
                        <div
                            className={`h-full ${progressColor} transition-all duration-500`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Content */}
                    <div className="bg-white px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Crown className={`w-5 h-5 ${textColor}`} />
                            <span className={`font-medium ${textColor}`}>
                                {status === 'active' && daysRemaining !== null && (
                                    language === 'ar'
                                        ? `متبقي ${daysRemaining} يوم`
                                        : `${daysRemaining} days left`
                                )}
                                {status === 'grace' && (
                                    language === 'ar'
                                        ? 'فترة سماح - جدد الآن'
                                        : 'Grace period - Renew now'
                                )}
                                {status === 'expired' && (
                                    language === 'ar'
                                        ? 'اشتراك منتهي'
                                        : 'Subscription expired'
                                )}
                            </span>
                        </div>

                        {(status !== 'active' || (daysRemaining !== null && daysRemaining <= 7)) && (
                            <span className={`text-sm ${textColor} font-bold`}>
                                {language === 'ar' ? 'جدد ←' : 'Renew →'}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </>
    );
}

