'use client';

import { isValidName, normalizeLabel } from '@kiteid/sdk';
import { Input } from '@kiteid/ui';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

interface SearchBarProps {
  defaultValue?: string;
  autoFocus?: boolean;
  size?: 'default' | 'lg';
}

export function SearchBar({
  defaultValue = '',
  autoFocus = false,
  size = 'default',
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string>();
  const router = useRouter();

  const handleSearch = useCallback(() => {
    const label = normalizeLabel(value);
    if (!label) return;

    const result = isValidName(label);
    if (!result.valid) {
      setError(result.error);
      return;
    }

    setError(undefined);
    router.push(`/search?name=${encodeURIComponent(label)}`);
  }, [value, router]);

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(undefined);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for a .kite name"
            autoFocus={autoFocus}
            className={
              size === 'lg'
                ? 'h-14 rounded-xl border-sand-core bg-white px-5 text-lg shadow-sm focus-visible:ring-gold'
                : undefined
            }
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-bronze">
            .kite
          </span>
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className={`shrink-0 rounded-xl bg-gold font-medium text-cream transition-colors hover:bg-bronze ${
            size === 'lg' ? 'h-14 px-8 text-base' : 'h-10 px-5 text-sm'
          }`}
        >
          Search
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
