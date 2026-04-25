'use client';

import { kiteAI } from '@kiteid/sdk';
import { cn } from '@kiteid/ui';
import { useEffect } from 'react';

interface TxToastProps {
  status: 'pending' | 'confirmed' | 'error';
  hash?: string;
  chainId?: number;
  message?: string;
  onClose?: () => void;
}

function getExplorerUrl(hash: string, chainId?: number): string {
  const base = chainId === kiteAI.id ? 'https://kitescan.ai' : 'https://testnet.kitescan.ai';
  return `${base}/tx/${hash}`;
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-gold"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 text-success"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="h-5 w-5 text-destructive"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function TxToast({ status, hash, chainId, message, onClose }: TxToastProps) {
  // Auto-dismiss confirmed toasts after 8 seconds
  useEffect(() => {
    if (status === 'confirmed') {
      const timeout = setTimeout(() => {
        onClose?.();
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [status, onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg',
        status === 'pending' && 'border-gold/30 bg-parchment',
        status === 'confirmed' && 'border-success/30 bg-parchment',
        status === 'error' && 'border-destructive/30 bg-parchment',
      )}
    >
      <div className="mt-0.5 shrink-0">
        {status === 'pending' && <Spinner />}
        {status === 'confirmed' && <CheckIcon />}
        {status === 'error' && <ErrorIcon />}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium',
            status === 'pending' && 'text-carbon',
            status === 'confirmed' && 'text-success',
            status === 'error' && 'text-destructive',
          )}
        >
          {status === 'pending' && 'İşlem onaylanıyor...'}
          {status === 'confirmed' && 'İşlem onaylandı'}
          {status === 'error' && 'İşlem başarısız'}
        </p>

        {status === 'error' && message && <p className="mt-1 text-xs text-bronze">{message}</p>}

        {hash && status !== 'error' && (
          <a
            href={getExplorerUrl(hash, chainId)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs text-gold underline underline-offset-2 hover:text-bronze"
          >
            {hash.slice(0, 10)}...{hash.slice(-8)}
          </a>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md p-1 text-bronze transition-colors hover:text-carbon"
          aria-label="Kapat"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
