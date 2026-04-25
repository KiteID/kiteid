'use client';

import { formatKitePriceWithSymbol } from '@kiteid/sdk';
import { Skeleton } from '@kiteid/ui';

interface PriceSummaryProps {
  base: bigint;
  premium: bigint;
  duration: bigint;
  isLoading: boolean;
}

export function PriceSummary({ base, premium, isLoading }: PriceSummaryProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 rounded-lg border border-border bg-cream p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-40" />
      </div>
    );
  }

  const total = base + premium;
  const hasPremium = premium > 0n;

  return (
    <div className="space-y-2 rounded-lg border border-border bg-cream p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-bronze">Base price</span>
        <span className="text-carbon">{formatKitePriceWithSymbol(base)}</span>
      </div>

      {hasPremium && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-bronze">Temporary premium</span>
          <span className="text-warning">{formatKitePriceWithSymbol(premium)}</span>
        </div>
      )}

      <div className="border-t border-border pt-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-carbon">Total</span>
          <span className="text-lg font-semibold text-carbon">
            {formatKitePriceWithSymbol(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
