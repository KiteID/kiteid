'use client';

import { cn } from '@kiteid/ui';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  labels: [string, string, string];
}

export function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {labels.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  isCompleted && 'bg-gold text-cream',
                  isActive &&
                    'bg-gold text-cream ring-2 ring-gold/30 ring-offset-2 ring-offset-parchment',
                  !isActive && !isCompleted && 'bg-sand-pale text-bronze',
                )}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Completed</title>
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isActive || isCompleted ? 'text-carbon' : 'text-bronze',
                )}
              >
                {label}
              </span>
            </div>

            {/* Connecting line */}
            {step < 3 && (
              <div
                className={cn(
                  'mx-2 mt-[-1.25rem] h-0.5 flex-1',
                  isCompleted ? 'bg-gold' : 'bg-sand-pale',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
