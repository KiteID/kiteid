'use client';

import { Button } from '@kiteid/ui';
import { TxStatus } from '@/components/domain/tx-status';
import type { RegistrationState } from '@/stores/registration.types';

interface CommitStepProps {
  onSubmit: () => void;
  isPending: boolean;
  commitTxHash?: string;
  state: RegistrationState;
}

export function CommitStep({ onSubmit, isPending, commitTxHash, state }: CommitStepProps) {
  const isWaitingWallet = state === 'committing' && !commitTxHash;
  const isConfirming = state === 'commit_pending' || (state === 'committing' && !!commitTxHash);
  const showButton = state === 'commit_ready' && !isPending;

  const txStatus = isConfirming ? 'confirming' : isWaitingWallet || isPending ? 'pending' : 'idle';

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold text-carbon">Request to Register</h3>
        <p className="text-sm text-bronze">
          This transaction reserves your name on-chain. A 60-second wait is required before the
          final registration to prevent front-running.
        </p>
      </div>

      {(isWaitingWallet || isConfirming || isPending) && (
        <div className="flex justify-center py-4">
          <TxStatus status={txStatus} hash={commitTxHash} />
        </div>
      )}

      {showButton && (
        <Button
          type="button"
          size="lg"
          className="w-full bg-gold text-cream hover:bg-bronze"
          onClick={onSubmit}
        >
          Request to Register
        </Button>
      )}

      {isWaitingWallet && (
        <p className="text-center text-xs text-bronze">
          Please confirm the transaction in your wallet.
        </p>
      )}
    </div>
  );
}
