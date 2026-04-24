'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

// Dynamic import with ssr:false is the only reliable way to keep
// RainbowKit's getDefaultConfig (and WalletConnect's indexedDB access)
// out of the Node runtime. Using `'use client'` alone does NOT prevent
// SSR execution of the module — Next.js still runs it on the server
// for streaming HTML. SSR-disabling this subtree trades a brief blank
// first paint for a never-crashing server render.
const WagmiProviders = dynamic(() => import('./_wagmi-providers'), {
  ssr: false,
  loading: () => null,
});

export function Providers({ children, cookie }: { children: ReactNode; cookie?: string | null }) {
  return <WagmiProviders cookie={cookie}>{children}</WagmiProviders>;
}
