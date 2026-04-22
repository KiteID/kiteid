'use client';

import { Button } from '@kiteid/ui';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { MagneticButton } from '@/components/motion';

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-16 sm:px-6">
      {/* Broken grain decoration — rotated rhombus */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-72 w-72 rotate-[22deg] rounded-3xl bg-gradient-bronze opacity-20 blur-3xl" />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-10 h-40 w-40 rotate-12 border-2 border-dashed border-sand-core opacity-50"
      />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-bronze">
          KITEID · ERROR · 500
        </p>

        <h1 className="mt-6 font-display text-5xl leading-[1.05] text-carbon sm:text-6xl">
          Something went
          <br />
          <span className="text-gradient-gold">parchment-side.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-graphite">
          An unexpected error occurred. The KiteID team has been notified and is looking into it.
        </p>

        {isDev && error?.message && (
          <details className="mx-auto mt-8 max-w-lg rounded-xl border border-sand-core bg-parchment p-4 text-left">
            <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-bronze">
              Error details (dev only)
            </summary>
            <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-graphite">
              {error.message}
              {error.stack ? `\n\n${error.stack}` : ''}
            </pre>
          </details>
        )}

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <MagneticButton
            onClick={reset}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-carbon px-8 font-medium text-cream shadow-kid-md transition-shadow hover:shadow-kid-lg"
          >
            Try again
          </MagneticButton>
          <a href="/">
            <Button variant="outline" className="min-h-[48px] border-sand-core px-6">
              Go home
            </Button>
          </a>
        </div>

        <div className="mx-auto mt-12 editorial-rule max-w-xs" />
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-stone">
          If the problem persists, check status.kiteid.xyz
        </p>
      </div>
    </main>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (props: ErrorFallbackProps) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // TODO: wire GlitchTip/Sentry capture here in Phase 4
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      const fallback = this.props.fallback;
      if (fallback) {
        return fallback({ error: this.state.error, reset: this.reset });
      }
      return <ErrorFallback error={this.state.error} reset={this.reset} />;
    }
    return this.props.children;
  }
}
