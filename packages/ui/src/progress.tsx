import type { HTMLAttributes } from 'react';
import { cn } from './cn';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
}

function Progress({ value, className, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-sand-pale', className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-gold transition-all duration-300 ease-in-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export type { ProgressProps };
export { Progress };
