'use client';

/**
 * Consistent banner for any page that fails to reach the indexer.
 * Only renders when `show` is true — page can safely conditionally mount it.
 */
export function IndexerBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div
      role="alert"
      className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning"
    >
      <p className="font-medium">Indexer temporarily unavailable</p>
      <p className="mt-1 text-warning/80">
        Live data can't be fetched right now. On-chain balances are safe — retry shortly.
      </p>
    </div>
  );
}
