import { Button } from '@kiteid/ui';
import Link from 'next/link';
import { FadeIn, MagneticButton } from '@/components/motion';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-16 sm:px-6">
      {/* Rhombus watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-[420px] w-[420px] rotate-45 rounded-3xl bg-gradient-gold opacity-10 blur-3xl" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-64 w-64 rotate-45 border border-dashed border-sand-core opacity-50" />
      </div>

      <div className="relative z-10 mx-auto max-w-xl text-center">
        <FadeIn>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-bronze">
            KITEID · NOT FOUND
          </p>
        </FadeIn>

        <FadeIn delay={0.08}>
          <h1 className="mt-6 font-display text-[8rem] font-medium leading-none tabular-nums text-gold sm:text-[10rem] lg:text-[12rem]">
            404
          </h1>
        </FadeIn>

        <FadeIn delay={0.16}>
          <h2 className="mt-4 font-display text-3xl leading-tight text-carbon sm:text-4xl">
            This name wasn&apos;t registered.
          </h2>
        </FadeIn>

        <FadeIn delay={0.24}>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-graphite">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </FadeIn>

        <FadeIn delay={0.32}>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/">
              <MagneticButton className="inline-flex h-12 items-center gap-2 rounded-xl bg-carbon px-8 font-medium text-cream shadow-kid-md transition-shadow hover:shadow-kid-lg">
                Go home
              </MagneticButton>
            </Link>
            <Link href="/search">
              <Button variant="outline" className="min-h-[48px] border-sand-core px-6">
                Search names
              </Button>
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="mx-auto mt-16 editorial-rule max-w-xs" />
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
            Kite Identity Registry · Chain 2368
          </p>
        </FadeIn>
      </div>
    </main>
  );
}
