'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn(phone, password);
        if (result.error) {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f6f8f7] to-[#e8f5e9] px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بك</h1>
                    <p className="text-gray-600">سجل دخولك للوصول لمتجرك</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            رقم الهاتف
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#008069] focus:border-transparent outline-none transition"
                            required
                            dir="ltr"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            كلمة المرور
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-[#008069] hover:bg-[#006d5b] text-white font-bold rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'جاري التسجيل...' : 'تسجيل الدخول'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        ليس لديك حساب؟{' '}
                        <Link href="/signup" className="text-[#008069] font-medium hover:underline">
                            إنشاء حساب جديد
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
