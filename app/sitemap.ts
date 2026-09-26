import type { MetadataRoute } from 'next';

const BASE_URL = 'https://tangocho.yudidputra.com';

// The public showcase (served at the bare domain) and its update history.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE_URL, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/changelog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
  ];
}
