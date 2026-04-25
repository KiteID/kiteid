'use client';

import { type ActivityEvent, useActivityFeed, useDomainStats } from '@kiteid/sdk';
import { Button, Skeleton } from '@kiteid/ui';
import { Activity, ArrowUpRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnimatedCounter, FadeIn, RevealOnScroll, Stagger, StaggerItem } from '@/components/motion';
import { CopyAddress } from '@/components/ui/copy-address';
import { EmptyState } from '@/components/ui/empty-state';

const EXPLORER_URL = 'https://testnet.kitescan.ai';
const PAGE_SIZE = 20;

function eventLabel(type: string): string {
  switch (type) {
    case 'NameRegistered':
      return 'Registered';
    case 'NameRenewed':
      return 'Renewed';
    case 'Transfer':
      return 'Transferred';
    case 'AddrChanged':
      return 'Address updated';
    case 'TextChanged':
      return 'Text record updated';
    case 'ContenthashChanged':
      return 'Content hash updated';
    case 'ResolverChanged':
      return 'Resolver changed';
    default:
      return type;
  }
}

function eventDotClass(type: string): string {
  switch (type) {
    case 'NameRegistered':
      return 'bg-gold-deep';
    case 'NameRenewed':
      return 'bg-bronze';
    case 'Transfer':
      return 'bg-sand-core';
    case 'AddrChanged':
    case 'TextChanged':
    case 'ContenthashChanged':
    case 'ResolverChanged':
      return 'bg-stone/50';
    default:
      return 'bg-bronze';
  }
}

function relativeTime(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts * 1000) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return `${Math.floor(diffSec / 2592000)}mo ago`;
}

function dayKey(ts: number): string {
  const d = new Date(ts * 1000);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function formatDayHeader(key: string): string {
  const d = new Date(key);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: today.getFullYear() === d.getFullYear() ? undefined : 'numeric',
  });
}

function groupByDay(events: ActivityEvent[]): { day: string; events: ActivityEvent[] }[] {
  const map = new Map<string, ActivityEvent[]>();
  for (const e of events) {
    const key = dayKey(Number(e.timestamp));
    if (!map.has(key)) map.set(key, []);
    map.get(key)?.push(e);
  }
  return Array.from(map.entries()).map(([day, evts]) => ({ day, events: evts }));
}

function EventCard({ event }: { event: ActivityEvent }) {
  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <span
        className={`absolute left-[11px] top-6 h-2.5 w-2.5 -translate-x-1/2 rounded-full ring-4 ring-cream ${eventDotClass(event.eventType)}`}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-3 rounded-xl border border-sand-core bg-cream p-5 shadow-kid-sm transition-shadow hover:shadow-kid-md sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            {event.name ? (
              <p className="truncate font-display text-2xl text-carbon">
                {event.name}
                <span className="text-gold">.kite</span>
              </p>
            ) : (
              <p className="truncate font-display text-2xl text-stone">—</p>
            )}
          </div>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-bronze">
            {eventLabel(event.eventType)} · {relativeTime(Number(event.timestamp))}
            {event.priceKite ? ` · ${event.priceKite} KITE` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CopyAddress value={event.actor} />
          <a
            href={`${EXPLORER_URL}/tx/${event.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1 rounded-md px-2 font-mono text-[11px] text-bronze transition-colors hover:text-carbon"
            aria-label="View transaction on Kite explorer (opens in new tab)"
          >
            tx
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

function ActivityEmpty() {
  return (
    <div className="rounded-2xl border border-sand-core bg-cream p-4 shadow-kid-sm">
      <EmptyState
        icon={Activity}
        title="No activity yet."
        description="Be the first to register a .kite name."
        action={{ label: 'Register a name', href: '/' }}
        className="py-12"
      />
    </div>
  );
}

function LoadingTimeline() {
  return (
    <div className="space-y-6">
      {['sk-1', 'sk-2', 'sk-3', 'sk-4'].map((k) => (
        <div key={k} className="relative pl-10">
          <span className="absolute left-[11px] top-6 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-sand-core ring-4 ring-cream" />
          <div className="flex flex-col gap-3 rounded-xl border border-sand-core bg-cream p-5 shadow-kid-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-10 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ActivityPage() {
  const { events, isLoading, error: eventsError } = useActivityFeed(200);
  const { stats, error: statsError } = useDomainStats();

  const indexerDown = Boolean(eventsError || statsError);

  const [visible, setVisible] = useState(PAGE_SIZE);

  // TODO: wire active-wallet + today counts to dedicated endpoints
  const todayCount = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const startTs = Math.floor(start.getTime() / 1000);
    return events.filter((e) => Number(e.timestamp) >= startTs).length;
  }, [events]);

  const activeWallets = useMemo(() => {
    const cutoff = Math.floor(Date.now() / 1000) - 7 * 86400;
    const set = new Set(
      events.filter((e) => Number(e.timestamp) >= cutoff).map((e) => e.actor.toLowerCase()),
    );
    return set.size;
  }, [events]);

  const avgPerDay = useMemo(() => {
    const oldest = events[events.length - 1];
    if (!oldest) return 0;
    const oldestTs = Number(oldest.timestamp);
    const spanDays = Math.max(1, Math.round((Date.now() / 1000 - oldestTs) / 86400));
    return Math.round(stats.totalDomains / spanDays);
  }, [events, stats.totalDomains]);

  const grouped = useMemo(() => groupByDay(events.slice(0, visible)), [events, visible]);

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Editorial hero */}
      <FadeIn>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-bronze">
          KITEID · ACTIVITY
        </p>
        <h1 className="mt-4 font-display text-5xl leading-[1.05] text-carbon sm:text-6xl">
          Every .kite event,
          <br />
          <span className="text-gradient-gold">in order.</span>
        </h1>
        <div className="mt-8 editorial-rule" />
        {indexerDown && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning"
          >
            <p className="font-medium">Indexer unavailable</p>
            <p className="mt-1 text-warning/80">
              Live activity and stats couldn't be loaded. The blockchain data is safe — this is a
              temporary issue with the indexer. Retry shortly.
            </p>
          </div>
        )}
      </FadeIn>

      {/* Stats row */}
      <FadeIn delay={0.1}>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total">
            <AnimatedCounter
              value={stats.totalDomains}
              className="font-display text-4xl text-carbon"
            />
          </StatTile>
          <StatTile label="Today">
            <AnimatedCounter value={todayCount} className="font-display text-4xl text-carbon" />
          </StatTile>
          <StatTile label="Wallets · 7d">
            <AnimatedCounter value={activeWallets} className="font-display text-4xl text-carbon" />
          </StatTile>
          <StatTile label="Avg / day">
            <AnimatedCounter value={avgPerDay} className="font-display text-4xl text-carbon" />
          </StatTile>
        </div>
      </FadeIn>

      {/* Timeline */}
      <div className="relative mt-14">
        {/* Vertical dashed line */}
        {grouped.length > 0 && (
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[11px] top-0 w-px border-l-2 border-dashed border-gold/40"
          />
        )}

        {isLoading ? (
          <LoadingTimeline />
        ) : events.length === 0 ? (
          <ActivityEmpty />
        ) : (
          <div className="space-y-12">
            {grouped.map((group) => (
              <RevealOnScroll key={group.day}>
                <section>
                  {/* Date header with editorial rule */}
                  <div className="relative mb-6 pl-10">
                    <div className="flex items-baseline gap-4">
                      <p className="font-display text-xl text-carbon">
                        {formatDayHeader(group.day)}
                      </p>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-stone">
                        {group.events.length} {group.events.length === 1 ? 'event' : 'events'}
                      </span>
                      <span className="h-px flex-1 bg-sand-core" />
                    </div>
                  </div>

                  <Stagger className="space-y-4">
                    {group.events.map((evt) => (
                      <StaggerItem key={evt.id}>
                        <EventCard event={evt} />
                      </StaggerItem>
                    ))}
                  </Stagger>
                </section>
              </RevealOnScroll>
            ))}

            {/* Load more */}
            {visible < events.length && (
              <div className="pl-10 pt-4 text-center">
                <Button
                  variant="outline"
                  className="min-h-[44px] border-sand-core"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                >
                  Load more events
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function StatTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-sand-core bg-parchment p-5 shadow-kid-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
