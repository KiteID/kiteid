import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import 'fumadocs-ui/style.css';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';

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
        <RootProvider>
          <DocsLayout
            tree={source.pageTree}
            nav={{
              title: (
                <span className="font-bold">
                  Kite<span style={{ color: '#C9986A' }}>ID</span>{' '}
                  <span className="text-sm font-normal opacity-60">Docs</span>
                </span>
              ),
              url: 'https://kiteid.xyz',
            }}
            links={[
              { text: 'App', url: 'https://kiteid.xyz' },
              { text: 'Status', url: 'https://status.kiteid.xyz' },
              { text: 'GitHub', url: 'https://github.com/KiteID/kiteid', external: true },
            ]}
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
