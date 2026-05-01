import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-fd-background p-6 text-center">
      <div className="max-w-2xl">
        <span className="font-mono text-sm uppercase tracking-widest text-fd-muted-foreground">
          Developer Docs
        </span>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-fd-foreground">
          Kite<span className="text-[#C9986A]">ID</span>
        </h1>
        <p className="mt-4 text-lg text-fd-muted-foreground">
          The ENS-style naming service on Kite AI. Register{' '}
          <code className="rounded bg-fd-muted px-1.5 py-0.5 text-sm font-mono">.kite</code> names,
          build integrations, and explore the on-chain identity layer.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-lg bg-[#C9986A] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Read the docs <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <a
            href="https://kiteid.xyz"
            className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted"
          >
            Go to app
          </a>
        </div>
      </div>
    </main>
  );
}
