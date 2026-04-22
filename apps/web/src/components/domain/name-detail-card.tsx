'use client';

import type { ActivityEvent, IndexedDomain } from '@kiteid/sdk';

type ResolverRecord = {
  id: string;
  name: string;
  recordType: string;
  key: string;
  value: string;
  updatedAt: string;
};

import { Button, Skeleton } from '@kiteid/ui';
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  ExternalLink,
  Hash,
  RefreshCw,
  Settings2,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { CountdownRing } from '@/components/domain/name-list';
import { FadeIn, RevealOnScroll, Stagger, StaggerItem } from '@/components/motion';
import { CopyAddress } from '@/components/ui/copy-address';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const EXPLORER_URL = 'https://testnet.kitescan.ai';

function formatExactDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function relativeTime(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts * 1000) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}d ago`;
  return `${Math.floor(diffSec / 2592000)}mo ago`;
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
      return 'Address updated';
    case 'TextChanged':
      return 'Text record updated';
    case 'ContenthashChanged':
      return 'Content hash updated';
    default:
      return type;
  }
}

interface NameDetailCardProps {
  name: string;
  owner: `0x${string}` | undefined;
  resolver: `0x${string}` | undefined;
  expiryTimestamp: number | undefined;
  daysLeft: number | undefined;
  isExpired: boolean;
  isLoading: boolean;
  isOwner: boolean;
  records: ResolverRecord[];
  domain: IndexedDomain | undefined;
  events: ActivityEvent[];
  onRenew: () => void;
}

export function NameDetailCard({
  name,
  owner,
  resolver,
  expiryTimestamp,
  daysLeft,
  isExpired,
  isLoading,
  isOwner,
  records,
  domain,
  events,
  onRenew,
}: NameDetailCardProps) {
  const [isPrimary, setIsPrimary] = useState(false);

  const handleTogglePrimary = useCallback(() => {
    // TODO: wire to reverse registrar setName(name)
    setIsPrimary((v) => !v);
    toast.success(isPrimary ? 'Primary name cleared' : 'Primary name set');
  }, [isPrimary]);

  if (isLoading) {
    return <DetailSkeleton name={name} />;
  }

  const statusText = isExpired
    ? 'Grace period'
    : daysLeft !== undefined && daysLeft <= 30
      ? 'Expiring soon'
      : 'Active';

  const statusColor = isExpired
    ? 'bg-destructive text-destructive-foreground'
    : daysLeft !== undefined && daysLeft <= 30
      ? 'bg-warning text-white'
      : 'bg-gold text-cream';

  return (
    <>
      {/* Editorial hero */}
      <FadeIn>
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-bronze">
            KITEID · RECORD
          </p>
          <h1 className="mt-4 break-words font-display text-[80px] leading-[0.95] text-carbon sm:text-[100px] lg:text-[140px]">
            {name}
            <span className="gold-foil">.kite</span>
          </h1>
          <div className="mt-6 editorial-rule" />
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs uppercase tracking-wider text-stone">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${statusColor}`}
            >
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-current" />
              {statusText}
            </span>
            {daysLeft !== undefined && !isExpired && (
              <>
                <span className="text-sand-core">·</span>
                <span>Expires in {daysLeft} days</span>
              </>
            )}
            {domain?.registeredAt && (
              <>
                <span className="text-sand-core">·</span>
                <span>Registered {formatShortDate(Number(domain.registeredAt))}</span>
              </>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Two-column body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2/3 — Records */}
        <div className="lg:col-span-2">
          <FadeIn delay={0.1}>
            <div className="rounded-2xl border border-sand-core bg-cream p-6 shadow-kid-sm sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">
                    Resolver data
                  </p>
                  <h2 className="mt-1 font-display text-3xl text-carbon">Records</h2>
                </div>
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="min-h-[44px] border-sand-core"
                        >
                          <Settings2 className="h-4 w-4" strokeWidth={1.5} />
                          Manage
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Coming in V2</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="my-6 editorial-rule" />

              {records.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="font-display text-2xl text-carbon">No records set yet.</p>
                  <p className="mt-2 text-sm text-graphite">
                    Resolver records will appear here when configured.
                  </p>
                  {isOwner && (
                    <TooltipProvider>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="outline"
                              disabled
                              className="mt-6 min-h-[44px] border-sand-core"
                            >
                              Add record
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Coming in V2</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-sand-core/60">
                  {records.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wider text-bronze">
                          {r.recordType}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-carbon">{r.key}</p>
                      </div>
                      {r.value.startsWith('0x') ? (
                        <CopyAddress value={r.value} label="Record copied" />
                      ) : (
                        <code className="rounded bg-sand-pale px-2 py-1 font-mono text-xs text-graphite">
                          {r.value}
                        </code>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Right 1/3 — Actions + Meta */}
        <div className="space-y-6">
          {/* Actions */}
          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-sand-core bg-cream p-6 shadow-kid-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">
                Actions
              </p>
              <div className="mt-4 space-y-2">
                <Button
                  onClick={handleTogglePrimary}
                  variant={isPrimary ? 'secondary' : 'outline'}
                  className="min-h-[44px] w-full justify-start border-sand-core"
                  disabled={!isOwner}
                >
                  <Star
                    className={`h-4 w-4 ${isPrimary ? 'fill-gold text-gold' : 'text-bronze'}`}
                    strokeWidth={1.5}
                  />
                  {isPrimary ? 'This is your primary' : 'Set as primary'}
                </Button>
                <Button
                  onClick={onRenew}
                  className="min-h-[44px] w-full justify-start bg-carbon text-cream hover:bg-graphite"
                  disabled={!isOwner}
                >
                  <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
                  Renew
                </Button>
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span className="block">
                        <Button
                          variant="outline"
                          disabled
                          className="min-h-[44px] w-full justify-start border-sand-core"
                        >
                          <Users className="h-4 w-4" strokeWidth={1.5} />
                          Transfer
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Coming in V2</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {!isOwner && (
                <p className="mt-4 inline-flex items-start gap-2 rounded-lg bg-sand-pale p-3 text-[11px] text-bronze">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                  Read-only. You are not the owner of this name.
                </p>
              )}
            </div>
          </FadeIn>

          {/* Meta */}
          <FadeIn delay={0.2}>
            <div className="rounded-2xl border border-sand-core bg-sand-pale p-6 shadow-kid-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">Meta</p>
              <dl className="mt-4 space-y-4">
                <MetaRow icon={<Shield className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Owner">
                  {owner ? <CopyAddress value={owner} /> : <span className="text-stone">—</span>}
                </MetaRow>

                <MetaRow icon={<Hash className="h-3.5 w-3.5" strokeWidth={1.5} />} label="Token ID">
                  {domain?.tokenId ? (
                    <CopyAddress value={domain.tokenId} label="Token ID copied" />
                  ) : (
                    <span className="text-stone">—</span>
                  )}
                </MetaRow>

                {domain?.createdAtBlock && (
                  <MetaRow
                    icon={<Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />}
                    label="Block"
                  >
                    <a
                      href={`${EXPLORER_URL}/block/${domain.createdAtBlock}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs text-bronze transition-colors hover:text-carbon"
                    >
                      {domain.createdAtBlock}
                      <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                    </a>
                  </MetaRow>
                )}

                {resolver && (
                  <MetaRow
                    icon={<Shield className="h-3.5 w-3.5" strokeWidth={1.5} />}
                    label="Resolver"
                  >
                    <CopyAddress value={resolver} label="Resolver copied" />
                  </MetaRow>
                )}

                {expiryTimestamp && (
                  <div className="border-t border-sand-core pt-4">
                    <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-bronze">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Expires
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <CountdownRing days={daysLeft} />
                      <div>
                        <p className="text-sm font-medium text-carbon">
                          {formatExactDate(expiryTimestamp)}
                        </p>
                        <p className="mt-0.5 text-[11px] text-stone">
                          {daysLeft !== undefined
                            ? daysLeft > 0
                              ? `${daysLeft} days remaining`
                              : `${Math.abs(daysLeft)} days in grace`
                            : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </dl>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Recent activity */}
      <RevealOnScroll>
        <div className="mt-16">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">Recent</p>
              <h2 className="mt-1 font-display text-3xl text-carbon">Activity</h2>
            </div>
            {events.length > 5 && (
              <p className="text-xs text-stone">Showing 5 of {events.length}</p>
            )}
          </div>
          <div className="mt-6 editorial-rule" />

          {events.length === 0 ? (
            <p className="mt-8 text-center text-sm text-stone">No activity recorded yet.</p>
          ) : (
            <Stagger className="mt-6 space-y-3">
              {events.slice(0, 5).map((e) => (
                <StaggerItem key={e.id}>
                  <div className="flex flex-col gap-3 rounded-xl border border-sand-core bg-cream p-4 shadow-kid-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                      <div>
                        <p className="font-display text-base text-carbon">
                          {eventLabel(e.eventType)}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-stone">
                          {relativeTime(Number(e.timestamp))} · block {e.blockNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CopyAddress value={e.actor} />
                      <a
                        href={`${EXPLORER_URL}/tx/${e.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-1 rounded-md px-2 text-xs text-bronze transition-colors hover:text-carbon"
                      >
                        tx
                        <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
                      </a>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </RevealOnScroll>
    </>
  );
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-bronze">
        {icon}
        {label}
      </dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function DetailSkeleton({ name }: { name: string }) {
  return (
    <div>
      <div className="mb-12">
        <Skeleton className="h-3 w-32" />
        <div className="mt-4">
          <h1 className="break-words font-display text-[80px] leading-[0.95] text-carbon opacity-40 sm:text-[100px] lg:text-[140px]">
            {name}
            <span className="text-gold">.kite</span>
          </h1>
        </div>
        <div className="mt-6 editorial-rule" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-40 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-sand-core bg-cream p-8 lg:col-span-2">
          <Skeleton className="h-10 w-48" />
          <div className="my-6 editorial-rule" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-sand-core bg-cream p-6">
            <Skeleton className="h-4 w-20" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
          <div className="rounded-2xl border border-sand-core bg-sand-pale p-6">
            <Skeleton className="h-4 w-20" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
