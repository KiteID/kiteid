'use client';

import { cn } from '@kiteid/ui';

type TxStatusType = 'idle' | 'pending' | 'confirming' | 'confirmed' | 'error';

interface TxStatusProps {
  status: TxStatusType;
  hash?: string;
  errorMessage?: string;
}

const EXPLORER_URL = 'https://testnet.kitescan.ai';

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Loading</title>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-75"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Confirmed</title>
      <path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <title>Error</title>
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const statusConfig: Record<TxStatusType, { label: string; color: string }> = {
  idle: { label: 'Waiting', color: 'text-bronze' },
  pending: { label: 'Sending transaction...', color: 'text-gold' },
  confirming: { label: 'Confirming...', color: 'text-gold' },
  confirmed: { label: 'Confirmed', color: 'text-success' },
  error: { label: 'Failed', color: 'text-destructive' },
};

export function TxStatus({ status, hash, errorMessage }: TxStatusProps) {
  const config = statusConfig[status];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        {(status === 'pending' || status === 'confirming') && (
          <SpinnerIcon className="h-5 w-5 text-gold" />
        )}
        {status === 'confirmed' && <CheckIcon className="h-5 w-5 text-success" />}
        {status === 'error' && <XIcon className="h-5 w-5 text-destructive" />}
        <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
      </div>

      {hash && (
        <a
          href={`${EXPLORER_URL}/tx/${hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-bronze underline-offset-2 hover:underline"
        >
          View on KiteScan
        </a>
      )}

      {status === 'error' && errorMessage && (
        <p className="text-center text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
