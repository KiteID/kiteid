'use client';

import { useQuery } from '@tanstack/react-query';
import { CopyAddress } from '@/components/ui/copy-address';

interface WrapStatusProps {
  node: string;
  txHash: string;
}

export function WrapStatus({ node, txHash }: WrapStatusProps) {
  const { data: wrapped } = useQuery({
    queryKey: ['wrap-status', node],
    queryFn: async () => {
      const res = await fetch(`/api/v2/wrap/status/${node}`);
      if (!res.ok) throw new Error('Failed to fetch status');
      return res.json();
    },
    refetchInterval: 2000,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
        <div className="flex items-start gap-3">
          <div className="text-green-600 dark:text-green-400 mt-0.5">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-900 dark:text-green-100">
              Name Wrapped Successfully
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your name is now wrapped with enhanced permissions and features.
            </p>
          </div>
        </div>
      </div>

      {wrapped && (
        <div className="rounded-lg bg-stone-50 dark:bg-stone-900 p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-stone-600 dark:text-stone-400">Status</span>
            <span className="font-medium">
              {wrapped.wrapped ? 'Wrapped (V2)' : 'Unwrapped (V1)'}
            </span>
          </div>
          {wrapped.owner && (
            <div className="flex justify-between items-center">
              <span className="text-stone-600 dark:text-stone-400">Owner</span>
              <CopyAddress value={wrapped.owner} />
            </div>
          )}
          {wrapped.wrappedAt && (
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-400">Wrapped At</span>
              <span className="text-xs font-mono">
                {new Date(wrapped.wrappedAt).toLocaleString()}
              </span>
            </div>
          )}
          {wrapped.expiry && (
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-400">Expires</span>
              <span className="text-xs font-mono">
                {new Date(wrapped.expiry * 1000).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-stone-200 dark:border-stone-700 p-4">
        <p className="text-xs text-stone-600 dark:text-stone-400 mb-2">Transaction Hash</p>
        <CopyAddress value={txHash} />
      </div>
    </div>
  );
}
