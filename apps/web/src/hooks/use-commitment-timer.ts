'use client';

import { useCallback, useEffect, useState } from 'react';
import { COMMITMENT_MAX_AGE, COMMITMENT_MIN_AGE } from '@/lib/constants';

export interface CommitmentTimerResult {
  secondsRemaining: number;
  isReady: boolean;
  isExpired: boolean;
  progress: number; // 0 to 1
}

export function useCommitmentTimer(commitTimestamp: number | undefined): CommitmentTimerResult {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const recalculate = useCallback(() => {
    setNow(Math.floor(Date.now() / 1000));
  }, []);

  useEffect(() => {
    if (!commitTimestamp) return;

    const interval = setInterval(recalculate, 1000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        recalculate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [commitTimestamp, recalculate]);

  if (!commitTimestamp) {
    return { secondsRemaining: COMMITMENT_MIN_AGE, isReady: false, isExpired: false, progress: 0 };
  }

  const elapsed = now - commitTimestamp;
  const secondsRemaining = Math.max(0, COMMITMENT_MIN_AGE - elapsed);
  const isReady = elapsed >= COMMITMENT_MIN_AGE && elapsed < COMMITMENT_MAX_AGE;
  const isExpired = elapsed >= COMMITMENT_MAX_AGE;
  const progress = Math.min(1, elapsed / COMMITMENT_MIN_AGE);

  return { secondsRemaining, isReady, isExpired, progress };
}
