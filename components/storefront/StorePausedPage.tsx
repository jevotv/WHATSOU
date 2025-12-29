'use client';

import { MessageCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface StorePausedPageProps {
    whatsappNumber: string;
    storeName: string;
}

export default function StorePausedPage({ whatsappNumber, storeName }: StorePausedPageProps) {
    const { language, direction } = useLanguage();

    // Format WhatsApp number for link
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const whatsappLink = `https://wa.me/${cleanNumber}`;

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-100 to-gray-200"
            dir={direction}
        >
            <div className="max-w-md w-full text-center space-y-8">
                {/* Icon */}
                <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-600" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {language === 'ar'
                            ? 'هذا المتجر متوقف مؤقتاً'
                            : 'This Store is Temporarily Paused'}
                    </h1>
                    <p className="text-gray-600">
                        {language === 'ar'
                            ? 'نعتذر عن أي إزعاج. المتجر سيعود قريباً.'
                            : 'We apologize for any inconvenience. The store will be back soon.'}
                    </p>
                </div>

                {/* Store Name */}
                <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-sm">
                    <p className="text-lg font-medium text-gray-800">{storeName}</p>
                </div>

                {/* WhatsApp Contact Button */}
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all hover:scale-105"
                >
                    <MessageCircle className="w-6 h-6" />
                    <span>
                        {language === 'ar'
                            ? 'تواصل مع صاحب المتجر'
                            : 'Contact Store Owner'}
                    </span>
                </a>

                {/* Footer */}
                <p className="text-sm text-gray-500">
                    {language === 'ar'
                        ? 'تقدمة من واتسو - متجرك على واتساب'
                        : 'Powered by Whatsou - Your WhatsApp Store'}
                </p>
            </div>
        </div>
    );
}
