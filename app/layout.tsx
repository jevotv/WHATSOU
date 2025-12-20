import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { CartProvider } from '@/lib/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';

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
            {children}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
