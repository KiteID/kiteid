'use client';

import { Button } from '@kiteid/ui';
import { useAccount } from 'wagmi';
import { NameList } from '@/components/domain/name-list';
import { useOwnedNames } from '@/hooks/use-owned-names';

function ConnectPrompt() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-semibold text-carbon">My Names</h1>
      <p className="mt-3 text-bronze">Connect your wallet to view and manage your .kite domains.</p>
      <div className="mt-8">
        <Button className="bg-gold text-cream hover:bg-bronze" disabled>
          Connect Wallet
        </Button>
      </div>
      <p className="mt-3 text-xs text-bronze">
        Use the connect button in the header to get started.
      </p>
    </div>
  );
}

export default function NamesPage() {
  const { isConnected } = useAccount();
  const { data: names, isLoading } = useOwnedNames();

  if (!isConnected) {
    return <ConnectPrompt />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold text-carbon">My Names</h1>

      {/* Phase 3 — Ponder indexer will populate owned names automatically */}
      <div className="mb-6 rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm text-bronze">
        Domain listeleme Phase 3 (Ponder indexer) ile aktif olacak. Şimdilik kayıtlı
        domain&apos;inizi doğrudan <span className="font-mono text-gold">/names/isim</span> yoluyla
        görüntüleyebilirsiniz.
      </div>

      <NameList names={names} isLoading={isLoading} />
    </div>
  );
}
