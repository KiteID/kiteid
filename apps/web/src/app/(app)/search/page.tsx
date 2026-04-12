'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { NameCard } from '@/components/domain/name-card';
import { SearchBar } from '@/components/domain/search-bar';
import { useSearchDomain } from '@/hooks/use-search-domain';

function SearchResults() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') ?? undefined;
  const { name: normalizedName, isAvailable, isReserved, isLoading, price } = useSearchDomain(name);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold text-carbon">Search Results</h1>

      <SearchBar defaultValue={name} />

      {normalizedName && (
        <div className="mt-8">
          <NameCard
            name={normalizedName}
            isAvailable={isAvailable}
            isReserved={isReserved}
            isLoading={isLoading}
            price={price}
          />
        </div>
      )}

      {!normalizedName && (
        <p className="mt-8 text-center text-bronze">Enter a name to search for availability.</p>
      )}
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
