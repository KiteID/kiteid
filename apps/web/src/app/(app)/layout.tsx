import { ClientOnly } from '@/components/layout/client-only';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { NetworkBanner } from '@/components/web3/network-banner';

export const dynamic = 'force-dynamic';

/**
 * App layout — renders content during SSR for SEO and fast first paint.
 * Only wallet/chain-dependent widgets are wrapped in ClientOnly at the
 * component level (NetworkBanner, ChainGuard happens inside pages that
 * need it). Pages are client components that guard their own interactivity.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <ClientOnly>
        <NetworkBanner />
      </ClientOnly>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
