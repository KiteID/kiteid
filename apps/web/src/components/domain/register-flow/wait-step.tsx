'use client';

import { CountdownRing } from '@/components/ui/countdown-ring';
import type { CommitmentTimerResult } from '@/hooks/use-commitment-timer';

interface WaitStepProps {
  timer: CommitmentTimerResult;
}

export function WaitStep({ timer }: WaitStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold text-carbon">Waiting Period</h3>
        <p className="text-sm text-bronze">
          A short wait is required to prevent front-running. Please keep this page open.
        </p>
      </div>

      <div className="flex justify-center py-6">
        <CountdownRing
          secondsRemaining={timer.secondsRemaining}
          progress={timer.progress}
          size={140}
        />
      </div>

      <p className="text-center text-xs text-bronze">
        {timer.secondsRemaining > 0
          ? `${timer.secondsRemaining} second${timer.secondsRemaining !== 1 ? 's' : ''} remaining`
          : 'Ready to continue!'}
      </p>
    </div>
  );
}
