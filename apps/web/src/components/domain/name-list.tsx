'use client';

import { Button, Card, CardContent, Skeleton } from '@kiteid/ui';
import Link from 'next/link';
import { useNameDetails } from '@/hooks/use-name-details';
import { ExpiryBadge } from './expiry-badge';

interface NameListItemProps {
  name: string;
}

function NameListItem({ name }: NameListItemProps) {
  const { daysLeft, isLoading } = useNameDetails(name);

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
              <ExpiryBadge daysLeft={daysLeft} isLoading={isLoading} />
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link href={`/names/${encodeURIComponent(name)}`}>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </Link>
            <Link href={`/names/${encodeURIComponent(name)}?renew=true`}>
              <Button size="sm" className="bg-gold text-cream hover:bg-bronze">
                Renew
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface NameListProps {
  names: string[];
  isLoading: boolean;
}

export function NameList({ names, isLoading }: NameListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (names.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-lg font-medium text-carbon">No domains yet</p>
          <p className="mt-2 text-sm text-bronze">
            Search and register your first .kite domain to get started.
          </p>
          <div className="mt-6">
            <Link href="/search">
              <Button className="bg-gold text-cream hover:bg-bronze">Search Names</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {names.map((name) => (
        <NameListItem key={name} name={name} />
      ))}
    </div>
  );
}
