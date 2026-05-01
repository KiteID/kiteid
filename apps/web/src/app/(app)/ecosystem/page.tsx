import { ExternalLink } from 'lucide-react';
import type { Metadata } from 'next';
import { FadeIn, RevealOnScroll, Stagger, StaggerItem } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Ecosystem',
  description:
    'Explore the Kite AI network — chain details, deployed contract addresses, faucet, explorer, and ecosystem tools.',
};

const NETWORK_INFO = [
  { label: 'Mainnet Chain ID', value: '2366', mono: true },
  { label: 'Testnet Chain ID', value: '2368 (Ozone)', mono: true },
  { label: 'Mainnet RPC', value: 'https://rpc.gokite.ai', mono: true },
  { label: 'Testnet RPC', value: 'https://rpc-testnet.gokite.ai', mono: true },
  { label: 'Native Token', value: 'KITE', mono: true },
  { label: 'Block Time', value: '~1 second' },
  { label: 'Gas Cost', value: 'Sub-$0.000001' },
  { label: 'Consensus', value: 'PoAI (Proof-of-AI)' },
  { label: 'Architecture', value: 'Avalanche L1 subnet, EVM-compatible' },
];

const CONTRACTS = [
  { label: 'KiteRegistry', address: '0xb54a0D86d9059bC2db72BFfD1FAf6a87b9F0B036' },
  { label: 'KiteBaseRegistrar', address: '0x485cB7C9a8aC6fa4Cc60C489AE0221aFfdCC5841' },
  { label: 'KiteController (proxy)', address: '0xBD6a09D7227F56E79327d680183317C10A1370Df' },
  { label: 'KiteResolver', address: '0xfC69694BBd6b85Fd9b4aC5ddBD647b4f2196CC68' },
  { label: 'KiteReverseRegistrar', address: '0x442FEe8572F4314A45bA2D81e32Db91fCB079E2D' },
  { label: 'PriceOracle', address: '0x97972ee9Ca8cdB78d4897B016FDF4755240b6F77' },
];

const PRICING = [
  { tier: '3 characters', price: '640 KITE / year' },
  { tier: '4 characters', price: '160 KITE / year' },
  { tier: '5+ characters', price: '5 KITE / year' },
  { tier: '1–2 characters', price: 'Reserved — DAO auction (V2)' },
];

const ECOSYSTEM_LINKS = [
  {
    label: 'Kite AI',
    description: 'Official Kite AI network homepage',
    href: 'https://gokite.ai',
  },
  {
    label: 'KiteScan',
    description: 'Block explorer for Kite AI mainnet and testnet',
    href: 'https://kitescan.ai',
  },
  {
    label: 'Faucet',
    description: 'Get testnet KITE tokens (0.5 KITE per drip)',
    href: 'https://faucet.gokite.ai',
  },
  {
    label: 'KiteID GitHub',
    description: 'Open-source contracts, indexer, and frontend',
    href: 'https://github.com/KiteID/kiteid',
  },
  {
    label: 'KiteID Docs',
    description: 'Developer documentation and SDK reference',
    href: 'https://docs.kiteid.xyz',
  },
  {
    label: 'KiteID Status',
    description: 'Live uptime and incident history',
    href: 'https://status.kiteid.xyz',
  },
];

export default function EcosystemPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <FadeIn>
        <div className="editorial-rule mb-8" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">
          Ecosystem
        </span>
        <h1 className="mt-4 font-display text-5xl leading-tight text-carbon sm:text-6xl">
          Built on <span className="text-gold">Kite AI</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone">
          Kite AI is an Avalanche L1 subnet with native x402 micropayments and Kite Passport
          identity primitives. KiteID is the naming layer on top — giving every address a
          human-readable name.
        </p>
      </FadeIn>

      {/* Network */}
      <RevealOnScroll className="mt-20">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">
          Network details
        </span>
        <div className="mt-6 overflow-hidden rounded-2xl border border-sand-core">
          {NETWORK_INFO.map(({ label, value, mono }, i) => (
            <div
              key={label}
              className={`flex items-start gap-4 px-6 py-3.5 sm:items-center ${
                i < NETWORK_INFO.length - 1 ? 'border-b border-sand-core' : ''
              }`}
            >
              <span className="w-40 shrink-0 text-xs text-stone">{label}</span>
              <span className={`text-sm text-carbon ${mono ? 'font-mono' : ''}`}>{value}</span>
            </div>
          ))}
        </div>
      </RevealOnScroll>

      {/* Contracts */}
      <RevealOnScroll className="mt-20">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">
          Deployed contracts — testnet (Chain ID 2368)
        </span>
        <div className="mt-6 overflow-hidden rounded-2xl border border-sand-core">
          {CONTRACTS.map(({ label, address }, i) => (
            <div
              key={label}
              className={`flex flex-col gap-1 px-6 py-3.5 sm:flex-row sm:items-center sm:gap-4 ${
                i < CONTRACTS.length - 1 ? 'border-b border-sand-core' : ''
              }`}
            >
              <span className="w-52 shrink-0 text-xs text-stone">{label}</span>
              <div className="flex items-center gap-2">
                <span className="break-all font-mono text-xs text-carbon">{address}</span>
                <a
                  href={`https://testnet.kitescan.ai/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-bronze transition-colors hover:text-gold"
                  aria-label={`View ${label} on KiteScan`}
                >
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone">
          Mainnet addresses will be published at launch. Deploy block: 20858663.
        </p>
      </RevealOnScroll>

      {/* Pricing */}
      <RevealOnScroll className="mt-20">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">
          Pricing
        </span>
        <p className="mt-3 text-sm text-stone">
          Registration fees are denominated in KITE and set by a linear premium price oracle. Fees
          fund ecosystem operations (60%), a reserve (25%), ecosystem grants (10%), and a buyback
          program (5%).
        </p>
        <Stagger className="mt-6 grid gap-3 sm:grid-cols-2" staggerDelay={0.05}>
          {PRICING.map(({ tier, price }) => (
            <StaggerItem key={tier}>
              <div className="flex items-center justify-between rounded-xl border border-sand-core bg-parchment/50 px-5 py-4">
                <span className="font-mono text-sm text-carbon">{tier}</span>
                <span className="text-sm font-semibold text-gold-deep">{price}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-3 text-xs text-stone">
          Grace period: 90 days after expiry. Dutch auction premium: 14-day decay for newly released
          names.
        </p>
      </RevealOnScroll>

      {/* Links */}
      <RevealOnScroll className="mt-20">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze">
          Ecosystem links
        </span>
        <Stagger className="mt-6 grid gap-3 sm:grid-cols-2" staggerDelay={0.05}>
          {ECOSYSTEM_LINKS.map(({ label, description, href }) => (
            <StaggerItem key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between rounded-xl border border-sand-core bg-cream p-5 transition-all hover:border-gold hover:shadow-kid-sm"
              >
                <div>
                  <span className="font-semibold text-carbon group-hover:text-gold-deep">
                    {label}
                  </span>
                  <p className="mt-1 text-xs text-stone">{description}</p>
                </div>
                <ExternalLink
                  className="ml-3 mt-0.5 h-4 w-4 shrink-0 text-bronze/50 transition-colors group-hover:text-gold"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </a>
            </StaggerItem>
          ))}
        </Stagger>
      </RevealOnScroll>
    </div>
  );
}
