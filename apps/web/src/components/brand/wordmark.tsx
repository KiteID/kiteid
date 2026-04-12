'use client';

import { cn } from '@kiteid/ui';

interface WordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export function Wordmark({ className, size = 'md' }: WordmarkProps) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline font-sans tracking-tight text-gold',
        SIZES[size],
        className,
      )}
    >
      <span className="font-normal">Kite</span>
      <span className="font-extrabold">ID</span>
    </span>
  );
}
