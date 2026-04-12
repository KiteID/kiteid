import Link from 'next/link';
import { SearchBar } from '@/components/domain/search-bar';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Subtle top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-0.5">
          <span className="text-xl font-normal tracking-tight text-carbon">Kite</span>
          <span className="text-xl font-extrabold tracking-tight text-gold">ID</span>
        </div>
        <Link
          href="/names"
          className="text-sm font-medium text-bronze transition-colors hover:text-carbon"
        >
          My Names
        </Link>
      </div>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-24">
        <div className="relative mb-8">
          {/* Decorative glow */}
          <div className="absolute -inset-12 rounded-full bg-gold/5 blur-3xl" />
          <h1 className="relative text-center text-5xl font-bold tracking-tight text-carbon sm:text-6xl lg:text-7xl">
            Your <span className="text-gold">identity</span>
            <br />
            on Kite AI
          </h1>
        </div>

        <p className="mb-10 max-w-lg text-center text-lg text-bronze">
          Claim your <span className="font-mono font-semibold text-gold">.kite</span> domain. One
          name for your wallet, your agent, your reputation.
        </p>

        <div className="w-full max-w-xl">
          <SearchBar size="lg" autoFocus />
        </div>

        {/* Social proof / stats placeholder */}
        <div className="mt-16 flex items-center gap-8 text-center">
          <div>
            <p className="text-2xl font-bold text-carbon">&#x221E;</p>
            <p className="text-xs text-bronze">Names Available</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-bold text-carbon">~1s</p>
            <p className="text-xs text-bronze">Block Time</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-bold text-carbon">&lt;$0.01</p>
            <p className="text-xs text-bronze">Gas Cost</p>
          </div>
        </div>
      </div>
    </main>
  );
}
