'use client';

import { Badge, Button } from '@kiteid/ui';
import { LayoutGrid, List, Search, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { NameList } from '@/components/domain/name-list';
import { FadeIn } from '@/components/motion';
import { EmptyState } from '@/components/ui/empty-state';
import { IndexerBanner } from '@/components/ui/indexer-banner';
import { useOwnedNames } from '@/hooks/use-owned-names';

type Filter = 'all' | 'active' | 'expiring';
type ViewMode = 'grid' | 'list';

function daysUntil(expiresAtSeconds: string): number {
  const expiresMs = Number(expiresAtSeconds) * 1000;
  return Math.floor((expiresMs - Date.now()) / 86_400_000);
}

function ConnectPrompt() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <EmptyState
        icon="kite"
        title="Your names, your rules."
        description="Connect your wallet to register and manage .kite domains."
        action={{ label: 'Learn more', href: '/#how-it-works' }}
      />
    </section>
  );
}

function NoNamesYet() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <EmptyState
        icon={Search}
        title="No names yet."
        description="Claim your first .kite name."
        action={{ label: 'Search names', href: '/' }}
      />
    </section>
  );
}

export default function NamesPage() {
  const { isConnected } = useAccount();
  const { data: names, domains, isLoading, isEmpty, error } = useOwnedNames();

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
    return <NoNamesYet />;
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
              <Settings className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </Button>
          </div>
        </div>
      </FadeIn>

      <IndexerBanner show={Boolean(error)} />

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
              <LayoutGrid className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="List view"
              className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                view === 'list' ? 'bg-sand-pale text-carbon' : 'text-bronze hover:text-carbon'
              }`}
            >
              <List className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </FadeIn>

      <NameList names={filteredNames} isLoading={isLoading} view={view} />
    </section>
  );
}
