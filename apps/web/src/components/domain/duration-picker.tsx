'use client';

import { Button, cn } from '@kiteid/ui';
import { MAX_REGISTRATION_YEARS, MIN_REGISTRATION_YEARS } from '@/lib/constants';

const QUICK_DURATIONS = [1, 2, 5, 10] as const;

interface DurationPickerProps {
  value: number;
  onChange: (years: number) => void;
}

export function DurationPicker({ value, onChange }: DurationPickerProps) {
  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-carbon">Registration Duration</span>
      <div className="flex flex-wrap gap-2">
        {QUICK_DURATIONS.map((years) => (
          <Button
            key={years}
            type="button"
            variant={value === years ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(years)}
            disabled={years < MIN_REGISTRATION_YEARS || years > MAX_REGISTRATION_YEARS}
            className={cn(
              'min-w-[4.5rem]',
              value === years && 'bg-gold text-cream hover:bg-bronze',
            )}
          >
            {years} {years === 1 ? 'year' : 'years'}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={MIN_REGISTRATION_YEARS}
          max={MAX_REGISTRATION_YEARS}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-sand-pale accent-gold"
        />
        <span className="min-w-[3.5rem] text-right text-sm tabular-nums text-bronze">
          {value} {value === 1 ? 'year' : 'years'}
        </span>
      </div>
    </div>
  );
}
