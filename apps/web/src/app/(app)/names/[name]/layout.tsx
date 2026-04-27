import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kiteid.xyz';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const title = `${decodedName}.kite`;
  const ogUrl = `${siteUrl}/api/og/${encodeURIComponent(decodedName)}`;

  return {
    title,
    description: `View and manage ${decodedName}.kite on KiteID — decentralized identity on Kite AI.`,
    openGraph: {
      title,
      description: `${decodedName}.kite — registered on KiteID`,
      url: `${siteUrl}/names/${encodeURIComponent(decodedName)}`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: `${decodedName}.kite` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `${decodedName}.kite — registered on KiteID`,
      images: [ogUrl],
    },
  };
}

export default function NameLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
