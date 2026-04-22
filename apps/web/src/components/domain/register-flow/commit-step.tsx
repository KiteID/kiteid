'use client';

import { ExternalLink, Lock } from 'lucide-react';
import { MagneticButton } from '@/components/motion';
import { CopyAddress } from '@/components/ui/copy-address';
import { RegistrationState } from '@/stores/registration.types';

interface CommitStepProps {
  onSubmit: () => void;
  isPending: boolean;
  commitTxHash?: string;
  state: RegistrationState;
}

const EXPLORER_URL = 'https://testnet.kitescan.ai';

export function CommitStep({ onSubmit, isPending, commitTxHash, state }: CommitStepProps) {
  const isWaitingWallet = state === RegistrationState.COMMITTING && !commitTxHash;
  const isConfirming =
    state === RegistrationState.COMMIT_PENDING ||
    (state === RegistrationState.COMMITTING && !!commitTxHash);
  const isReady = state === RegistrationState.COMMIT_READY && !isPending;
  // Toast feedback is centralized in use-register-flow to keep a single
  // toast per flow (prevents stacking across step remounts).

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bronze">
            Step 2 of 4
          </span>
        </div>
        <h3 className="font-display text-3xl text-carbon">Commit your name</h3>
        <p className="max-w-xl text-sm leading-relaxed text-bronze">
          We&apos;re creating a cryptographic commitment. You&apos;ll sign one transaction now.
          After that, wait 60 seconds. This prevents anyone from front-running your registration.
        </p>
      </div>

      {/* TX status card */}
      <div className="rounded-xl border border-sand-core bg-parchment/50 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isWaitingWallet && (
              <>
                <span className="h-2 w-2 rounded-full bg-gold pulse-dot" />
                <span className="text-sm font-medium text-carbon">
                  Waiting for wallet signature…
                </span>
              </>
            )}
            {isConfirming && (
              <>
                <span className="h-2 w-2 rounded-full bg-gold pulse-dot" />
                <span className="text-sm font-medium text-carbon">Confirming on Kite network…</span>
              </>
            )}
            {isReady && (
              <>
                <span className="h-2 w-2 rounded-full bg-bronze/40" />
                <span className="text-sm font-medium text-bronze">Ready to sign</span>
              </>
            )}
          </div>
          {commitTxHash && (
            <a
              href={`${EXPLORER_URL}/tx/${commitTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-bronze hover:text-carbon"
              aria-label="View commit transaction on Kite explorer (opens in new tab)"
            >
              Explorer
              <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
            </a>
          )}
        </div>
        {commitTxHash && (
          <div className="mt-3 border-t border-sand-core pt-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
                TX hash
              </span>
              <CopyAddress value={commitTxHash} label="Transaction hash copied" />
            </div>
          </div>
        )}
      </div>

      {/* Primary CTA */}
      {isReady && (
        <MagneticButton
          type="button"
          onClick={onSubmit}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold text-base font-semibold text-cream shadow-kid-md transition-shadow hover:shadow-kid-glow"
        >
          Sign commit
        </MagneticButton>
      )}

      {isWaitingWallet && (
        <p className="text-center text-xs text-bronze">
          Confirm the transaction in your wallet to continue.
        </p>
      )}

      {isConfirming && (
        <p className="text-center text-xs text-bronze italic font-display">
          Almost there — the commitment is being sealed on-chain.
        </p>
      )}
    </div>
  );
}
