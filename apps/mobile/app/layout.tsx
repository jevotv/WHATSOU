import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { LanguageProvider } from '@whatsou/shared';

export const metadata: Metadata = {
    title: 'WhatSou Dashboard',
    description: 'Manage your WhatsApp store',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body>
                <LanguageProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
