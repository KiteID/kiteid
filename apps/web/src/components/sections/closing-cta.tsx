'use client';

import { ArrowRight, ExternalLink, Rocket } from 'lucide-react';
import { MagneticButton, RevealOnScroll } from '@/components/motion';

export function ClosingCta() {
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
