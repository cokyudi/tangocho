import type { MetadataRoute } from 'next';

const BASE_URL = 'https://tangocho.yudidputra.com';

// Only the public showcase, served at the bare domain.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE_URL, lastModified: now, changeFrequency: 'monthly', priority: 1 },
  ];
}
