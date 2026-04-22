import type { Metadata } from 'next';
import { DM_Sans, Fraunces, JetBrains_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import { ScrollToTop } from '@/components/layout/scroll-to-top';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { GrainOverlay } from '@/components/ui/grain-overlay';
import './globals.css';
import { Providers } from './providers';

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

export const metadata: Metadata = {
  title: {
    default: 'KiteID — Your Identity on Kite AI',
    template: '%s | KiteID',
  },
  description:
    'Register your .kite domain name on Kite AI. The decentralized identity layer for agents and humans.',
  metadataBase: new URL('https://kiteid.xyz'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-parchment-grain font-sans text-foreground antialiased">
        <GrainOverlay />
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <ErrorBoundary>
          <Providers>{children}</Providers>
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
