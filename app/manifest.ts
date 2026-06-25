import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'tangocho — Japanese vocabulary notebook',
    short_name: 'tangocho',
    description: 'Capture, browse, and review Japanese words with spaced repetition.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf6ec',
    theme_color: '#c43e1c',
    lang: 'ja',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
