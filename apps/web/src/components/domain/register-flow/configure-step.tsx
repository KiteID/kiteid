'use client';

import { formatKitePriceWithSymbol, useKiteRentPrice, yearsToSeconds } from '@kiteid/sdk';
import { Button } from '@kiteid/ui';
import { useState } from 'react';
import { useChainId } from 'wagmi';
import { DurationPicker } from '@/components/domain/duration-picker';
import { PriceSummary } from '@/components/domain/price-summary';

interface ConfigureStepProps {
  name: string;
  onContinue: (years: number, reverseRecord: boolean) => void;
}

export function ConfigureStep({ name, onContinue }: ConfigureStepProps) {
  const [years, setYears] = useState(1);
  const [reverseRecord, setReverseRecord] = useState(true);
  const chainId = useChainId();

  const duration = yearsToSeconds(years);
  const price = useKiteRentPrice(name, duration, chainId);

  const base = price.data?.base ?? 0n;
  const premium = price.data?.premium ?? 0n;
  const total = base + premium;

  return (
    <div className="space-y-6">
      <DurationPicker value={years} onChange={setYears} />

      <PriceSummary base={base} premium={premium} duration={duration} isLoading={price.isLoading} />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={reverseRecord}
          onChange={(e) => setReverseRecord(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-gold"
        />
        <div>
          <span className="text-sm font-medium text-carbon">Set as primary name</span>
          <p className="text-xs text-bronze">
            Your address will resolve to {name}.kite when looked up.
          </p>
        </div>
      </label>

      <Button
        type="button"
        size="lg"
        className="w-full bg-gold text-cream hover:bg-bronze"
        disabled={price.isLoading || !price.data}
        onClick={() => onContinue(years, reverseRecord)}
      >
        {price.isLoading ? 'Loading price...' : `Continue — ${formatKitePriceWithSymbol(total)}`}
      </Button>
    </div>
  );
}
