'use client';

import { Button } from '@kiteid/ui';
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { AlertTriangle, ChevronDown, Wallet } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';

interface ConnectButtonProps {
  /** Force full-width layout (used in mobile drawer). */
  fullWidth?: boolean;
  className?: string;
}

function initialsFromAddress(address: string): string {
  const clean = address.startsWith('0x') ? address.slice(2) : address;
  return clean.slice(0, 2).toUpperCase();
}

export function ConnectButton({ fullWidth = false, className }: ConnectButtonProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <RainbowConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');

          return (
            <div
              aria-hidden={!ready}
              className={cn(
                !ready && 'pointer-events-none select-none opacity-0',
                fullWidth && 'w-full',
                className,
              )}
            >
              {(() => {
                // State 1: not connected
                if (!connected) {
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          onClick={openConnectModal}
                          className={cn(
                            'bg-gradient-gold text-cream shadow-kid-sm transition-shadow hover:shadow-kid-md',
                            fullWidth && 'w-full',
                          )}
                        >
                          <Wallet className="h-4 w-4" strokeWidth={1.5} />
                          Connect wallet
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open wallet selector</TooltipContent>
                    </Tooltip>
                  );
                }

                // State 2: wrong network
                if (chain.unsupported) {
                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={openChainModal}
                          className={cn(fullWidth && 'w-full')}
                        >
                          <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
                          Wrong network
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Switch to Kite Testnet</TooltipContent>
                    </Tooltip>
                  );
                }

                // State 3: connected
                const label = account.displayName;
                const initials = initialsFromAddress(account.address);

                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={openAccountModal}
                        className={cn(
                          'group inline-flex items-center gap-2 rounded-full border border-sand-core bg-parchment px-3 py-1.5',
                          'text-sm font-medium text-carbon shadow-kid-sm transition-all',
                          'hover:border-gold/50 hover:shadow-kid-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                          fullWidth && 'w-full justify-center',
                        )}
                        aria-label={`Connected as ${label}. Open account menu.`}
                      >
                        <span
                          aria-hidden
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-gold font-mono text-[10px] font-semibold text-cream"
                        >
                          {initials}
                        </span>
                        <span className="max-w-[140px] truncate font-mono text-xs tabular-nums">
                          {label}
                        </span>
                        <ChevronDown
                          className="h-3.5 w-3.5 text-bronze transition-transform group-hover:translate-y-0.5"
                          strokeWidth={1.5}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Open account menu</TooltipContent>
                  </Tooltip>
                );
              })()}
            </div>
          );
        }}
      </RainbowConnectButton.Custom>
    </TooltipProvider>
  );
}
