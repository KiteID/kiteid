import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream">
      <h1 className="text-6xl font-bold text-gold">404</h1>
      <p className="mt-4 text-lg text-bronze">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-gold px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-bronze"
      >
        Go Home
      </Link>
    </main>
  );
}
