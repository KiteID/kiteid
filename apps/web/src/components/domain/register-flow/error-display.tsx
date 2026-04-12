'use client';

import { Button } from '@kiteid/ui';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <svg
            className="h-6 w-6 text-destructive"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Error</title>
            <path
              d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="space-y-1 text-center">
          <h3 className="text-lg font-semibold text-carbon">Something went wrong</h3>
          <p className="text-sm text-bronze">{message}</p>
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full bg-gold text-cream hover:bg-bronze"
        onClick={onRetry}
      >
        Try Again
      </Button>
    </div>
  );
}
