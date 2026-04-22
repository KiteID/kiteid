'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { NameCard } from '@/components/domain/name-card';
import { SearchBar } from '@/components/domain/search-bar';
import { FadeIn, Stagger, StaggerItem } from '@/components/motion';
import { useSearchDomain } from '@/hooks/use-search-domain';

function suggestionsFor(name: string) {
  const base = name.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'name';
  return [`${base}1`, `${base}-dao`, `real-${base}`, `${base}com`];
}

function SearchResults() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') ?? undefined;
  const { name: normalizedName, isAvailable, isReserved, isLoading, price } = useSearchDomain(name);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Breadcrumb label */}
      <FadeIn>
        <div className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-bronze">
          <Search className="h-3 w-3" strokeWidth={1.8} />
          Search
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <h1 className="mb-2 font-display text-4xl leading-tight text-carbon sm:text-5xl">
          Find your .kite name
        </h1>
        <p className="mb-8 max-w-lg text-sm text-bronze sm:text-base">
          Search the registry — each .kite name is a permanent identity on the Kite AI network.
        </p>
      </FadeIn>

      <FadeIn delay={0.16}>
        <SearchBar
          defaultValue={name}
          size="lg"
          autoFocus={!name}
          isChecking={Boolean(name) && isLoading}
        />
      </FadeIn>

      {/* Results area */}
      <div className="mt-10">
        {!normalizedName && (
          <FadeIn delay={0.24}>
            <div className="rounded-2xl border border-dashed border-sand-core bg-cream/60 p-10 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sand-pale">
                <Search className="h-4 w-4 text-bronze" strokeWidth={1.5} />
              </div>
              <p className="font-display text-xl italic text-bronze">Enter a name to begin.</p>
              <p className="mt-1 text-xs text-stone">
                Names are 3–63 characters. Letters, digits, and hyphens.
              </p>
            </div>
          </FadeIn>
        )}

        {normalizedName && (
          <FadeIn delay={0.2} key={normalizedName}>
            <NameCard
              name={normalizedName}
              isAvailable={isAvailable}
              isReserved={isReserved}
              isLoading={isLoading}
              price={price}
            />
          </FadeIn>
        )}

        {normalizedName && !isLoading && (
          <FadeIn delay={0.4}>
            <div className="mt-12">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bronze">
                  Suggested
                </span>
                <div className="h-px flex-1 bg-sand-core ml-4" />
              </div>
              <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4" staggerDelay={0.06}>
                {suggestionsFor(normalizedName).map((alt) => (
                  <StaggerItem key={alt}>
                    <Link
                      href={`/search?name=${encodeURIComponent(alt)}`}
                      className="group block rounded-xl border border-sand-core bg-cream px-4 py-3 text-center transition-all hover:border-gold hover:shadow-kid-sm"
                    >
                      <span className="block truncate font-display text-lg text-carbon">
                        {alt}
                        <span className="text-gold">.kite</span>
                      </span>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
