import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_APP_URL || 'https://kiteid.xyz';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/search`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/activity`, lastModified: now, changeFrequency: 'hourly', priority: 0.6 },
    { url: `${base}/names`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${base}/profile`, lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
  ];
}
