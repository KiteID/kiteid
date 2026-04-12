import { defineChain } from 'viem';

export const kiteAI = defineChain({
  id: 2366,
  name: 'Kite AI',
  nativeCurrency: {
    decimals: 18,
    name: 'KITE',
    symbol: 'KITE',
  },
  rpcUrls: {
    default: { http: ['https://rpc.gokite.ai/'] },
  },
  blockExplorers: {
    default: { name: 'KiteScan', url: 'https://kitescan.ai' },
  },
});

export const kiteAITestnet = defineChain({
  id: 2368,
  name: 'Kite AI Testnet (Ozone)',
  nativeCurrency: {
    decimals: 18,
    name: 'KITE',
    symbol: 'KITE',
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.gokite.ai/'] },
  },
  blockExplorers: {
    default: { name: 'KiteScan Testnet', url: 'https://testnet.kitescan.ai' },
  },
  testnet: true,
});
