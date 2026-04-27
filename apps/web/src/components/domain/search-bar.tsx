'use client';

import { isValidName, normalizeLabel } from '@kiteid/sdk';
import { Input } from '@kiteid/ui';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/cn';

interface SearchBarProps {
  defaultValue?: string;
  autoFocus?: boolean;
  size?: 'default' | 'lg';
  /** Show a spinner and disable inputs while availability is being checked. */
  isChecking?: boolean;
}

export function SearchBar({
  defaultValue = '',
  autoFocus = false,
  size = 'default',
  isChecking = false,
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

  const disableSubmit = !value.trim() || isChecking;

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
            disabled={isChecking}
            aria-label="Search for a .kite name"
            aria-busy={isChecking}
            aria-invalid={Boolean(error)}
            className={
              size === 'lg'
                ? 'h-14 rounded-xl border-sand-core bg-white px-5 pr-16 text-lg shadow-sm focus-visible:ring-gold'
                : 'pr-14'
            }
          />
          <span
            className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-sm font-medium text-carbon/70"
            aria-hidden="true"
          >
            {isChecking && <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />}
            .kite
          </span>
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={disableSubmit}
          className={cn(
            'shrink-0 rounded-xl bg-gold font-medium text-carbon transition-colors hover:bg-bronze hover:text-cream disabled:cursor-not-allowed disabled:opacity-60',
            size === 'lg' ? 'h-14 px-8 text-base' : 'h-10 px-5 text-sm',
          )}
          aria-label="Search"
        >
          {isChecking ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden="true" />
              Checking
            </span>
          ) : (
            'Search'
          )}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
