'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { getSubscriptionStatus, initiatePayment, getPaymentHistory, SubscriptionStatus } from '@/app/actions/subscription';
import { CreditCard, Wallet, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

const statusConfig = {
    active: {
        color: 'bg-green-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: CheckCircle,
        labelAr: 'نشط',
        labelEn: 'Active',
    },
    grace: {
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: AlertTriangle,
        labelAr: 'فترة سماح',
        labelEn: 'Grace Period',
    },
    expired: {
        color: 'bg-red-500',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: XCircle,
        labelAr: 'منتهي',
        labelEn: 'Expired',
    },
    inactive: {
        color: 'bg-gray-400',
        textColor: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: Clock,
        labelAr: 'غير نشط',
        labelEn: 'Inactive',
    },
};

export default function SubscriptionPage() {
    const { t, direction, language } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        loadData();

        // Check if returning from payment
        if (searchParams.get('status') === 'complete') {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [searchParams]);

    async function loadData() {
        setLoading(true);
        const [subStatus, history] = await Promise.all([
            getSubscriptionStatus(),
            getPaymentHistory(),
        ]);
        setSubscription(subStatus);
        setTransactions(history.transactions || []);
        setLoading(false);
    }

    async function handlePayment() {
        setPaymentLoading(true);
        const result = await initiatePayment(paymentMethod);

        if (result.error) {
            alert(result.error);
            setPaymentLoading(false);
            return;
        }

        if (result.payment_url) {
            window.location.href = result.payment_url;
        } else if (result.client_secret && result.public_key) {
            // Fallback: Construct Unified Checkout URL manually
            // Format: https://accept.paymob.com/unifiedcheckout/?publicKey={publicKey}&clientSecret={clientSecret}
            window.location.href = `https://accept.paymob.com/unifiedcheckout/?publicKey=${result.public_key}&clientSecret=${result.client_secret}`;
        } else {
            setPaymentLoading(false);
            alert('Something went wrong. Please try again.');
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008069]"></div>
            </div>
        );
    }

    const config = statusConfig[subscription?.status || 'inactive'];
    const StatusIcon = config.icon;

    return (
        <div className="p-4 max-w-2xl mx-auto space-y-6" dir={direction}>
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-slide-down">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6" />
                        <span>{language === 'ar' ? 'تم تفعيل اشتراكك بنجاح!' : 'Subscription activated successfully!'}</span>
                    </div>
                </div>
            )}

            {/* Status Card */}
            <div className={`rounded-2xl ${config.bgColor} p-6 shadow-sm`}>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-800">
                        {language === 'ar' ? 'الاشتراك' : 'Subscription'}
                    </h1>
                    <button onClick={loadData} className="p-2 hover:bg-white/50 rounded-full transition">
                        <RefreshCw className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 ${config.color} rounded-full flex items-center justify-center`}>
                        <StatusIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className={`text-2xl font-bold ${config.textColor}`}>
                            {language === 'ar' ? config.labelAr : config.labelEn}
                        </p>
                        {subscription?.daysRemaining !== null && subscription?.daysRemaining !== undefined && subscription.daysRemaining > 0 && (
                            <p className="text-gray-600">
                                {language === 'ar'
                                    ? `متبقي ${subscription.daysRemaining} يوم`
                                    : `${subscription.daysRemaining} days remaining`
                                }
                            </p>
                        )}
                    </div>
                </div>

                {/* Read-only Warning */}
                {subscription?.isReadOnly && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
                        <p className="text-yellow-800 font-medium">
                            {language === 'ar'
                                ? '⚠️ لوحة التحكم في وضع القراءة فقط. جدد اشتراكك للاستمرار.'
                                : '⚠️ Dashboard is in read-only mode. Renew to continue.'}
                        </p>
                    </div>
                )}

                {/* Expiry Date */}
                {subscription?.expiresAt && subscription.status === 'active' && (
                    <p className="text-gray-500 text-sm">
                        {language === 'ar' ? 'ينتهي في: ' : 'Expires: '}
                        {new Date(subscription.expiresAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                )}
            </div>

            {/* Payment Section */}
            {(subscription?.status !== 'active' || (subscription?.daysRemaining !== null && subscription?.daysRemaining !== undefined && subscription.daysRemaining <= 7)) && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
                        {subscription?.status === 'active'
                            ? (language === 'ar' ? 'تجديد مبكر' : 'Early Renewal')
                            : (language === 'ar' ? 'اشترك الآن' : 'Subscribe Now')}
                    </h2>

                    <div className="bg-gradient-to-r from-[#008069] to-[#00a884] text-white rounded-xl p-4 mb-6">
                        <p className="text-3xl font-bold">{subscription?.amount} EGP</p>
                        <p className="opacity-80">
                            {language === 'ar' ? 'شهرياً' : 'per month'}
                        </p>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-1 gap-3 mb-6">
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${paymentMethod === 'card'
                                ? 'border-[#008069] bg-[#008069]/5'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <CreditCard className={`w-8 h-8 ${paymentMethod === 'card' ? 'text-[#008069]' : 'text-gray-400'}`} />
                            <span className={`font-medium ${paymentMethod === 'card' ? 'text-[#008069]' : 'text-gray-600'}`}>
                                {language === 'ar' ? 'بطاقة بنكية' : 'Credit / Debit Card'}
                            </span>
                        </button>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={paymentLoading}
                        className="w-full bg-[#008069] hover:bg-[#006a58] text-white font-bold py-4 px-6 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {paymentLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
                            </div>
                        ) : (
                            language === 'ar' ? 'ادفع الآن' : 'Pay Now'
                        )}
                    </button>
                </div>
            )}

            {/* Payment History */}
            {transactions.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">
                        {language === 'ar' ? 'سجل المدفوعات' : 'Payment History'}
                    </h2>

                    <div className="space-y-3">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">{tx.amount} EGP</p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(tx.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${tx.status === 'success'
                                    ? 'bg-green-100 text-green-700'
                                    : tx.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                    {tx.status === 'success'
                                        ? (language === 'ar' ? 'ناجح' : 'Success')
                                        : tx.status === 'pending'
                                            ? (language === 'ar' ? 'قيد الانتظار' : 'Pending')
                                            : (language === 'ar' ? 'فشل' : 'Failed')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
