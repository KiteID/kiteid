import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import 'fumadocs-ui/style.css';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'KiteID Docs',
    template: '%s — KiteID Docs',
  },
  description: 'Developer documentation for KiteID — the naming service on Kite AI.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
