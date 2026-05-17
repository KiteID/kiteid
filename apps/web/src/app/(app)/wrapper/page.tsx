'use client';

import { Button } from '@kiteid/ui';
import { ArrowRight, Code, Lock, Network, Zap } from 'lucide-react';
import Link from 'next/link';
import { FadeIn, MagneticButton, RevealOnScroll, Stagger, StaggerItem } from '@/components/motion';

const WRAPPER_FEATURES = [
  {
    icon: Code,
    title: 'Programmable Names',
    description: 'Use names as contracts. Write custom logic for domain behavior.',
  },
  {
    icon: Network,
    title: 'Subdomain Management',
    description: 'Create unlimited subdomains with independent resolvers and metadata.',
  },
  {
    icon: Lock,
    title: 'Decentralized Control',
    description: 'True self-custody. Your names, your rules, no intermediaries.',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Instant metadata propagation. Update records and see live changes.',
  },
];

const METADATA_FIELDS = [
  { key: 'avatar', value: 'ipfs://QmX...' },
  { key: 'description', value: 'Digital identity' },
  { key: 'url', value: 'https://example.com' },
  { key: 'email', value: 'owner@example.com' },
  { key: 'twitter', value: '@username' },
  { key: 'github', value: 'username' },
];

function FeatureCard({ icon: Icon, title, description }: (typeof WRAPPER_FEATURES)[0]) {
  return (
    <div className="rounded-2xl border border-sand-core bg-cream p-6 shadow-kid-sm transition-shadow hover:shadow-kid-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gold/10">
        <Icon className="h-6 w-6 text-gold-deep" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-xl text-carbon">{title}</h3>
      <p className="mt-2 text-sm text-stone">{description}</p>
    </div>
  );
}

function MetadataViewer() {
  return (
    <div className="rounded-2xl border border-sand-core bg-parchment p-6">
      <h3 className="font-display text-lg text-carbon">Metadata Example</h3>
      <p className="mt-1 text-xs text-bronze">dapp.kite v2</p>

      <div className="mt-6 space-y-3 font-mono text-[13px]">
        {METADATA_FIELDS.map((field) => (
          <div key={field.key} className="flex items-start justify-between">
            <span className="text-bronze">{field.key}</span>
            <span className="max-w-xs truncate text-right text-carbon">{field.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-sand-core pt-4">
        <p className="text-xs text-stone">
          All metadata updates are persisted on-chain and resolved in real-time across the Kite
          ecosystem.
        </p>
      </div>
    </div>
  );
}

function SubdomainDemo() {
  return (
    <div className="rounded-2xl border border-sand-core bg-cream p-6">
      <h3 className="font-display text-lg text-carbon">Subdomain Structure</h3>
      <p className="mt-1 text-xs text-bronze">Hierarchical ownership</p>

      <div className="mt-6 space-y-3 font-mono text-sm">
        <div className="flex items-center justify-between rounded-lg bg-parchment p-3">
          <span className="text-carbon">dapp.kite</span>
          <span className="text-xs text-gold">Root</span>
        </div>

        <div className="ml-6 flex items-center justify-between rounded-lg bg-parchment p-3 opacity-80">
          <span className="text-bronze">api.dapp.kite</span>
          <span className="text-xs text-gold-deep">Level 1</span>
        </div>

        <div className="ml-12 flex items-center justify-between rounded-lg bg-parchment p-3 opacity-60">
          <span className="text-stone">v1.api.dapp.kite</span>
          <span className="text-xs text-gold-deep">Level 2</span>
        </div>
      </div>

      <div className="mt-6 border-t border-sand-core pt-4">
        <p className="text-xs text-stone">
          Each subdomain can have its own resolver, owner, and metadata. Create hierarchies without
          limits.
        </p>
      </div>
    </div>
  );
}

function ENSCompatibility() {
  return (
    <div className="rounded-2xl border border-sand-core bg-cream p-6">
      <h3 className="font-display text-lg text-carbon">ENS Compatibility</h3>
      <p className="mt-1 text-xs text-bronze">Design inspired by Ethereum Name Service</p>

      <div className="mt-6 space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold/20">
            <span className="h-2 w-2 rounded-full bg-gold" />
          </span>
          <div>
            <p className="font-medium text-carbon">Registrar Pattern</p>
            <p className="mt-1 text-xs text-stone">Similar commit-reveal and auction mechanics</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold/20">
            <span className="h-2 w-2 rounded-full bg-gold" />
          </span>
          <div>
            <p className="font-medium text-carbon">Resolver Standard</p>
            <p className="mt-1 text-xs text-stone">
              Extensible resolver interface for any record type
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold/20">
            <span className="h-2 w-2 rounded-full bg-gold" />
          </span>
          <div>
            <p className="font-medium text-carbon">Ownership Model</p>
            <p className="mt-1 text-xs text-stone">
              NFT-based domain ownership with transfer capabilities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WrapperPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <FadeIn>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-bronze">
          KITEID · V2 PREVIEW
        </p>
        <h1 className="mt-4 font-display text-5xl leading-[1.05] text-carbon sm:text-6xl">
          NameWrapper:
          <br />
          <span className="text-gradient-gold">The next evolution.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-graphite">
          Smart contract wrappers for .kite names. Bring programmability, metadata richness, and
          true decentralized control to your digital identity.
        </p>

        <div className="mt-8 editorial-rule" />
      </FadeIn>

      {/* Features Grid */}
      <FadeIn delay={0.1}>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2">
          {WRAPPER_FEATURES.map((feature) => (
            <StaggerItem key={feature.title}>
              <FeatureCard {...feature} />
            </StaggerItem>
          ))}
        </Stagger>
      </FadeIn>

      {/* Demo Sections */}
      <div className="mt-16 space-y-8">
        <RevealOnScroll>
          <h2 className="font-display text-3xl text-carbon">How It Works</h2>
        </RevealOnScroll>

        <div className="grid gap-8 lg:grid-cols-3">
          <RevealOnScroll delay={0.1}>
            <MetadataViewer />
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <SubdomainDemo />
          </RevealOnScroll>

          <RevealOnScroll delay={0.3}>
            <ENSCompatibility />
          </RevealOnScroll>
        </div>
      </div>

      {/* Live on Testnet CTA */}
      <FadeIn delay={0.2}>
        <div className="mt-16 rounded-2xl border border-gold/30 bg-gold/5 p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-gold-deep">
            Phase 6.1 · Live on Kite Testnet
          </p>
          <h3 className="mt-4 font-display text-3xl text-carbon">Wrap your .kite name now</h3>
          <p className="mt-4 text-sm text-graphite">
            KiteWrapper is deployed on testnet (chain 2368). Register a name, open it from your
            dashboard, and use the Wrap dialog to lock fuses and bind a passport commitment.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link href="/names">
              <MagneticButton className="inline-flex h-12 items-center gap-2 rounded-xl bg-carbon px-8 font-medium text-cream shadow-kid-md transition-shadow hover:shadow-kid-lg">
                Try wrapping a name
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </MagneticButton>
            </Link>

            <Link href="/activity">
              <Button variant="outline" className="min-h-[44px] border-sand-core">
                Explore the timeline
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>
    </main>
  );
}
