import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
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
  );
}
