'use client';

import { kiteAITestnet } from '@kiteid/sdk';
import { Button } from '@kiteid/ui';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';

const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? '2368');

export function NetworkBanner() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  // Only show if connected and on wrong chain
  if (!isConnected || chainId === TARGET_CHAIN_ID) return null;

  const targetName = TARGET_CHAIN_ID === kiteAITestnet.id ? 'Kite AI Testnet' : 'Kite AI';

  return (
    <div className="border-b border-warning bg-warning/10 px-4 py-2 text-center text-sm">
      <span className="font-medium text-warning">Yanlış ağdasınız. </span>
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-warning underline"
        onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
      >
        {targetName}&apos;e geçin
      </Button>
    </div>
  );
}
