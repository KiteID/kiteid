'use client';

import { Badge, Skeleton } from '@kiteid/ui';
import { RefreshCw, Settings2, Star } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { RenewDialog } from '@/components/domain/renew-dialog';
import { Stagger, StaggerItem } from '@/components/motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNameDetails } from '@/hooks/use-name-details';

type ViewMode = 'grid' | 'list';

function formatExactDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatRelative(days: number | undefined): string {
  if (days === undefined) return '—';
  if (days <= 0) return 'Expired';
  if (days === 1) return 'Tomorrow';
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.round(days / 30)} months`;
  const years = (days / 365).toFixed(1).replace(/\.0$/, '');
  return `${years} years`;
}

function tierLabel(name: string): string {
  const len = name.length;
  if (len === 3) return 'TIER · 3-CHAR';
  if (len === 4) return 'TIER · 4-CHAR';
  return 'TIER · STANDARD';
}

function statusBadge(days: number | undefined) {
  if (days === undefined) {
    return (
      <Badge variant="outline" className="border-sand-core text-stone">
        Loading
      </Badge>
    );
  }
  if (days <= 0) {
    return <Badge variant="destructive">Grace</Badge>;
  }
  if (days <= 30) {
    return <Badge variant="warning">Expiring</Badge>;
  }
  return <Badge className="border-transparent bg-gold text-cream hover:bg-gold">Active</Badge>;
}

function CountdownRing({ days, size = 64 }: { days: number | undefined; size?: number }) {
  const maxDays = 365;
  const clamped = days === undefined ? 0 : Math.max(0, Math.min(maxDays, days));
  const progress = clamped / maxDays;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  let colorClass = 'text-gold';
  if (days !== undefined) {
    if (days <= 7) colorClass = 'text-destructive';
    else if (days <= 30) colorClass = 'text-warning';
  }

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-sand-pale"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colorClass} transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <span className="absolute text-center font-mono text-[11px] font-medium tabular-nums text-carbon">
        {days === undefined ? '—' : `${Math.max(0, days)}d`}
      </span>
    </div>
  );
}

interface NameCardProps {
  name: string;
  variant: ViewMode;
  onRenew: (name: string) => void;
}

function NameCard({ name, variant, onRenew }: NameCardProps) {
  const { daysLeft, expiryTimestamp, isLoading } = useNameDetails(name);
  const [isPrimary, setIsPrimary] = useState(false);

  const toggleStar = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: wire up setPrimary via reverse registrar
    setIsPrimary((v) => !v);
  }, []);

  const handleRenew = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onRenew(name);
    },
    [name, onRenew],
  );

  if (variant === 'list') {
    return (
      <Link href={`/names/${encodeURIComponent(name)}`} className="block">
        <div className="group flex items-center gap-6 rounded-xl border border-sand-core bg-cream px-6 py-4 shadow-kid-sm transition-shadow hover:shadow-kid-md">
          <CountdownRing days={daysLeft} size={48} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="truncate font-display text-2xl text-carbon">
                {name}
                <span className="text-gold">.kite</span>
              </h3>
              {statusBadge(daysLeft)}
            </div>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-stone">
              {tierLabel(name)} · Expires {expiryTimestamp ? formatExactDate(expiryTimestamp) : '—'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <IconAction label={isPrimary ? 'Primary name' : 'Set as primary'} onClick={toggleStar}>
              <Star
                className={`h-4 w-4 ${isPrimary ? 'fill-gold text-gold' : 'text-bronze'}`}
                strokeWidth={1.5}
              />
            </IconAction>
            <IconAction label="Renew" onClick={handleRenew}>
              <RefreshCw className="h-4 w-4 text-bronze" strokeWidth={1.5} />
            </IconAction>
            <IconAction label="Manage">
              <Settings2 className="h-4 w-4 text-bronze" strokeWidth={1.5} />
            </IconAction>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/names/${encodeURIComponent(name)}`} className="block h-full">
      <article className="group flex h-full flex-col rounded-xl border border-sand-core bg-cream p-6 shadow-kid-md transition-all hover:border-gold/50 hover:shadow-kid-lg">
        {/* Top row: tier + status */}
        <div className="flex items-start justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bronze">
            {tierLabel(name)}
          </p>
          {statusBadge(daysLeft)}
        </div>

        {/* Name — hero type */}
        <div className="mt-6">
          {isLoading ? (
            <Skeleton className="h-11 w-3/4" />
          ) : (
            <h3 className="truncate font-display text-4xl leading-none text-carbon">
              {name}
              <span className="text-2xl text-gold">.kite</span>
            </h3>
          )}
        </div>

        <div className="my-6 editorial-rule" />

        {/* Meta grid */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-stone">Expires</p>
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <p className="mt-1 text-sm font-medium text-carbon">{formatRelative(daysLeft)}</p>
                </TooltipTrigger>
                <TooltipContent>
                  {expiryTimestamp ? formatExactDate(expiryTimestamp) : 'Unknown'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CountdownRing days={daysLeft} />
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-1 border-t border-sand-core/60 pt-4">
          <IconAction label={isPrimary ? 'Primary name' : 'Set as primary'} onClick={toggleStar}>
            <Star
              className={`h-4 w-4 ${isPrimary ? 'fill-gold text-gold' : 'text-bronze'}`}
              strokeWidth={1.5}
            />
          </IconAction>
          <IconAction label="Renew" onClick={handleRenew}>
            <RefreshCw className="h-4 w-4 text-bronze" strokeWidth={1.5} />
          </IconAction>
          <IconAction label="Manage">
            <Settings2 className="h-4 w-4 text-bronze" strokeWidth={1.5} />
          </IconAction>
        </div>
      </article>
    </Link>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onClick}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-bronze transition-colors hover:bg-sand-pale hover:text-carbon"
            aria-label={label}
          >
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-sand-core bg-cream p-6 shadow-kid-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-14" />
      </div>
      <Skeleton className="mt-6 h-11 w-3/4" />
      <div className="my-6 editorial-rule" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
      <div className="mt-6 flex justify-end gap-1 border-t border-sand-core/60 pt-4">
        <Skeleton className="h-11 w-11 rounded-lg" />
        <Skeleton className="h-11 w-11 rounded-lg" />
        <Skeleton className="h-11 w-11 rounded-lg" />
      </div>
    </div>
  );
}

interface NameListProps {
  names: string[];
  isLoading: boolean;
  view?: ViewMode;
}

export function NameList({ names, isLoading, view = 'grid' }: NameListProps) {
  const [renewFor, setRenewFor] = useState<string | null>(null);
  const handleRenew = useCallback((n: string) => setRenewFor(n), []);
  const handleCloseRenew = useCallback(() => setRenewFor(null), []);

  if (isLoading) {
    return (
      <div
        className={
          view === 'grid'
            ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-3'
        }
      >
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (names.length === 0) {
    return (
      <div className="rounded-xl border border-sand-core bg-cream p-12 text-center shadow-kid-sm">
        <p className="font-display text-2xl text-carbon">Nothing matches this filter.</p>
        <p className="mt-2 text-sm text-bronze">Try switching filters to see all your names.</p>
      </div>
    );
  }

  return (
    <>
      <Stagger
        className={
          view === 'grid'
            ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
            : 'flex flex-col gap-3'
        }
      >
        {names.map((name) => (
          <StaggerItem key={name} className={view === 'grid' ? 'h-full' : ''}>
            <NameCard name={name} variant={view} onRenew={handleRenew} />
          </StaggerItem>
        ))}
      </Stagger>

      {renewFor && <RenewDialog name={renewFor} open={!!renewFor} onClose={handleCloseRenew} />}
    </>
  );
}

export { CountdownRing, NameCard };
