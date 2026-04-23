import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KiteID',
    short_name: 'KiteID',
    description: 'Your identity on Kite AI. Register .kite names.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf7f0',
    theme_color: '#c9986a',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  };
}
