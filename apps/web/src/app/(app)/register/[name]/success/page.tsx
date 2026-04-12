'use client';

import { normalizeLabel } from '@kiteid/sdk';
import { Button, Card, CardContent } from '@kiteid/ui';
import Link from 'next/link';
import { use } from 'react';
import { TLD } from '@/lib/constants';

interface SuccessPageProps {
  params: Promise<{ name: string }>;
}

export default function SuccessPage({ params }: SuccessPageProps) {
  const { name: rawName } = use(params);
  const name = normalizeLabel(decodeURIComponent(rawName));

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Card>
        <CardContent className="space-y-6 p-8 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
              <svg
                className="h-8 w-8 text-gold"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Success</title>
                <path
                  d="M20 6L9 17L4 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-carbon">Congratulations!</h1>
            <p className="text-bronze">You have successfully registered</p>
            <p className="text-xl font-semibold text-carbon">
              {name}
              <span className="text-gold">{TLD}</span>
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button asChild size="lg" className="w-full bg-gold text-cream hover:bg-bronze">
              <Link href={`/name/${encodeURIComponent(name)}`}>Manage Name</Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/search">Register Another</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
