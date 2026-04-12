'use client';

import { kiteAI, kiteAITestnet } from '@kiteid/sdk';
import { useAccount, useSwitchChain } from 'wagmi';

const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? '2368');
const targetChain = TARGET_CHAIN_ID === 2366 ? kiteAI : kiteAITestnet;

export function ChainGuard({ children }: { children: React.ReactNode }) {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  if (!isConnected || chain?.id === TARGET_CHAIN_ID) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon/60 backdrop-blur-sm">
      <div className="mx-4 max-w-sm rounded-xl border border-border bg-parchment p-6 text-center shadow-lg">
        <h2 className="text-lg font-semibold text-carbon">Wrong Network</h2>
        <p className="mt-2 text-sm text-bronze">Please switch to {targetChain.name} to continue.</p>
        <button
          type="button"
          onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
          className="mt-4 rounded-lg bg-gold px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-bronze"
        >
          Switch to {targetChain.name}
        </button>
      </div>
    </div>
  );
}
