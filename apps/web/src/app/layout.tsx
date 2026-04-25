import type { Metadata } from 'next';
import { DM_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { ScrollToTop } from '@/components/layout/scroll-to-top';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { GrainOverlay } from '@/components/ui/grain-overlay';
import './globals.css';
import { Providers } from './providers';

// RainbowKit's getDefaultConfig is client-only. Forcing dynamic skips static
// prerender (e.g. /_not-found) that would try to evaluate it server-side.
export const dynamic = 'force-dynamic';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kiteid.xyz';

export const metadata: Metadata = {
  title: {
    default: 'KiteID — Your Identity on Kite AI',
    template: '%s | KiteID',
  },
  description:
    'Register your .kite domain name on Kite AI. The decentralized identity layer for agents and humans.',
  metadataBase: new URL(siteUrl),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'KiteID',
    title: 'KiteID — Your Identity on Kite AI',
    description: 'Register your .kite domain name on Kite AI.',
    url: siteUrl,
    images: [{ url: '/api/og/kiteid', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KiteID — Your Identity on Kite AI',
    description: 'Register your .kite domain name on Kite AI.',
    images: ['/api/og/kiteid'],
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookie = (await headers()).get('cookie');
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-parchment-grain font-sans text-foreground antialiased">
        <GrainOverlay />
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <ErrorBoundary>
          <Providers cookie={cookie}>{children}</Providers>
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-cream)',
              color: 'var(--color-carbon)',
              border: '1px solid var(--color-sand-core)',
              fontFamily: 'var(--font-sans)',
            },
          }}
        />
      </body>
    </html>
  );
}
