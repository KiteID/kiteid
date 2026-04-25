'use client';

import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4;
  labels: [string, string, string, string];
}

export function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
  return (
    <div className="flex w-full items-start">
      {labels.map((label, index) => {
        const step = (index + 1) as 1 | 2 | 3 | 4;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const isUpcoming = step > currentStep;

        return (
          <div key={label} className="flex flex-1 items-start">
            {/* Step marker + label stack */}
            <div className="flex min-w-[60px] flex-col items-center gap-2">
              <motion.div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  isCompleted && 'bg-gold text-cream',
                  isActive && 'bg-gold text-cream shadow-kid-glow',
                  isUpcoming && 'border border-sand-core bg-cream text-bronze',
                )}
                animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 1.6, repeat: isActive ? Infinity : 0 }}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : step}
              </motion.div>
              <span
                className={cn(
                  'whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em]',
                  isActive && 'text-carbon',
                  isCompleted && 'text-carbon',
                  isUpcoming && 'text-bronze',
                )}
              >
                {label}
              </span>
            </div>

            {/* Connecting line */}
            {step < 4 && (
              <div className="relative mx-1 mt-4 h-0.5 flex-1 overflow-hidden rounded-full bg-sand-core">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gold"
                  initial={false}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
