import type { MetadataRoute } from 'next';

// Minimal manifest for installability. Icons are added in Phase 5.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'tangocho — Japanese vocabulary notebook',
    short_name: 'tangocho',
    description: 'Capture, browse, and review Japanese words with spaced repetition.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf6ec',
    theme_color: '#faf6ec',
    lang: 'ja',
  };
}
