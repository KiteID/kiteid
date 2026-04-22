'use client';

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { AlertTriangle } from 'lucide-react';
import { useAccount, useChainId } from 'wagmi';
import { cn } from '@/lib/cn';

const TARGET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? '2368');

interface NetworkBannerProps {
  className?: string;
}

export function NetworkBanner({ className }: NetworkBannerProps) {
  const chainId = useChainId();
  const { isConnected } = useAccount();

  // Only show if connected and on wrong chain
  if (!isConnected || chainId === TARGET_CHAIN_ID) return null;

  return (
    <RainbowConnectButton.Custom>
      {({ openChainModal, mounted }) => (
        <div
          role="alert"
          className={cn(
            'flex items-center justify-center gap-3 border-b border-warning/40 bg-warning/10 px-4 py-2 text-sm',
            className,
          )}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" strokeWidth={1.5} aria-hidden />
          <p className="text-warning">
            <span className="font-semibold">Wrong network.</span>{' '}
            <span className="text-warning/90">Switch to Kite Testnet to use KiteID.</span>
          </p>
          <button
            type="button"
            onClick={openChainModal}
            disabled={!mounted}
            className="inline-flex h-7 items-center rounded-md border border-warning/40 bg-cream px-3 text-xs font-medium text-warning transition-colors hover:bg-warning/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning focus-visible:ring-offset-2 disabled:opacity-50"
          >
            Switch
          </button>
        </div>
      )}
    </RainbowConnectButton.Custom>
  );
}
