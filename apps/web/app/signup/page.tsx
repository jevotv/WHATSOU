'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShoppingBag, Globe } from 'lucide-react';
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
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50 p-4" dir={direction}>
      <Card className="w-full max-w-md rounded-3xl shadow-xl">
        <CardHeader className="text-center space-y-4 relative">
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="rounded-full w-8 h-8 p-0"
            >
              <Globe className="w-4 h-4" />
            </Button>
          </div>
          <div className="mx-auto bg-green-500 w-16 h-16 rounded-3xl flex items-center justify-center overflow-hidden">
            <Image src="/logo.png" alt="WhatSou Logo" width={48} height={48} className="w-12 h-12 object-contain brightness-0 invert" />
          </div>
          <CardTitle className="text-3xl font-bold">{t('auth.register_title')}</CardTitle>
          <CardDescription className="text-base">
            {step === 'form' ? t('auth.register_subtitle') : `Enter code sent to ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={step === 'form' ? handleSendOtp : handleVerifyAndSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {step === 'form' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('auth.phone_label')}</label>
                  <Input
                    type="tel"
                    placeholder={t('auth.phone_placeholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="rounded-2xl h-12"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('auth.password_label')}</label>
                  <Input
                    type="password"
                    placeholder={t('auth.password_placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-2xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('auth.confirm_password_label')}</label>
                  <Input
                    type="password"
                    placeholder={t('auth.password_placeholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="rounded-2xl h-12"
                  />
                </div>

                {/* Privacy Policy Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy-agree"
                    checked={agreeToPrivacy}
                    onChange={(e) => setAgreeToPrivacy(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="privacy-agree" className="text-sm text-gray-600">
                    {t('auth.agree_privacy')}{' '}
                    <Link href="/privacy" target="_blank" className="text-green-600 hover:underline">
                      {t('auth.privacy_policy')}
                    </Link>
                  </label>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Code</label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="rounded-2xl h-12 text-center text-lg tracking-widest"
                  dir="ltr"
                  maxLength={6}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || (step === 'form' && !agreeToPrivacy)}
              className="w-full h-12 rounded-3xl bg-green-600 hover:bg-green-700 text-base font-semibold"
            >
              {loading ? (step === 'form' ? 'Sending Code...' : 'Creating Account...') : (step === 'form' ? t('auth.create_account') : 'Verify & Signup')}
            </Button>

            {step === 'otp' && (
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                Back to Details
              </button>
            )}

            <p className="text-center text-sm text-gray-600">
              {t('auth.has_account')}{' '}
              <Link href="/login" className="text-green-600 font-semibold hover:underline">
                {t('auth.sign_in_link')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

