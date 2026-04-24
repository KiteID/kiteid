'use client';

import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { State } from 'wagmi';
import { WagmiProvider } from 'wagmi';
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

export function Providers({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: State;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={getConfig()} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={kiteTheme}>
          <WalletToastBridge />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
