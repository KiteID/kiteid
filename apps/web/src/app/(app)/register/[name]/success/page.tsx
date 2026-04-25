'use client';

import { normalizeLabel } from '@kiteid/sdk';
import { ArrowRight, CheckCircle2, Share2 } from 'lucide-react';
import Link from 'next/link';
import { use, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';
import { FadeIn, MagneticButton } from '@/components/motion';
import { CopyAddress } from '@/components/ui/copy-address';
import { celebrationConfetti } from '@/lib/confetti';
import { TLD } from '@/lib/constants';

interface SuccessPageProps {
  params: Promise<{ name: string }>;
}

// Drifting leaf SVG for the background
function DriftingLeaf({
  delay,
  left,
  duration,
  rotate,
  fill,
  size,
}: {
  delay: number;
  left: string;
  duration: number;
  rotate: number;
  fill: string;
  size: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="pointer-events-none absolute top-[-60px] animate-[leaf-drift_var(--d)_linear_infinite]"
      style={
        {
          left,
          '--d': `${duration}s`,
          animationDelay: `${delay}s`,
          opacity: 0.4,
          transform: `rotate(${rotate}deg)`,
        } as React.CSSProperties
      }
    >
      <title>Decorative leaf</title>
      <path
        d="M12 2c5 3 8 7 8 12 0 4-3 7-8 8-5-1-8-4-8-8 0-5 3-9 8-12z"
        fill={fill}
        opacity="0.5"
      />
      <path d="M12 4v16" stroke={fill} strokeWidth="0.6" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export default function SuccessPage({ params }: SuccessPageProps) {
  const { name: rawName } = use(params);
  const name = normalizeLabel(decodeURIComponent(rawName));
  const { address, chain } = useAccount();

  // Fire confetti once on mount
  useEffect(() => {
    const t = setTimeout(() => celebrationConfetti(), 150);
    return () => clearTimeout(t);
  }, []);

  const expiryDate = useMemo(() => {
    // Registration duration not passed through here — default to 1yr expiry from today.
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }, []);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/names/${name}` : '';
  const chainLabel = chain?.name ?? 'Kite Testnet';

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="relative min-h-[85vh] overflow-hidden">
      {/* Drifting leaves background — subtle */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <DriftingLeaf delay={0} left="8%" duration={22} rotate={15} fill="#C9986A" size={18} />
        <DriftingLeaf delay={3} left="22%" duration={28} rotate={-10} fill="#9B8564" size={14} />
        <DriftingLeaf delay={6} left="38%" duration={24} rotate={40} fill="#C9986A" size={20} />
        <DriftingLeaf delay={1.5} left="55%" duration={30} rotate={-25} fill="#A87C52" size={16} />
        <DriftingLeaf delay={8} left="70%" duration={26} rotate={5} fill="#C9986A" size={14} />
        <DriftingLeaf delay={4} left="84%" duration={32} rotate={-45} fill="#9B8564" size={18} />
        <DriftingLeaf delay={10} left="92%" duration={20} rotate={30} fill="#E8B987" size={12} />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-4xl flex-col items-center justify-center px-4 py-16 sm:px-6">
        {/* Label row */}
        <FadeIn delay={0.2}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-gold" strokeWidth={1.5} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-bronze">
              Registration Complete
            </span>
          </div>
        </FadeIn>

        {/* Top editorial rule */}
        <FadeIn delay={0.7}>
          <div className="mt-6 h-px w-48 bg-sand-core sm:w-64" />
        </FadeIn>

        {/* THE NAME */}
        <FadeIn delay={0.5} y={20}>
          <h1 className="mt-8 flex items-baseline justify-center font-display leading-none text-carbon">
            <span className="text-[clamp(4rem,15vw,9rem)]">{name}</span>
            <span className="gold-foil ml-2 text-[clamp(2.8rem,11vw,6.25rem)]">{TLD}</span>
          </h1>
        </FadeIn>

        {/* Bottom editorial rule */}
        <FadeIn delay={0.7}>
          <div className="mt-8 h-px w-48 bg-sand-core sm:w-64" />
        </FadeIn>

        {/* Metadata row */}
        <FadeIn delay={1.0}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-3 text-xs text-bronze sm:text-sm">
            <span className="flex items-center gap-1.5">
              <span className="uppercase tracking-[0.14em] text-stone">Owner</span>
              {address ? (
                <CopyAddress value={address} label="Address copied" />
              ) : (
                <span className="font-mono text-stone">—</span>
              )}
            </span>
            <span className="text-stone/50">·</span>
            <span className="flex items-center gap-1.5">
              <span className="uppercase tracking-[0.14em] text-stone">Expires</span>
              <span className="font-mono text-carbon">{expiryDate}</span>
            </span>
            <span className="text-stone/50">·</span>
            <span className="flex items-center gap-1.5">
              <span className="uppercase tracking-[0.14em] text-stone">Chain</span>
              <span className="font-mono text-carbon">{chainLabel}</span>
            </span>
          </div>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={1.2}>
          <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <Link href={`/names/${encodeURIComponent(name)}`}>
              <MagneticButton
                type="button"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-gold px-7 text-sm font-semibold text-cream shadow-kid-md transition-shadow hover:shadow-kid-glow"
              >
                Manage your name
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </MagneticButton>
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-sand-core bg-cream px-7 text-sm font-medium text-bronze transition-colors hover:bg-parchment hover:text-carbon"
            >
              Register another
            </Link>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Copy shareable link"
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-sand-core bg-cream text-bronze transition-colors hover:bg-parchment hover:text-carbon"
            >
              <Share2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
