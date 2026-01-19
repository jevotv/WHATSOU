'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@whatsou/shared';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';

export default function SignupPage() {
    const [step, setStep] = useState<'form' | 'otp'>('form');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreeToPrivacy, setAgreeToPrivacy] = useState(true);
    const { signUp } = useAuth();
    const { t, language, setLanguage, direction } = useLanguage();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const standardizedPhone = standardizePhoneNumber(phone);

            // 1. Send OTP
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({ action: 'send', phone: standardizedPhone }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

            setStep('otp');
        } catch (err: any) {
            setError(err.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const standardizedPhone = standardizePhoneNumber(phone);

            // 1. Verify OTP (Verify Only Mode)
            const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/whatsapp-auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    action: 'verify',
                    phone: standardizedPhone,
                    code,
                    verify_only: true // Important: Do not create auth user
                }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(verifyData.error || 'Invalid code');

            // 2. Create User (Server Action)
            await signUp(standardizedPhone, password);

        } catch (err: any) {
            setError(err.message || 'Failed to verify');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f6f8f7] to-[#e8f5e9] px-4" dir={direction}>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative">

                {/* Language Toggle */}
                <div className="absolute top-4 right-4">
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <Globe className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="text-center mb-8">
                    <div className="mx-auto bg-[#008069] w-16 h-16 rounded-3xl flex items-center justify-center overflow-hidden mb-4">
                        <div className="text-white font-bold text-2xl">W</div>
                        {/* Fallback text logo if image fails, or require Next.js Image component with public logo */}
                        {/* <Image src="/logo.png" alt="WhatSou Logo" width={48} height={48} className="w-12 h-12 object-contain brightness-0 invert" /> */}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.register_title') || 'Create Account'}</h1>
                    <p className="text-gray-600">
                        {step === 'form'
                            ? (t('auth.register_subtitle') || 'Get started with your store')
                            : `${language === 'ar' ? 'أدخل الرمز المرسل إلى' : 'Enter code sent to'} ${phone}`
                        }
                    </p>
                </div>

                <form onSubmit={step === 'form' ? handleSendOtp : handleVerifyAndSignup} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {step === 'form' ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('auth.phone_label') || 'Phone Number'}
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder={language === 'ar' ? '01XXXXXXXXX' : 'Phone Number'}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#008069] focus:border-transparent outline-none transition"
                                    required
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('auth.password_label') || 'Password'}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#008069] focus:border-transparent outline-none transition"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('auth.confirm_password_label') || 'Confirm Password'}
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="********"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#008069] focus:border-transparent outline-none transition"
                                    required
                                />
                            </div>

                            {/* Privacy Policy Checkbox */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="privacy-agree"
                                    checked={agreeToPrivacy}
                                    onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#008069] focus:ring-[#008069]"
                                />
                                <label htmlFor="privacy-agree" className="text-sm text-gray-600">
                                    {t('auth.agree_privacy') || 'I agree to the'}{' '}
                                    <Link href="/privacy" target="_blank" className="text-[#008069] hover:underline">
                                        {t('auth.privacy_policy') || 'Privacy Policy'}
                                    </Link>
                                </label>
                            </div>
                        </>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {language === 'ar' ? 'رمز التحقق' : 'Verification Code'}
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#008069] focus:border-transparent outline-none transition text-center text-lg tracking-widest"
                                required
                                dir="ltr"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || (step === 'form' && !agreeToPrivacy)}
                        className="w-full py-3 px-4 bg-[#008069] hover:bg-[#006d5b] text-white font-bold rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? (step === 'form' ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending Code...') : (language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating Account...')) : (step === 'form' ? (t('auth.create_account') || 'Create Account') : (language === 'ar' ? 'تحقق وإنشاء حساب' : 'Verify & Signup'))}
                    </button>

                    {step === 'otp' && (
                        <button
                            type="button"
                            onClick={() => setStep('form')}
                            className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
                        >
                            {language === 'ar' ? 'العودة للبيانات' : 'Back to Details'}
                        </button>
                    )}
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        {t('auth.has_account') || 'Already have an account?'}{' '}
                        <Link href="/login" className="text-[#008069] font-medium hover:underline">
                            {t('auth.sign_in_link') || 'Sign In'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
