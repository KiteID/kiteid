'use client';

import { formatKitePriceWithSymbol } from '@kiteid/sdk';
import { ArrowRight, Bookmark, Info, Lock } from 'lucide-react';
import Link from 'next/link';
import { MagneticButton } from '@/components/motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { TLD } from '@/lib/constants';

type NameStatus = 'loading' | 'available' | 'taken' | 'reserved';

interface NameCardProps {
  name: string;
  isAvailable: boolean | undefined;
  isReserved: boolean | undefined;
  isLoading: boolean;
  price?: { base: bigint; premium: bigint };
}

function getTier(name: string) {
  const len = name.length;
  if (len <= 2) return { label: '1-2 char · Reserved', variant: 'reserved' as const };
  if (len === 3) return { label: '3-char premium', variant: 'premium' as const };
  if (len === 4) return { label: '4-char premium', variant: 'premium' as const };
  return { label: 'Standard', variant: 'standard' as const };
}

function StatusBadge({ status }: { status: NameStatus }) {
  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-sand-pale px-3 py-1 text-xs font-medium tracking-wide text-bronze">
        <span className="h-1.5 w-1.5 rounded-full bg-bronze/50 pulse-dot" />
        Checking
      </span>
    );
  }
  if (status === 'available') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 pulse-dot" />
        Available
      </span>
    );
  }
  if (status === 'taken') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-red-600/15 bg-red-50 px-3 py-1 text-xs font-semibold tracking-wide text-red-700">
        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
        Owned
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-600/20 bg-amber-50 px-3 py-1 text-xs font-semibold tracking-wide text-amber-800">
      <Lock className="h-3 w-3" strokeWidth={1.8} />
      Reserved
    </span>
  );
}

export function NameCard({ name, isAvailable, isReserved, isLoading, price }: NameCardProps) {
  const status: NameStatus = isLoading
    ? 'loading'
    : isReserved
      ? 'reserved'
      : isAvailable
        ? 'available'
        : 'taken';

  const tier = getTier(name);
  const base = price?.base ?? 0n;
  const premium = price?.premium ?? 0n;
  const total = base + premium;
  const hasPremium = premium > 0n;

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-sand-core bg-cream p-6 shadow-kid-md sm:p-8',
          'transition-shadow hover:shadow-kid-lg',
          status === 'taken' && 'border-red-900/10',
          status === 'reserved' && 'border-amber-700/15',
        )}
      >
        {/* Top row — tier label + status */}
        <div className="flex items-start justify-between gap-4">
          <span
            className={cn(
              'text-[11px] font-semibold uppercase tracking-[0.18em]',
              tier.variant === 'premium' && 'text-gold',
              tier.variant === 'reserved' && 'text-amber-800',
              tier.variant === 'standard' && 'text-bronze',
            )}
          >
            {tier.label}
          </span>
          <StatusBadge status={status} />
        </div>

        {/* Name row */}
        <div className="mt-6">
          {status === 'loading' ? (
            <div className="h-16 w-3/4 rounded-lg animate-shimmer sm:h-20 md:h-24" />
          ) : (
            <h2 className="flex items-baseline font-display text-5xl leading-none text-carbon sm:text-6xl md:text-7xl">
              {name.length > 16 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="truncate">{name}</span>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={8}>{name}</TooltipContent>
                </Tooltip>
              ) : (
                <span className="truncate">{name}</span>
              )}
              <span className="ml-1 text-3xl text-gold sm:text-4xl">{TLD}</span>
            </h2>
          )}
        </div>

        {/* Body */}
        <div className="mt-8 space-y-5">
          {status === 'available' && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start justify-between rounded-xl bg-sand-pale/60 px-4 py-3 sm:flex-col sm:items-start sm:gap-1">
                  <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-bronze">
                    Base price
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="text-bronze/70 hover:text-bronze"
                          aria-label="Learn more about base price"
                        >
                          <Info className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Annual rent per year of registration.</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="font-mono text-sm text-carbon sm:text-base">
                    {price ? formatKitePriceWithSymbol(base) : '—'}
                    <span className="ml-1 text-xs text-bronze">/ year</span>
                  </div>
                </div>
                {hasPremium && (
                  <div className="flex items-start justify-between rounded-xl bg-amber-50/50 px-4 py-3 sm:flex-col sm:items-start sm:gap-1">
                    <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-800">
                      Premium
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="text-amber-700/70 hover:text-amber-800"
                            aria-label="Learn more about premium pricing"
                          >
                            <Info className="h-3 w-3" strokeWidth={1.5} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Temporary premium — decays over a 14-day Dutch auction.
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="font-mono text-sm text-amber-900 sm:text-base">
                      {formatKitePriceWithSymbol(premium)}
                    </div>
                  </div>
                )}
              </div>
              <div className="editorial-rule" />
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-bronze">Total</span>
                <span className="font-display text-2xl font-semibold text-gradient-gold sm:text-3xl">
                  {price ? formatKitePriceWithSymbol(total) : '—'}
                </span>
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link href={`/register/${encodeURIComponent(name)}`} className="flex-1">
                  <MagneticButton
                    type="button"
                    className="group flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold text-base font-semibold text-cream shadow-kid-md transition-shadow hover:shadow-kid-glow"
                  >
                    Register {name}
                    {TLD}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </MagneticButton>
                </Link>
                <button
                  type="button"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-sand-core bg-cream px-6 text-sm font-medium text-bronze transition-colors hover:bg-parchment hover:text-carbon"
                >
                  <Bookmark className="h-4 w-4" strokeWidth={1.5} />
                  Watchlist
                </button>
              </div>
            </>
          )}

          {status === 'taken' && (
            <>
              <p className="text-sm text-bronze">
                This name is already owned. View the full registration record or search for a
                different name.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link
                  href={`/names/${encodeURIComponent(name)}`}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-carbon text-sm font-semibold text-cream transition-opacity hover:opacity-90"
                >
                  View details
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </Link>
                <Link
                  href="/search"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-sand-core bg-cream px-6 text-sm font-medium text-bronze transition-colors hover:bg-parchment hover:text-carbon"
                >
                  Search another
                </Link>
              </div>
            </>
          )}

          {status === 'reserved' && (
            <>
              <p className="text-sm text-bronze">
                Short names (1-3 chars) are reserved. They will be auctioned by the KiteID DAO in V2
                — no direct registration available right now.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link
                  href="/search"
                  className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-sand-core bg-cream text-sm font-medium text-bronze transition-colors hover:bg-parchment hover:text-carbon"
                >
                  Search another
                </Link>
              </div>
            </>
          )}

          {status === 'loading' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-sand-pale/60 px-4 py-3">
                  <div className="h-3 w-20 rounded animate-shimmer" />
                  <div className="mt-2 h-5 w-24 rounded animate-shimmer" />
                </div>
                <div className="rounded-xl bg-sand-pale/60 px-4 py-3">
                  <div className="h-3 w-20 rounded animate-shimmer" />
                  <div className="mt-2 h-5 w-24 rounded animate-shimmer" />
                </div>
              </div>
              <div className="editorial-rule opacity-50" />
              <div className="flex items-baseline justify-between">
                <div className="h-3 w-12 rounded animate-shimmer" />
                <div className="h-7 w-32 rounded animate-shimmer" />
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <div className="h-14 flex-1 rounded-xl animate-shimmer" />
                <div className="h-14 w-32 rounded-xl animate-shimmer" />
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
