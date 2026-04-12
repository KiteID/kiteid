'use client';

import { Card, CardContent } from '@kiteid/ui';
import Link from 'next/link';
import { AvailabilityBadge } from './availability-badge';
import { PriceDisplay } from './price-display';

interface NameCardProps {
  name: string;
  isAvailable: boolean | undefined;
  isReserved: boolean | undefined;
  isLoading: boolean;
  price?: { base: bigint; premium: bigint };
}

export function NameCard({ name, isAvailable, isReserved, isLoading, price }: NameCardProps) {
  const status = isLoading
    ? 'loading'
    : isReserved
      ? 'reserved'
      : isAvailable
        ? 'available'
        : 'taken';

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xl font-semibold text-carbon">
              {name}
              <span className="text-gold">.kite</span>
            </h3>
            <div className="mt-2">
              <AvailabilityBadge status={status} />
            </div>
          </div>

          <div className="shrink-0 text-right">
            {price && status === 'available' && (
              <PriceDisplay base={price.base} premium={price.premium} />
            )}
          </div>
        </div>

        {status === 'available' && (
          <div className="mt-4">
            <Link
              href={`/register/${encodeURIComponent(name)}`}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-gold px-6 text-sm font-medium text-cream transition-colors hover:bg-bronze"
            >
              Register
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
