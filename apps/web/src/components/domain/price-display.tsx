import { formatKitePriceWithSymbol } from '@kiteid/sdk';

interface PriceDisplayProps {
  base: bigint;
  premium: bigint;
}

export function PriceDisplay({ base, premium }: PriceDisplayProps) {
  const total = base + premium;
  const hasPremium = premium > 0n;

  return (
    <div className="space-y-1">
      {hasPremium && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-bronze">Base price</span>
          <span className="text-carbon">{formatKitePriceWithSymbol(base)}</span>
        </div>
      )}
      {hasPremium && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-bronze">Premium</span>
          <span className="text-warning">{formatKitePriceWithSymbol(premium)}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="font-medium text-carbon">{hasPremium ? 'Total' : 'Price'}</span>
        <span className="text-lg font-semibold text-carbon">
          {formatKitePriceWithSymbol(total)}
        </span>
      </div>
    </div>
  );
}
