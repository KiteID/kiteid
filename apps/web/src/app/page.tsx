'use client';

import { Button } from '@kiteid/ui';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Lock,
  Rocket,
  Search,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { SearchBar } from '@/components/domain/search-bar';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import {
  AnimatedCounter,
  FadeIn,
  MagneticButton,
  RevealOnScroll,
  Stagger,
  StaggerItem,
} from '@/components/motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CopyAddress } from '@/components/ui/copy-address';

// ---------------------------------------------------------------------------
// Mock data — TODO(phase-3): wire to ponder indexer via tRPC/TanStack Query
// ---------------------------------------------------------------------------

const HERO_SUGGESTIONS = ['vitalik', 'alice', 'satoshi'] as const;

const HOW_IT_WORKS = [
  {
    number: '01',
    title: 'Search',
    description:
      'Type a name. We check availability, pricing tier, and premium status on-chain in real time.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Commit',
    description:
      'Submit a sealed commitment and wait sixty seconds. Commit-reveal prevents front-running.',
    icon: Lock,
  },
  {
    number: '03',
    title: 'Register',
    description:
      'Finalize the transaction. Your name is minted as an NFT and mapped to your wallet.',
    icon: Check,
  },
] as const;

const PRICING_TIERS = [
  {
    chars: 'Three',
    charsShort: '3',
    label: 'Premium',
    price: 640,
    features: ['Short & memorable', 'Prestige tier', 'Ideal for brands'],
    accent: false,
    popular: false,
  },
  {
    chars: 'Four',
    charsShort: '4',
    label: 'Standard',
    price: 160,
    features: ['Balanced length', 'Great for handles', 'Widely available'],
    accent: false,
    popular: false,
  },
  {
    chars: 'Five or more',
    charsShort: '5+',
    label: 'Everyday',
    price: 5,
    features: ['Open registration', 'Most names live here', 'Best value per year'],
    accent: true,
    popular: true,
  },
] as const;

// TODO(phase-3): replace with live ponder query
const MOCK_REGISTRATIONS = [
  { name: 'aurora', ago: '2 min ago', owner: '0x7F3aB2c9E4d1B8F5a6C3e7D8b9A2F4c1E5d6B7a8' },
  { name: 'talaria', ago: '4 min ago', owner: '0x3bE253D2Da78335999Cc7F7317B5CDeec82b0eCa' },
  { name: 'helios', ago: '7 min ago', owner: '0xb54a0D86d9059bC2db72BFfD1FAf6a87b9F0B036' },
  { name: 'mercator', ago: '14 min ago', owner: '0x485cB7C9a8aC6fa4Cc60C489AE0221aFfdCC5841' },
  { name: 'cascade', ago: '22 min ago', owner: '0xBD6a09D7227F56E79327d680183317C10A1370Df' },
  { name: 'levant', ago: '31 min ago', owner: '0xfC69694BBd6b85Fd9b4aC5ddBD647b4f2196CC68' },
  { name: 'bronze', ago: '48 min ago', owner: '0x97972ee9Ca8cdB78d4897B016FDF4755240b6F77' },
  { name: 'parchment', ago: '1 hr ago', owner: '0x442FEe8572F4314A45bA2D81e32Db91fCB079E2D' },
] as const;

const FAQ_ITEMS = [
  {
    q: 'What is KiteID?',
    a: 'KiteID is the naming service for the Kite AI network. It turns long hexadecimal wallet addresses into human-readable .kite names that you own as an NFT. Think of it as the dossier under which your agents, payments, and reputation live.',
  },
  {
    q: 'How much does a name cost?',
    a: 'Pricing is length-based and denominated in KITE per year. Three-character names are 640 KITE, four-character names are 160 KITE, and five-or-longer names are 5 KITE. Premium names decay via a fourteen-day Dutch auction.',
  },
  {
    q: 'Is this on mainnet?',
    a: 'Not yet. V1 is currently live on the Kite Ozone testnet (chain id 2368). A Tier 1 audit and a $50k bug bounty pool precede the mainnet launch later this phase.',
  },
  {
    q: 'How do I get testnet KITE?',
    a: 'Visit the official Kite faucet and connect the wallet you want to register names with. Registration of a five-character name costs roughly 5 KITE plus a negligible amount of gas.',
  },
  {
    q: 'Can I transfer a name?',
    a: 'Yes. Names are standard ERC-721 NFTs. You can transfer, sell, or list them on any compatible marketplace. The subname records and resolver mapping travel with ownership.',
  },
  {
    q: 'Do names expire?',
    a: 'Names are registered for one to ten years. After expiry there is a ninety-day grace period during which the previous owner retains exclusive renewal rights before the name returns to open registration.',
  },
] as const;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <StatsStrip />
        <HowItWorksSection />
        <PricingSection />
        <LiveFeedSection />
        <FaqSection />
        <ClosingCta />
      </main>

      <EditorialFooter />
      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. Hero
// ---------------------------------------------------------------------------

function HeroSection() {
  return (
    <section id="hero" className="relative flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* Editorial label bar */}
      <div className="relative z-10 border-b border-sand-core/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 font-mono text-[11px] uppercase tracking-[0.25em] text-bronze">
          <span>KITEID &middot; TESTNET LIVE &middot; BLOCK 20858663</span>
          <span className="hidden sm:inline">VOL. I &middot; NO. 01</span>
        </div>
      </div>

      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-gradient-gold opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[320px] w-[320px] rounded-full bg-gradient-bronze opacity-10 blur-3xl" />
        {/* Kite rhombus motif */}
        <div className="absolute left-[8%] top-[18%] h-24 w-24 rotate-45 border border-gold-deep/5" />
        <div className="absolute right-[12%] top-[62%] h-16 w-16 rotate-45 border border-gold-deep/10" />
        <div className="absolute left-[22%] bottom-[18%] h-12 w-12 rotate-45 border border-gold-deep/5" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-16">
        <div className="mx-auto w-full max-w-6xl">
          {/* Live testnet badge */}
          <FadeIn delay={0.05}>
            <div className="mb-10 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.25em] text-bronze">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-gold" />
              Live Testnet &middot; Chain 2368
            </div>
          </FadeIn>

          {/* Wordmark */}
          <FadeIn delay={0.15} y={24}>
            <h1 className="text-[88px] font-normal leading-[0.9] tracking-tight text-carbon sm:text-[120px] lg:text-[180px]">
              <span className="font-sans">Kite</span>
              <span className="gold-foil font-extrabold">ID</span>
            </h1>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={0.3} y={16}>
            <p className="mt-6 max-w-2xl font-display text-xl italic text-graphite lg:text-2xl">
              Your name as a parchment dossier, not a ledger entry.
            </p>
          </FadeIn>

          {/* Description */}
          <FadeIn delay={0.4} y={12}>
            <p className="mt-4 max-w-xl text-base text-stone">
              One readable name for your wallet, your agent, and your on-chain reputation across the
              Kite network.
            </p>
          </FadeIn>

          {/* Search */}
          <FadeIn delay={0.5} y={16}>
            <div className="mt-10 w-full max-w-xl">
              <SearchBar size="lg" autoFocus />
            </div>
          </FadeIn>

          {/* Suggestion chips */}
          <FadeIn delay={0.65}>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone">
                try:
              </span>
              {HERO_SUGGESTIONS.map((name) => (
                <Link
                  key={name}
                  href={`/search?name=${name}`}
                  className="group inline-flex items-center gap-1 rounded-full border border-sand-core bg-cream/60 px-3.5 py-1.5 text-sm text-bronze transition-all hover:border-gold/50 hover:bg-parchment hover:text-carbon"
                >
                  <span className="font-display italic">{name}</span>
                  <span className="text-gold-deep">.kite</span>
                  <ArrowRight
                    className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Scroll hint */}
      <FadeIn delay={1} duration={1}>
        <div className="relative z-10 flex flex-col items-center gap-2 pb-8">
          <ChevronDown
            className="h-5 w-5 animate-bounce text-bronze"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-stone">
            scroll
          </span>
        </div>
      </FadeIn>
    </section>
  );
}

// ---------------------------------------------------------------------------
// 2. Live Stats Strip
// ---------------------------------------------------------------------------

function StatsStrip() {
  // TODO(phase-3): wire these to ponder indexer queries (registration count, daily count, avg gas, active wallets)
  const stats = [
    { value: 127, label: 'Names registered', decimals: 0 },
    { value: 18, label: 'Registered today', decimals: 0 },
    { value: 0.0003, label: 'Avg gas (KITE)', decimals: 4 },
    { value: 84, label: 'Active wallets', decimals: 0 },
  ];

  return (
    <RevealOnScroll>
      <section className="bg-parchment py-20">
        <div className="editorial-rule" />
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 py-16 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <p className="font-display text-5xl font-normal tabular-nums text-carbon lg:text-6xl">
                <AnimatedCounter value={stat.value} duration={1.4} decimals={stat.decimals} />
              </p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-bronze">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <div className="editorial-rule" />
      </section>
    </RevealOnScroll>
  );
}

// ---------------------------------------------------------------------------
// 3. How It Works
// ---------------------------------------------------------------------------

function HowItWorksSection() {
  return (
    <RevealOnScroll y={40}>
      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 max-w-2xl">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bronze">
              The Process
            </p>
            <h2 className="font-display text-4xl font-normal leading-tight text-carbon md:text-5xl">
              Three steps, one minute, one name.
            </h2>
            <p className="mt-4 text-graphite">
              Commit-reveal registration prevents mempool front-running without making the flow
              complicated. A single commit, a short wait, a final transaction.
            </p>
          </div>

          <div className="relative">
            {/* Desktop connecting line */}
            <div
              aria-hidden
              className="absolute left-[8%] right-[8%] top-[4rem] hidden border-t-2 border-dashed border-gold/30 lg:block"
            />

            <Stagger staggerDelay={0.12}>
              <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
                {HOW_IT_WORKS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <StaggerItem key={step.number}>
                      <div className="relative rounded-xl border border-sand-core bg-cream p-8 shadow-kid-sm transition-shadow hover:shadow-kid-md">
                        <Icon
                          className="absolute right-6 top-6 h-5 w-5 text-bronze-antique"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <p className="font-display text-[96px] font-normal leading-none tabular-nums text-gold-deep">
                          {step.number}
                        </p>
                        <h3 className="mt-6 text-2xl font-semibold text-carbon">{step.title}</h3>
                        <p className="mt-3 text-graphite">{step.description}</p>
                      </div>
                    </StaggerItem>
                  );
                })}
              </div>
            </Stagger>
          </div>
        </div>
      </section>
    </RevealOnScroll>
  );
}

// ---------------------------------------------------------------------------
// 4. Pricing Tiers
// ---------------------------------------------------------------------------

function PricingSection() {
  return (
    <RevealOnScroll y={40}>
      <section className="bg-parchment py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bronze">
                Pricing &middot; Denominated in KITE
              </p>
              <h2 className="font-display text-4xl font-normal leading-tight text-carbon md:text-5xl">
                Annual tiers, no hidden fees.
              </h2>
            </div>
            <p className="text-sm text-stone md:max-w-xs md:text-right">
              Revenue split: 60% ops &middot; 25% reserve &middot; 10% ecosystem &middot; 5%
              buyback.
            </p>
          </div>

          <Stagger staggerDelay={0.1}>
            <div className="grid gap-6 md:grid-cols-3">
              {PRICING_TIERS.map((tier) => (
                <StaggerItem key={tier.charsShort}>
                  <div
                    className={`relative flex h-full flex-col rounded-xl border bg-cream p-8 transition-transform hover:-translate-y-1 ${
                      tier.popular
                        ? 'border-gold/50 shadow-kid-glow'
                        : 'border-sand-core shadow-kid-md'
                    }`}
                  >
                    {/* Top accent strip for premium */}
                    {tier.charsShort === '3' && (
                      <div className="absolute inset-x-0 top-0 h-1 rounded-t-xl bg-gradient-bronze" />
                    )}
                    {tier.popular && (
                      <div className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cream shadow-kid-sm">
                        <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
                        Most popular
                      </div>
                    )}

                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-bronze">
                      {tier.label} &middot; {tier.charsShort} char
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-normal text-carbon">
                      {tier.chars} characters
                    </h3>

                    <div className="mt-8 flex items-baseline gap-2">
                      <span className="font-display text-6xl font-normal tabular-nums text-carbon">
                        {tier.price}
                      </span>
                      <span className="font-mono text-sm uppercase tracking-wider text-gold-deep">
                        KITE
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-stone">/ per year</p>

                    <ul className="mt-8 space-y-3">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-sm text-graphite">
                          <Check
                            className="mt-0.5 h-4 w-4 shrink-0 text-gold"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/search" className="mt-8 block">
                      <Button variant={tier.popular ? 'default' : 'outline'} className="w-full">
                        See available
                        <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                      </Button>
                    </Link>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </Stagger>

          <p className="mt-10 text-center text-xs text-stone">
            1-2 character names are reserved for DAO auctions in V2. Premium names decay via a
            14-day Dutch auction.
          </p>
        </div>
      </section>
    </RevealOnScroll>
  );
}

// ---------------------------------------------------------------------------
// 5. Live Registrations Feed
// ---------------------------------------------------------------------------

function LiveFeedSection() {
  return (
    <RevealOnScroll y={40}>
      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bronze">
                Ledger
              </p>
              <h2 className="font-display text-4xl font-normal leading-tight text-carbon md:text-5xl">
                Registered moments ago.
              </h2>
              <p className="mt-3 text-graphite">Live from the Kite testnet.</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sand-core bg-parchment px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bronze">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              Streaming
            </div>
          </div>

          {/* TODO(phase-3): replace mock rows with live ponder subscription */}
          <Stagger staggerDelay={0.05}>
            <div className="divide-y divide-sand-core border-y border-sand-core">
              {MOCK_REGISTRATIONS.map((row, i) => (
                <StaggerItem key={row.name}>
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4 py-5 md:grid-cols-[1fr_auto_auto] md:gap-8">
                    <div className="flex items-center gap-3">
                      {i < 3 && (
                        <span className="pulse-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      )}
                      <span className="font-display text-2xl italic text-carbon">{row.name}</span>
                      <span className="font-mono text-sm text-gold-deep">.kite</span>
                    </div>
                    <div className="hidden items-center gap-1.5 font-mono text-xs text-stone md:inline-flex">
                      <Clock className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
                      {row.ago}
                    </div>
                    <div className="justify-self-end">
                      <CopyAddress value={row.owner} />
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </Stagger>

          <div className="mt-10 text-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-bronze transition-colors hover:text-gold"
            >
              Browse the ledger
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </RevealOnScroll>
  );
}

// ---------------------------------------------------------------------------
// 6. FAQ
// ---------------------------------------------------------------------------

function FaqSection() {
  return (
    <RevealOnScroll y={40}>
      <section className="bg-parchment py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-12 text-center">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bronze">
              FAQ
            </p>
            <h2 className="font-display text-4xl font-normal leading-tight text-carbon md:text-5xl">
              Questions.
            </h2>
          </div>

          <div className="rounded-xl border border-sand-core bg-cream px-6 shadow-kid-sm md:px-8">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, idx) => (
                <AccordionItem key={item.q} value={`item-${idx}`}>
                  <AccordionTrigger>
                    <span className="flex items-baseline gap-4 pr-4">
                      <span className="font-mono text-xs tabular-nums text-bronze-antique">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-display text-lg">{item.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="pl-10 text-graphite">{item.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </RevealOnScroll>
  );
}

// ---------------------------------------------------------------------------
// 7. Closing CTA
// ---------------------------------------------------------------------------

function ClosingCta() {
  return (
    <RevealOnScroll y={40}>
      <section className="relative overflow-hidden bg-parchment py-32">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-gold opacity-10 blur-3xl" />
          <div className="absolute left-[8%] top-[30%] h-20 w-20 rotate-45 border border-gold-deep/10" />
          <div className="absolute right-[10%] bottom-[20%] h-14 w-14 rotate-45 border border-gold-deep/10" />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <Rocket className="mx-auto mb-8 h-8 w-8 text-gold" strokeWidth={1.5} aria-hidden="true" />
          <h2 className="font-display text-5xl font-normal leading-[1.05] tracking-tight text-carbon md:text-7xl">
            Your name is waiting.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-graphite">
            Register it before someone else does. Most five-plus character names still cost less
            than one night out.
          </p>

          <div className="mt-12 flex flex-col items-center gap-6">
            <MagneticButton
              strength={0.35}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const el = document.getElementById('hero');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground shadow-kid-md transition-colors hover:bg-bronze"
            >
              Search .kite names
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </MagneticButton>

            <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-[0.2em]">
              <a
                href="https://github.com/KiteID/kiteid"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-bronze transition-colors hover:text-gold"
              >
                GitHub
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
              </a>
              <span className="text-sand-core">&middot;</span>
              <a
                href="https://docs.kiteid.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-bronze transition-colors hover:text-gold"
              >
                Docs
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
              </a>
              <span className="text-sand-core">&middot;</span>
              <a
                href="https://status.kiteid.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-bronze transition-colors hover:text-gold"
              >
                Status
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </RevealOnScroll>
  );
}

// ---------------------------------------------------------------------------
// 8. Editorial Footer (pre-footer content strip above the shared <Footer />)
// ---------------------------------------------------------------------------

function EditorialFooter() {
  const productLinks = [
    { label: 'Search', href: '/search' },
    { label: 'My Names', href: '/names' },
    { label: 'Pricing', href: '/#pricing' },
  ];
  const resourceLinks = [
    { label: 'Docs', href: 'https://docs.kiteid.xyz', external: true },
    { label: 'Faucet', href: 'https://faucet.gokite.ai/', external: true },
    { label: 'Explorer', href: 'https://kitescan.ai', external: true },
  ];
  const communityLinks = [
    { label: 'GitHub', href: 'https://github.com/KiteID', external: true },
    { label: 'Status', href: 'https://status.kiteid.xyz', external: true },
  ];

  return (
    <section className="bg-cream">
      <div className="editorial-rule" />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        {/* Left: wordmark + copyright */}
        <div>
          <Link href="/" className="inline-block">
            <span className="text-3xl font-normal tracking-tight text-carbon">
              Kite<span className="font-extrabold text-gold-deep">ID</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-stone">
            The naming service for the Kite AI network. Your name, as a parchment dossier.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold-deep">
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-gold" />
              Testnet
            </span>
          </div>
        </div>

        {/* Center: link columns */}
        <FooterColumn title="Product" links={productLinks} />
        <FooterColumn title="Resources" links={resourceLinks} />
        <FooterColumn title="Community" links={communityLinks} />
      </div>
    </section>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-bronze">{title}</p>
      <ul className="space-y-2.5">
        {links.map((link) =>
          link.external ? (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-graphite transition-colors hover:text-gold"
              >
                {link.label}
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} aria-hidden="true" />
              </a>
            </li>
          ) : (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm text-graphite transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
