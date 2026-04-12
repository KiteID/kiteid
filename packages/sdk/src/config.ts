import { createConfig, http } from 'wagmi';
import { kiteAI, kiteAITestnet } from './chains';

export type KiteConfigOptions = {
  testnet?: boolean;
  walletConnectProjectId?: string;
};

export function createKiteConfig(options: KiteConfigOptions = {}) {
  const { testnet = true } = options;
  const chains = testnet ? ([kiteAITestnet, kiteAI] as const) : ([kiteAI, kiteAITestnet] as const);

  return createConfig({
    chains,
    transports: {
      [kiteAI.id]: http(),
      [kiteAITestnet.id]: http(),
    },
    ssr: true,
  });
}
