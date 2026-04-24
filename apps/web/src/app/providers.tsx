'use client';

import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { cookieToInitialState, WagmiProvider } from 'wagmi';
import { useWalletToasts } from '@/hooks/use-wallet-toasts';
import { getConfig } from '@/lib/wagmi';

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

export function Providers({ children, cookie }: { children: ReactNode; cookie?: string | null }) {
  const [config] = useState(() => getConfig());
  const [queryClient] = useState(() => new QueryClient());
  const initialState = cookieToInitialState(config, cookie);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={kiteTheme}>
          <WalletToastBridge />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
