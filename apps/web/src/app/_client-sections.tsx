'use client';

import type React from 'react';

import {
  AnimatedCounter,
  FadeIn,
  MagneticButton,
  RevealOnScroll,
  Stagger,
  StaggerItem,
} from '@/components/motion';

export function HeroSection({ children }: { children: React.ReactNode }) {
  return <FadeIn>{children}</FadeIn>;
}

export function HowItWorksGrid({ children }: { children: React.ReactNode }) {
  return (
    <FadeIn delay={0.1}>
      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Stagger>{children}</Stagger>
      </div>
    </FadeIn>
  );
}

export function HowItWorksCard({ children }: { children: React.ReactNode }) {
  return <StaggerItem>{children}</StaggerItem>;
}

export function PricingGrid({ children }: { children: React.ReactNode }) {
  return (
    <FadeIn delay={0.15}>
      <div className="mt-12 grid gap-8 lg:grid-cols-3">{children}</div>
    </FadeIn>
  );
}

export function FAQSection({ children }: { children: React.ReactNode }) {
  return (
    <FadeIn delay={0.2}>
      <div className="mx-auto max-w-2xl">{children}</div>
    </FadeIn>
  );
}

export function RecentActivitySection({ children }: { children: React.ReactNode }) {
  return <RevealOnScroll>{children}</RevealOnScroll>;
}

export function StatsCounter({ value, className }: { value: number; className: string }) {
  return <AnimatedCounter value={value} className={className} />;
}

export function MagneticButtonClient({
  onClick,
  className,
  children,
}: {
  onClick?: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <MagneticButton onClick={onClick} className={className}>
      {children}
    </MagneticButton>
  );
}
