import type { MetadataRoute } from 'next';

const BASE_URL = 'https://tangocho.yudidputra.com';

// The public showcase is served at the bare domain `/`. Everything auth-gated,
// plus API and auth callbacks, stays out of the index. `/about` is the internal
// rewrite target for `/`, blocked here so it isn't indexed as a duplicate.
const disallow = [
  '/about',
  '/api/',
  '/auth/',
  '/browse',
  '/capture',
  '/practice',
  '/progress',
  '/login',
  '/denied',
  '/offline',
];

// Major AI crawlers get the same scoped access as general search engines.
const aiCrawlers = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: aiCrawlers, allow: '/', disallow },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
