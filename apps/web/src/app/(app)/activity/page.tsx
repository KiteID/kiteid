'use client';

import { type ActivityEvent, useActivityFeed, useDomainStats } from '@kiteid/sdk';
import { Card, CardContent, Skeleton } from '@kiteid/ui';

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function eventLabel(type: string): string {
  switch (type) {
    case 'NameRegistered':
      return 'Registered';
    case 'NameRenewed':
      return 'Renewed';
    case 'Transfer':
      return 'Transferred';
    case 'AddrChanged':
      return 'Address Updated';
    case 'TextChanged':
      return 'Text Record Updated';
    case 'ContenthashChanged':
      return 'Content Hash Updated';
    default:
      return type;
  }
}

function eventColor(type: string): string {
  switch (type) {
    case 'NameRegistered':
      return 'text-emerald-600';
    case 'NameRenewed':
      return 'text-blue-600';
    case 'Transfer':
      return 'text-purple-600';
    default:
      return 'text-bronze';
  }
}

function EventRow({ event }: { event: ActivityEvent }) {
  const date = new Date(Number(event.timestamp) * 1000);

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${eventColor(event.eventType)}`}>
            {eventLabel(event.eventType)}
          </span>
          {event.name && (
            <span className="font-medium text-carbon">
              {event.name}
              <span className="text-gold">.kite</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-bronze">
          <span>{truncateAddress(event.actor)}</span>
          {event.priceKite && <span>{event.priceKite} KITE</span>}
          <span>{date.toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ActivityPage() {
  const { events, isLoading } = useActivityFeed(50);
  const { stats } = useDomainStats();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-2xl font-semibold text-carbon">Activity</h1>
      <p className="mb-8 text-sm text-bronze">Recent on-chain events across all .kite domains.</p>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gold">{stats.totalDomains}</p>
            <p className="text-xs text-bronze">Total Domains</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.activeDomains}</p>
            <p className="text-xs text-bronze">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-bronze">{stats.expiredDomains}</p>
            <p className="text-xs text-bronze">Expired</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <Skeleton key={i} className="h-16 w-full" />
          ))
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-bronze">No activity yet. Register a domain to get started!</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => <EventRow key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}
