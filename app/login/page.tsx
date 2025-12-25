'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShoppingBag, Globe } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t, language, setLanguage, direction } = useLanguage();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Just set the value as typed, standardization happens on submit or we can do it live?
    // User asked to "standardize like phone currently", which usually implies live or on blur.
    // Let's just keep it simple and standardize on submit or use the utility if needed for display.
    // Actually existing util is robust. Let's just set raw value and standardize on submit.
    setPhone(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Standardize before sending
      const standardizedPhone = standardizePhoneNumber(phone);
      await signIn(standardizedPhone, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
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
          <CardTitle className="text-3xl font-bold">{t('auth.login_title')}</CardTitle>
          <CardDescription className="text-base">
            {t('auth.login_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('auth.phone_label')}</label>
              <Input
                type="tel"
                placeholder={t('auth.phone_placeholder')} // We might want to change translation key but for now reuse or keep same key with different text if user updates json separate
                value={phone}
                onChange={handlePhoneChange}
                required
                className="rounded-2xl h-12" // dir="ltr" might be good for phone numbers
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-3xl bg-green-600 hover:bg-green-700 text-base font-semibold"
            >
              {loading ? t('auth.signing_in') : t('auth.sign_in')}
            </Button>

            <p className="text-center text-sm text-gray-600">
              {t('auth.no_account')}{' '}
              <Link href="/signup" className="text-green-600 font-semibold hover:underline">
                {t('auth.sign_up_link')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
