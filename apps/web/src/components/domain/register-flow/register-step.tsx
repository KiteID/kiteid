'use client';

import { formatKitePriceWithSymbol } from '@kiteid/sdk';
import { Button } from '@kiteid/ui';
import { TxStatus } from '@/components/domain/tx-status';

interface RegisterStepProps {
  onSubmit: () => void;
  isPending: boolean;
  price?: { base: bigint; premium: bigint };
  state: string;
}

export function RegisterStep({ onSubmit, isPending, price, state }: RegisterStepProps) {
  const isSubmitting = state === 'registering' || isPending;
  const isConfirming = state === 'register_pending';
  const total = price ? price.base + price.premium : 0n;

  const txStatus = isConfirming ? 'confirming' : isSubmitting ? 'pending' : 'idle';

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold text-carbon">Complete Registration</h3>
        <p className="text-sm text-bronze">
          Submit the final transaction to register your name. This will transfer the registration
          fee from your wallet.
        </p>
      </div>

      {price && (
        <div className="rounded-lg border border-border bg-cream p-4 text-center">
          <span className="text-sm text-bronze">Registration cost</span>
          <p className="text-2xl font-semibold text-carbon">{formatKitePriceWithSymbol(total)}</p>
        </div>
      )}

      {(isSubmitting || isConfirming) && (
        <div className="flex justify-center py-4">
          <TxStatus status={txStatus} />
        </div>
      )}

      {!isSubmitting && !isConfirming && (
        <Button
          type="button"
          size="lg"
          className="w-full bg-gold text-cream hover:bg-bronze"
          disabled={isPending || !price}
          onClick={onSubmit}
        >
          {price ? `Pay ${formatKitePriceWithSymbol(total)}` : 'Loading...'}
        </Button>
      )}

      {isSubmitting && (
        <p className="text-center text-xs text-bronze">
          Please confirm the transaction in your wallet.
        </p>
      )}
    </div>
  );
}
