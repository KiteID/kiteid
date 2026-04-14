import Link from 'next/link';
import { LogoIcon } from '@/components/brand/logo-icon';
import { Wordmark } from '@/components/brand/wordmark';
import { SearchBar } from '@/components/domain/search-bar';

const PRICING = [
  { length: '3 chars', price: '640', example: 'abc.kite' },
  { length: '4 chars', price: '160', example: 'name.kite' },
  { length: '5+ chars', price: '5', example: 'alice.kite' },
] as const;

const FAQ = [
  {
    q: 'What is a .kite domain?',
    a: 'A .kite domain is your on-chain identity on Kite AI. It maps a human-readable name to your wallet address, making it easy for others to find and pay you.',
  },
  {
    q: 'How does registration work?',
    a: 'Registration uses a commit-reveal scheme to prevent front-running. First you submit a commitment, wait 60 seconds, then complete the registration. The entire process costs less than $0.01 in gas.',
  },
  {
    q: 'How long can I register a name?',
    a: 'You can register names for 1 to 10 years. After expiry, there is a 90-day grace period where the previous owner can renew before the name becomes available again.',
  },
  {
    q: 'What are reserved names?',
    a: 'Names like "admin", "kite", and "system" are reserved to prevent impersonation. 1-2 character names will be released via DAO auctions in V2.',
  },
] as const;

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Subtle top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon size={28} />
          <Wordmark size="sm" />
        </Link>
        <div className="flex items-center gap-4">
          <a
            href="https://faucet.gokite.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gold transition-colors hover:text-bronze"
          >
            Faucet
          </a>
          <Link
            href="/names"
            className="text-sm font-medium text-bronze transition-colors hover:text-carbon"
          >
            My Names
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 pb-12">
        {/* Testnet Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-sm font-medium text-gold">
          <span className="inline-block h-2 w-2 rounded-full bg-gold animate-pulse" />
          Live on Testnet
        </div>

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

        <a
          href="https://faucet.gokite.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-bronze transition-colors hover:text-gold"
        >
          Need testnet KITE? Get from faucet &rarr;
        </a>

        {/* Stats */}
        <div className="mt-12 flex items-center gap-8 text-center">
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

      {/* Pricing */}
      <section className="border-t border-border bg-parchment/50 px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-carbon">Pricing</h2>
          <p className="mb-8 text-center text-sm text-bronze">
            All prices in KITE per year. No hidden fees.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {PRICING.map((tier) => (
              <div
                key={tier.length}
                className="rounded-xl border border-border bg-background p-6 text-center"
              >
                <p className="text-sm font-medium text-bronze">{tier.length}</p>
                <p className="mt-2 text-3xl font-bold text-carbon">{tier.price}</p>
                <p className="text-sm text-bronze">KITE/yr</p>
                <p className="mt-3 font-mono text-xs text-gold">{tier.example}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-bronze">
            1-2 character names are reserved for DAO auctions in V2.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-carbon">FAQ</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border bg-background p-4"
              >
                <summary className="cursor-pointer list-none font-medium text-carbon [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center justify-between">
                    <span>{item.q}</span>
                    <span className="ml-2 text-bronze transition-transform group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-bronze">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-xs text-bronze">
        <p>
          KiteID &mdash; built on{' '}
          <a
            href="https://gokite.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            Kite AI
          </a>
        </p>
      </footer>
    </main>
  );
}
