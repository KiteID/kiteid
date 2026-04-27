'use client';

import { formatKitePriceWithSymbol, useKiteRentPrice, yearsToSeconds } from '@kiteid/sdk';
import { ArrowRight, ExternalLink, Info } from 'lucide-react';
import { useState } from 'react';
import { useChainId } from 'wagmi';
import { MagneticButton } from '@/components/motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';

const TESTNET_CHAIN_ID = 2368;

function FaucetBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3.5 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" strokeWidth={1.5} />
      <div>
        <span className="font-medium text-amber-900">Need testnet KITE?</span>
        <span className="ml-1 text-amber-800">
          The faucet drips 0.5 KITE per request. A 5+ character name costs 5 KITE/yr — request 10×
          or use multiple addresses.
        </span>
        <a
          href="https://faucet.gokite.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 inline-flex items-center gap-1 font-medium text-amber-700 underline-offset-2 hover:underline"
        >
          Get KITE <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

interface ConfigureStepProps {
  name: string;
  onContinue: (years: number, reverseRecord: boolean) => void;
}

const DURATION_OPTIONS = [1, 2, 5] as const;

export function ConfigureStep({ name, onContinue }: ConfigureStepProps) {
  const [years, setYears] = useState<number>(1);
  const [reverseRecord, setReverseRecord] = useState(true);
  const chainId = useChainId();

  const duration = yearsToSeconds(years);
  const price = useKiteRentPrice(name, duration, chainId);

  const base = price.data?.base ?? 0n;
  const premium = price.data?.premium ?? 0n;
  const hasPremium = premium > 0n;
  const total = base + premium;

  const isTestnet = chainId === TESTNET_CHAIN_ID;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-8">
        {isTestnet && <FaucetBanner />}

        {/* Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bronze">
              How long?
            </span>
            <span className="text-xs text-stone">Registration length</span>
          </div>
          <div className="inline-flex gap-2 rounded-xl border border-sand-core bg-parchment p-1">
            {DURATION_OPTIONS.map((y) => {
              const active = years === y;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYears(y)}
                  className={cn(
                    'flex h-10 min-w-[70px] items-center justify-center rounded-lg px-4 text-sm font-semibold transition-all',
                    active ? 'bg-gold text-cream shadow-kid-sm' : 'text-carbon hover:bg-cream',
                  )}
                >
                  {y} {y === 1 ? 'year' : 'years'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reverse record toggle */}
        <div className="flex items-center justify-between rounded-xl border border-sand-core bg-parchment/60 px-4 py-4">
          <div className="flex items-start gap-2 pr-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-carbon">Set as primary .kite name</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-bronze/70 hover:text-bronze">
                      <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[240px]">
                    So others can find you by {name}.kite instead of 0x… on Kite apps.
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="mt-1 text-xs text-bronze">Your address will resolve to {name}.kite.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={reverseRecord}
            onClick={() => setReverseRecord((v) => !v)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
              reverseRecord ? 'bg-gold' : 'bg-sand-core',
            )}
          >
            <span
              className={cn(
                'inline-block h-5 w-5 transform rounded-full bg-cream shadow-kid-sm transition-transform',
                reverseRecord ? 'translate-x-[22px]' : 'translate-x-0.5',
              )}
            />
          </button>
        </div>

        {/* Price summary */}
        <div className="space-y-3 rounded-xl border border-sand-core bg-sand-pale/60 p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-bronze">Base · {years}× annual</span>
            <span className="font-mono text-carbon">
              {price.isLoading ? '—' : formatKitePriceWithSymbol(base)}
            </span>
          </div>
          {hasPremium && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-amber-800">
                Premium
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-amber-700/70 hover:text-amber-800">
                      <Info className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[260px]">
                    Dutch-auction premium — decays to zero over 14 days.
                  </TooltipContent>
                </Tooltip>
              </span>
              <span className="font-mono text-amber-900">{formatKitePriceWithSymbol(premium)}</span>
            </div>
          )}
          <div className="flex items-center justify-between font-mono text-[11px] text-stone">
            <span>Gas (est.)</span>
            <span>~0.01 KITE</span>
          </div>
          <div className="editorial-rule" />
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-[0.18em] text-bronze">Total</span>
            <span className="font-display text-2xl font-semibold text-gradient-gold">
              {price.isLoading ? '…' : formatKitePriceWithSymbol(total)}
            </span>
          </div>
        </div>

        {/* CTA */}
        <MagneticButton
          type="button"
          disabled={price.isLoading || !price.data}
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold text-base font-semibold text-cream shadow-kid-md transition-shadow hover:shadow-kid-glow disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onContinue(years, reverseRecord)}
        >
          {price.isLoading ? 'Loading price…' : 'Commit registration'}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            strokeWidth={2}
          />
        </MagneticButton>
      </div>
    </TooltipProvider>
  );
}
