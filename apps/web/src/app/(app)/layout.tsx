import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { ChainGuard } from '@/components/web3/chain-guard';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <ChainGuard>
        <main className="flex-1">{children}</main>
      </ChainGuard>
      <Footer />
    </div>
  );
}
