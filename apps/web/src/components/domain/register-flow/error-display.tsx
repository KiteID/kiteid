'use client';

import { AlertCircle } from 'lucide-react';
import { MagneticButton } from '@/components/motion';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700">
          <AlertCircle className="h-6 w-6" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-2xl text-carbon">Something went wrong</h3>
          <p className="max-w-md text-sm text-bronze">{message}</p>
        </div>
      </div>

      <MagneticButton
        type="button"
        onClick={onRetry}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold text-base font-semibold text-cream shadow-kid-md transition-shadow hover:shadow-kid-glow"
      >
        Try again
      </MagneticButton>
    </div>
  );
}
