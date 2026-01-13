'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { getSubscriptionStatus, initiatePayment, getPaymentHistory, initiateManualPayment, SubscriptionStatus } from '@/app/actions/subscription';
import { CreditCard, Wallet, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw, Smartphone, ExternalLink, MessageCircle, Home } from 'lucide-react';

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
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'instapay' | 'vodafone'>('card');
    const [subscriptionPeriod, setSubscriptionPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [showSuccess, setShowSuccess] = useState(false);
    const [manualPaymentResult, setManualPaymentResult] = useState<any>(null);

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

        // Manual payment methods
        if (paymentMethod === 'instapay' || paymentMethod === 'vodafone') {
            const result = await initiateManualPayment(paymentMethod, subscriptionPeriod);

            if (result.error) {
                alert(result.error);
                setPaymentLoading(false);
                return;
            }

            setManualPaymentResult(result);
            setPaymentLoading(false);
            return;
        }

        // Card payment
        const result = await initiatePayment('card');

        if (result.error) {
            alert(result.error);
            setPaymentLoading(false);
            return;
        }

        if (result.payment_url) {
            window.location.href = result.payment_url;
        } else if (result.client_secret && result.public_key) {
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
            {/* Home Button */}
            <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-[#008069] transition"
            >
                <Home className="w-5 h-5" />
                <span className="font-medium">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </button>

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

                    {/* Period Toggle - Only show for renewal */}
                    {!subscription?.isFirstSubscription && (
                        <div className="flex justify-center mb-6">
                            <div className="bg-gray-100 p-1 rounded-xl flex" dir="ltr">
                                <button
                                    onClick={() => setSubscriptionPeriod('monthly')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${subscriptionPeriod === 'monthly'
                                        ? 'bg-white text-[#008069] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {language === 'ar' ? 'Monthly' : 'Monthly'}
                                </button>
                                <button
                                    onClick={() => setSubscriptionPeriod('yearly')}
                                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${subscriptionPeriod === 'yearly'
                                        ? 'bg-white text-[#008069] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {language === 'ar' ? 'Yearly' : 'Yearly'}
                                    <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                        -16%
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-gradient-to-r from-[#008069] to-[#00a884] text-white rounded-xl p-4 mb-6">
                        <p className="text-3xl font-bold">
                            {subscription?.isFirstSubscription
                                ? 100
                                : (subscriptionPeriod === 'yearly' ? 3000 : 300)} EGP
                        </p>
                        <p className="opacity-80">
                            {subscription?.isFirstSubscription
                                ? (language === 'ar' ? 'للشهر الأول' : 'for the first month')
                                : (subscriptionPeriod === 'yearly'
                                    ? (language === 'ar' ? 'سنوياً' : 'per year')
                                    : (language === 'ar' ? 'شهرياً' : 'per month'))}
                        </p>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <button
                            disabled
                            className="p-4 rounded-xl border-2 border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed flex flex-col items-center gap-1"
                        >
                            <CreditCard className="w-6 h-6 text-gray-400" />
                            <span className="text-sm font-medium text-gray-400">
                                {language === 'ar' ? 'بطاقة' : 'Card'}
                            </span>
                            <span className="text-xs text-gray-400">
                                {language === 'ar' ? 'قريباً' : 'Soon'}
                            </span>
                        </button>
                        <button
                            onClick={() => { setPaymentMethod('instapay'); setManualPaymentResult(null); }}
                            className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${paymentMethod === 'instapay'
                                ? 'border-[#008069] bg-[#008069]/5'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Smartphone className={`w-6 h-6 ${paymentMethod === 'instapay' ? 'text-[#008069]' : 'text-gray-400'}`} />
                            <span className={`text-sm font-medium ${paymentMethod === 'instapay' ? 'text-[#008069]' : 'text-gray-600'}`}>
                                InstaPay
                            </span>
                        </button>
                        <button
                            onClick={() => { setPaymentMethod('vodafone'); setManualPaymentResult(null); }}
                            className={`p-4 rounded-xl border-2 transition flex flex-col items-center gap-2 ${paymentMethod === 'vodafone'
                                ? 'border-[#008069] bg-[#008069]/5'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Wallet className={`w-6 h-6 ${paymentMethod === 'vodafone' ? 'text-[#008069]' : 'text-gray-400'}`} />
                            <span className={`text-sm font-medium ${paymentMethod === 'vodafone' ? 'text-[#008069]' : 'text-gray-600'}`}>
                                Vodafone
                            </span>
                        </button>
                    </div>

                    {/* Manual Payment Result UI */}
                    {manualPaymentResult && (paymentMethod === 'instapay' || paymentMethod === 'vodafone') && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 space-y-4">
                            <p className="text-amber-800 font-medium text-center">
                                {language === 'ar' ? '✅ تم منحك صلاحية 24 ساعة مؤقتة' : '✅ You have 24h temporary access'}
                            </p>

                            <div className="flex flex-col gap-3">
                                <a
                                    href={manualPaymentResult.payment_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    {language === 'ar' ? 'افتح رابط الدفع' : 'Open Payment Link'}
                                </a>

                                <a
                                    href={manualPaymentResult.whatsapp_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#1ebe57]"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {language === 'ar' ? 'أرسل السكرين شوت' : 'Send Screenshot'}
                                </a>
                            </div>

                            <p className="text-sm text-gray-500 text-center">
                                {language === 'ar'
                                    ? 'بعد الدفع، أرسل سكرين شوت التحويل على الواتساب'
                                    : 'After payment, send the screenshot via WhatsApp'}
                            </p>
                        </div>
                    )}

                    {/* Pay Button (only for card or when no manual result) */}
                    {(!manualPaymentResult || paymentMethod === 'card') && (

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
                                paymentMethod === 'card'
                                    ? (language === 'ar' ? 'ادفع الآن' : 'Pay Now')
                                    : (language === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment')
                            )}
                        </button>
                    )}
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
