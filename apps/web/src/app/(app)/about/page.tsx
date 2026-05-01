import { ArrowRight, ExternalLink, Globe, Layers, Shield, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FadeIn, RevealOnScroll, Stagger, StaggerItem } from '@/components/motion';

export const metadata: Metadata = {
  title: 'About',
  description:
    'KiteID is the ENS-style naming service for the Kite AI network — giving humans and agents a permanent, readable identity on-chain.',
};

const PILLARS = [
  {
    icon: Globe,
    title: 'Human-readable identity',
    body: 'Replace 0x… addresses with names like alice.kite. Works for wallets, smart contracts, and AI agents.',
  },
  {
    icon: Shield,
    title: 'Front-run proof registration',
    body: 'Commit-reveal protocol prevents MEV bots from sniping your chosen name during the 60-second reveal window.',
  },
  {
    icon: Zap,
    title: 'Sub-cent gas on Kite AI',
    body: 'Avalanche L1 subnet with ~1s block time and sub-$0.000001 gas. No bridging, no friction.',
  },
  {
    icon: Layers,
    title: 'Composable records',
    body: 'Attach arbitrary key-value records to any name — addresses, IPFS content hashes, profile metadata.',
  },
];

const TECH_STACK = [
  { label: 'Contracts', value: 'Solidity 0.8.34 · OpenZeppelin 5 · Foundry' },
  { label: 'Frontend', value: 'Next.js 16 · React 19 · Tailwind v4 · Wagmi v3' },
  { label: 'Indexing', value: 'Ponder · PostgreSQL 17 · self-hosted' },
  { label: 'Chain', value: 'Kite AI (Chain ID 2366 mainnet / 2368 testnet)' },
  { label: 'Infrastructure', value: 'Hetzner CAX21 · Dokploy · Cloudflare Tunnel' },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <FadeIn>
        <div className="editorial-rule mb-8" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">
          About KiteID
        </span>
        <h1 className="mt-4 font-display text-5xl leading-tight text-carbon sm:text-6xl">
          Your identity on <span className="text-gold">Kite AI</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone">
          KiteID is an ENS-style naming service built on the Kite AI network. It maps human-readable{' '}
          <span className="font-mono text-carbon">.kite</span> names to on-chain addresses, smart
          contracts, and AI agent identities — permanently and without a centralised registry.
        </p>
      </FadeIn>

      {/* Pillars */}
      <RevealOnScroll className="mt-20">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">
          How it works
        </span>
        <Stagger className="mt-8 grid gap-6 sm:grid-cols-2" staggerDelay={0.07}>
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <div className="rounded-2xl border border-sand-core bg-parchment/50 p-6">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10">
                  <Icon className="h-4.5 w-4.5 text-gold-deep" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-carbon">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </RevealOnScroll>

      {/* Tech stack */}
      <RevealOnScroll className="mt-20">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">
          Open-source stack
        </span>
        <div className="mt-6 overflow-hidden rounded-2xl border border-sand-core">
          {TECH_STACK.map(({ label, value }, i) => (
            <div
              key={label}
              className={`flex items-start gap-4 px-6 py-4 sm:items-center ${
                i < TECH_STACK.length - 1 ? 'border-b border-sand-core' : ''
              }`}
            >
              <span className="w-28 shrink-0 font-mono text-xs uppercase tracking-[0.15em] text-bronze">
                {label}
              </span>
              <span className="text-sm text-carbon">{value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-stone">
          Full source available on{' '}
          <a
            href="https://github.com/KiteID/kiteid"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-bronze transition-colors hover:text-carbon"
          >
            GitHub <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
          </a>
          . MIT licensed.
        </p>
      </RevealOnScroll>

      {/* V2 teaser */}
      <RevealOnScroll className="mt-20">
        <div className="rounded-2xl border border-gold/25 bg-gold/5 p-8">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-gold-deep">
            Coming in V2
          </span>
          <h2 className="mt-3 font-display text-2xl text-carbon">Agent identity layer</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            V2 integrates Kite Passport for verified agent identities, x402 micropayment
            authorization, and a NameWrapper for sub-name delegation. Agents will carry persistent
            .kite identities across sessions, networks, and applications.
          </p>
        </div>
      </RevealOnScroll>

      {/* CTA */}
      <RevealOnScroll className="mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Link
          href="/search"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-carbon px-6 text-sm font-semibold text-cream transition-opacity hover:opacity-80"
        >
          Claim your name <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </Link>
        <a
          href="https://github.com/KiteID/kiteid"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-sand-core bg-cream px-6 text-sm font-medium text-bronze transition-colors hover:bg-parchment hover:text-carbon"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          View source
        </a>
      </RevealOnScroll>
    </div>
  );
}
