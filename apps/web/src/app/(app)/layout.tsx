import { ClientOnly } from '@/components/layout/client-only';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { ChainGuard } from '@/components/web3/chain-guard';

export const dynamic = 'force-dynamic';

function PageSkeleton() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto h-6 w-32 animate-pulse rounded bg-sand-core" />
        <div className="mx-auto mt-4 h-4 w-64 animate-pulse rounded bg-sand-core/60" />
      </div>
    </main>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <ClientOnly fallback={<PageSkeleton />}>
        <ChainGuard>
          <main className="flex-1">{children}</main>
        </ChainGuard>
      </ClientOnly>
      <Footer />
    </div>
  );
}
