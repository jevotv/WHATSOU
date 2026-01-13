import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/contexts/AuthContext';

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
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
