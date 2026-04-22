'use client';

import { Badge, Button } from '@kiteid/ui';
import { LayoutGrid, List, Settings, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { NameList } from '@/components/domain/name-list';
import { FadeIn, MagneticButton } from '@/components/motion';
import { useOwnedNames } from '@/hooks/use-owned-names';

type Filter = 'all' | 'active' | 'expiring';
type ViewMode = 'grid' | 'list';

function daysUntil(expiresAtSeconds: string): number {
  const expiresMs = Number(expiresAtSeconds) * 1000;
  return Math.floor((expiresMs - Date.now()) / 86_400_000);
}

function ConnectPrompt() {
  return (
    <section className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      {/* Decorative rhombus */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[20%] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-40 w-40 rotate-45 rounded-xl bg-gradient-gold opacity-30 blur-2xl" />
      </div>

      <FadeIn>
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-bronze">
          KITEID · NAMES
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <h1 className="font-display text-5xl leading-[1.05] text-carbon sm:text-6xl">
          Your names,
          <br />
          <span className="text-gradient-gold">your rules.</span>
        </h1>
      </FadeIn>

      <FadeIn delay={0.2}>
        <p className="mx-auto mt-6 max-w-md text-base text-graphite">
          Connect a wallet to claim, manage, and renew your .kite names across Kite AI.
        </p>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="mt-10 flex flex-col items-center gap-3">
          <MagneticButton
            disabled
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-carbon px-8 font-medium text-cream shadow-kid-md disabled:opacity-70"
          >
            <Wallet className="h-4 w-4" strokeWidth={1.5} />
            Connect your wallet
          </MagneticButton>
          <p className="text-xs text-stone">
            Use the connect button in the top-right corner to begin.
          </p>
        </div>
      </FadeIn>
    </section>
  );
}

function EmptyState() {
  const examples = ['vitalik', 'alice', 'satoshi'];
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <FadeIn>
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-bronze">
          KITEID · LIBRARY
        </p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <h1 className="font-display text-5xl leading-tight text-carbon">No names yet.</h1>
      </FadeIn>
      <FadeIn delay={0.2}>
        <p className="mx-auto mt-5 max-w-md text-base text-graphite">
          Claim your first .kite name — short, memorable, yours forever (as long as you renew).
        </p>
      </FadeIn>
      <FadeIn delay={0.3}>
        <div className="mt-10 flex flex-col items-center gap-6">
          <Link href="/">
            <MagneticButton className="inline-flex h-12 items-center gap-2 rounded-xl bg-carbon px-8 font-medium text-cream shadow-kid-md hover:shadow-kid-lg">
              Search names
            </MagneticButton>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-stone">Try:</span>
            {examples.map((ex) => (
              <Link
                key={ex}
                href={`/?name=${ex}`}
                className="rounded-full border border-sand-core bg-cream px-3 py-1 font-mono text-xs text-bronze transition-colors hover:border-gold hover:text-carbon"
              >
                {ex}.kite
              </Link>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

export default function NamesPage() {
  const { isConnected } = useAccount();
  const { data: names, domains, isLoading, isEmpty } = useOwnedNames();

  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<ViewMode>('grid');

  const filteredNames = useMemo(() => {
    if (!domains || filter === 'all') return names;
    return domains
      .filter((d) => {
        const days = daysUntil(d.expiresAt);
        if (filter === 'active') return days > 30;
        if (filter === 'expiring') return days <= 30 && days > 0;
        return true;
      })
      .map((d) => d.name);
  }, [domains, filter, names]);

  if (!isConnected) {
    return <ConnectPrompt />;
  }

  if (!isLoading && isEmpty) {
    return <EmptyState />;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Editorial header */}
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-bronze">
              KITEID · DOSSIER
            </p>
            <div className="mt-2 flex items-baseline gap-4">
              <h1 className="font-display text-4xl leading-none text-carbon sm:text-5xl">
                My Names
              </h1>
              {!isLoading && (
                <Badge variant="outline" className="border-sand-core bg-cream text-bronze">
                  {names.length} {names.length === 1 ? 'name' : 'names'}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-bronze hover:text-carbon"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </FadeIn>

      <div className="my-8 editorial-rule" />

      {/* Toolbar */}
      <FadeIn delay={0.1}>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-full border border-sand-core bg-cream p-1 shadow-kid-sm">
            {(['all', 'active', 'expiring'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`min-h-[36px] rounded-full px-4 text-xs font-medium uppercase tracking-wider transition-colors ${
                  filter === f
                    ? 'bg-carbon text-cream shadow-kid-sm'
                    : 'text-bronze hover:text-carbon'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-lg border border-sand-core bg-cream p-1">
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Grid view"
              className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                view === 'grid' ? 'bg-sand-pale text-carbon' : 'text-bronze hover:text-carbon'
              }`}
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="List view"
              className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                view === 'list' ? 'bg-sand-pale text-carbon' : 'text-bronze hover:text-carbon'
              }`}
            >
              <List className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </FadeIn>

      <NameList names={filteredNames} isLoading={isLoading} view={view} />
    </section>
  );
}
