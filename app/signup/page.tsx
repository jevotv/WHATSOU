'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ShoppingBag, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { standardizePhoneNumber } from '@/lib/utils/phoneNumber';

export default function SignupPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t, language, setLanguage, direction } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters'); // Should create translation for this if not in dictionary
      return;
    }

    setLoading(true);

    try {
      const standardizedPhone = standardizePhoneNumber(phone);
      await signUp(standardizedPhone, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
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
          <div className="mx-auto bg-green-500 w-16 h-16 rounded-3xl flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold">{t('auth.register_title')}</CardTitle>
          <CardDescription className="text-base">
            {t('auth.register_subtitle')}
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
              <label className="text-sm font-medium">{t('auth.email_label')}</label>
              <Input
                type="tel"
                placeholder={t('auth.email_placeholder')}
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-3xl bg-green-600 hover:bg-green-700 text-base font-semibold"
            >
              {loading ? t('auth.creating_account') : t('auth.create_account')}
            </Button>

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
