'use client';

import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { useWalletToasts } from '@/hooks/use-wallet-toasts';
import { config } from '@/lib/wagmi';

const kiteTheme = lightTheme({
  accentColor: '#C9986A',
  accentColorForeground: '#FAF7F0',
  borderRadius: 'medium',
  fontStack: 'system',
});

/** Mounts wallet-event toasts inside the Wagmi provider tree. */
function WalletToastBridge() {
  useWalletToasts();
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // WagmiProvider + RainbowKit crash under Next.js 16 / React 19 SSR
  // (useRef null inside WagmiProvider). Rendering null until the first
  // client-side effect runs avoids the crash at the cost of a ~100ms
  // post-hydration flash. Many children use wagmi hooks (Header,
  // ConnectButton, etc.), so we can't render them without the provider
  // tree either — gating the entire subtree is the only sound option.
  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={kiteTheme}>
          <WalletToastBridge />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
