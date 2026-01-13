import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
// import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { CartProvider } from '@/lib/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import { CapacitorProvider } from '@/components/providers/CapacitorProvider';
import { MetaPixelProvider } from '@/components/providers/MetaPixelProvider';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WhatSou - WhatsApp Commerce Platform',
  description: 'Create your WhatsApp store in 60 seconds. Photo -> Price -> Sell',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
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
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '689235877602305');
            fbq('track', 'PageView');
          `,
        }}
      />
      <body className="font-sans">
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=689235877602305&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <AuthProvider>
          <CartProvider>
            <LanguageProvider>
              <CapacitorProvider>
                <MetaPixelProvider>
                  {children}
                </MetaPixelProvider>
              </CapacitorProvider>
              <Toaster />
            </LanguageProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
