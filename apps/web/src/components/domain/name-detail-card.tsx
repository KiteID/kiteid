'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@kiteid/ui';
import { ExpiryBadge } from './expiry-badge';

interface NameDetailCardProps {
  name: string;
  owner: `0x${string}` | undefined;
  resolver: `0x${string}` | undefined;
  expiryTimestamp: number | undefined;
  daysLeft: number | undefined;
  isExpired: boolean;
  isLoading: boolean;
  onRenew: () => void;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatExpiryDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function NameDetailCard({
  name,
  owner,
  resolver,
  expiryTimestamp,
  daysLeft,
  isExpired,
  isLoading,
  onRenew,
}: NameDetailCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-carbon">
            {name}
            <span className="text-gold">.kite</span>
          </CardTitle>
          <ExpiryBadge daysLeft={daysLeft} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-bronze">Owner</p>
            <p className="font-mono text-sm text-carbon">
              {owner ? truncateAddress(owner) : 'Unknown'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-bronze">Resolver</p>
            <p className="font-mono text-sm text-carbon">
              {resolver ? truncateAddress(resolver) : 'Not set'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-bronze">Expiry Date</p>
            <p className="text-sm text-carbon">
              {expiryTimestamp ? formatExpiryDate(expiryTimestamp) : 'Unknown'}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-bronze">Status</p>
            <p className="text-sm text-carbon">{isExpired ? 'Expired' : 'Active'}</p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-border pt-6">
          <Button onClick={onRenew} className="bg-gold text-cream hover:bg-bronze">
            Renew Domain
          </Button>
          <Button variant="outline" disabled>
            Manage Records
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
