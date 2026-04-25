'use client';

import { Check, Copy } from 'lucide-react';
import { useCopy } from '@/hooks/use-copy';
import { cn } from '@/lib/cn';

interface CopyAddressProps {
  value: string;
  label?: string;
  truncate?: boolean;
  className?: string;
}

function truncate(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function CopyAddress({
  value,
  label,
  truncate: shouldTruncate = true,
  className,
}: CopyAddressProps) {
  const { copy, copied } = useCopy();

  return (
    <button
      type="button"
      onClick={() => copy(value, label ?? 'Address copied')}
      className={cn(
        'group inline-flex items-center gap-2 rounded-md px-2 py-1 font-mono text-xs text-stone transition-colors hover:bg-sand-pale hover:text-carbon',
        className,
      )}
    >
      <span>{shouldTruncate ? truncate(value) : value}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-gold" strokeWidth={2} />
      ) : (
        <Copy
          className="h-3.5 w-3.5 text-bronze opacity-60 transition-opacity group-hover:opacity-100"
          strokeWidth={1.5}
        />
      )}
    </button>
  );
}
