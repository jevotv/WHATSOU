import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { CartProvider } from '@/lib/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhatSou - WhatsApp Commerce Platform',
  description: 'Create your WhatsApp store in 60 seconds. Photo -> Price -> Sell',
  openGraph: {
    title: 'WhatSou - WhatsApp Commerce Platform',
    description: 'Create your WhatsApp store in 60 seconds. Photo -> Price -> Sell',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatSou - WhatsApp Commerce Platform',
    description: 'Create your WhatsApp store in 60 seconds. Photo -> Price -> Sell',
  },
};

import { LanguageProvider } from '@/lib/contexts/LanguageContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <LanguageProvider>
              {children}
              <Toaster />
              <SpeedInsights />
            </LanguageProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
