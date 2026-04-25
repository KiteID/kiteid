'use client';

import { formatKitePriceWithSymbol } from '@kiteid/sdk';
import { Sparkles } from 'lucide-react';
import { MagneticButton } from '@/components/motion';
import { TLD } from '@/lib/constants';
import { RegistrationState } from '@/stores/registration.types';

interface RegisterStepProps {
  onSubmit: () => void;
  isPending: boolean;
  price?: { base: bigint; premium: bigint };
  state: RegistrationState;
  name: string;
}

export function RegisterStep({ onSubmit, isPending, price, state, name }: RegisterStepProps) {
  const isSubmitting = state === RegistrationState.REGISTERING || isPending;
  const isConfirming = state === RegistrationState.REGISTER_PENDING;
  const isReady = state === RegistrationState.READY_TO_REGISTER && !isPending;
  const total = price ? price.base + price.premium : 0n;
  const hasPremium = price ? price.premium > 0n : false;
  // Toast feedback is centralized in use-register-flow.

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bronze">
            Step 4 of 4
          </span>
        </div>
        <h3 className="font-display text-3xl text-carbon">You&apos;re ready. Sign to finalize.</h3>
        <p className="max-w-xl text-sm leading-relaxed text-bronze">
          This transaction registers {name}
          {TLD} as an NFT in your wallet. You&apos;ll pay the annual fee now.
        </p>
      </div>

      {/* Price summary (compact) */}
      {price && (
        <div className="space-y-2 rounded-xl border border-sand-core bg-sand-pale/60 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-bronze">Base</span>
            <span className="font-mono text-carbon">{formatKitePriceWithSymbol(price.base)}</span>
          </div>
          {hasPremium && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-800">Premium</span>
              <span className="font-mono text-amber-900">
                {formatKitePriceWithSymbol(price.premium)}
              </span>
            </div>
          )}
          <div className="editorial-rule" />
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-[0.18em] text-bronze">Total</span>
            <span className="font-display text-2xl font-semibold text-gradient-gold">
              {formatKitePriceWithSymbol(total)}
            </span>
          </div>
        </div>
      )}

      {/* TX status card */}
      {(isSubmitting || isConfirming) && (
        <div className="rounded-xl border border-sand-core bg-parchment/50 p-5">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-gold pulse-dot" />
            <span className="text-sm font-medium text-carbon">
              {isConfirming ? 'Finalizing on-chain…' : 'Waiting for wallet signature…'}
            </span>
          </div>
        </div>
      )}

      {/* CTA */}
      {isReady && (
        <MagneticButton
          type="button"
          onClick={onSubmit}
          disabled={!price}
          className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold text-base font-semibold text-cream shadow-kid-md transition-shadow hover:shadow-kid-glow disabled:cursor-not-allowed disabled:opacity-50"
        >
          Pay {price ? formatKitePriceWithSymbol(total) : '…'} and register
        </MagneticButton>
      )}

      {isSubmitting && !isConfirming && (
        <p className="text-center text-xs text-bronze">
          Please confirm the transaction in your wallet.
        </p>
      )}
      {isConfirming && (
        <p className="text-center text-xs italic text-bronze font-display">
          Minting your record — one more block.
        </p>
      )}
    </div>
  );
}
