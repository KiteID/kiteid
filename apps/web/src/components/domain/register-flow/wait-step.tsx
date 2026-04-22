'use client';

import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { CopyAddress } from '@/components/ui/copy-address';
import type { CommitmentTimerResult } from '@/hooks/use-commitment-timer';

interface WaitStepProps {
  timer: CommitmentTimerResult;
  commitTxHash?: string;
}

const EXPLORER_URL = 'https://testnet.kitescan.ai';
const RING_SIZE = 200;
const STROKE_WIDTH = 8;

export function WaitStep({ timer, commitTxHash }: WaitStepProps) {
  const radius = (RING_SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, timer.progress));
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bronze">
          Step 3 of 4
        </span>
        <h3 className="font-display text-3xl text-carbon">Settling commitment</h3>
      </div>

      {/* Big countdown ring */}
      <div className="flex justify-center">
        <div
          className="relative flex items-center justify-center"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="-rotate-90"
            role="img"
            aria-label={`${timer.secondsRemaining} seconds remaining until registration`}
          >
            <title>Commitment countdown</title>
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={STROKE_WIDTH}
              className="text-sand-core"
            />
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={radius}
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1, ease: 'linear' }}
            />
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a87c52" />
                <stop offset="50%" stopColor="#c9986a" />
                <stop offset="100%" stopColor="#e8b987" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="font-display text-6xl leading-none tabular-nums text-carbon">
              {timer.secondsRemaining}
            </span>
            <span className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-bronze">
              {timer.secondsRemaining === 1 ? 'second left' : 'seconds left'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar variant */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-sand-core">
        <motion.div
          className="h-full bg-gradient-gold"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      <p className="text-center font-display italic text-bronze">
        The network needs a moment to secure your commitment.
      </p>

      {/* Commit tx details */}
      {commitTxHash && (
        <div className="rounded-xl border border-sand-core bg-parchment/50 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone">
              Commit TX
            </span>
            <div className="flex items-center gap-2">
              <CopyAddress value={commitTxHash} label="Transaction hash copied" />
              <a
                href={`${EXPLORER_URL}/tx/${commitTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-bronze hover:bg-sand-pale hover:text-carbon"
                aria-label="View commit transaction on Kite explorer (opens in new tab)"
              >
                Explorer
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
