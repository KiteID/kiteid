'use client';

import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { config } from '@/lib/wagmi';

const kiteTheme = lightTheme({
  accentColor: '#C9986A',
  accentColorForeground: '#FAF7F0',
  borderRadius: 'medium',
  fontStack: 'system',
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={kiteTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
