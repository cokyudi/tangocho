import type { Metadata } from 'next';
import AboutContent from '@/components/about/AboutContent';

const BASE_URL = 'https://tangocho.yudidputra.com';
const description =
  'tangocho (単語帳) is a Japanese vocabulary tracker: capture words with AI auto-fill, remember where you learned them, get daily words from AI friends, review with SM-2 spaced repetition, and practise saying them out loud.';

export const metadata: Metadata = {
  title: 'tangocho — Japanese vocabulary tracker with spaced repetition',
  description,
  keywords: [
    'Japanese vocabulary tracker',
    'Japanese vocab app',
    '単語帳 app',
    'spaced repetition Japanese',
    'SM-2 flashcards',
    'learn Japanese vocabulary',
    'Jisho',
    'Japanese speaking practice',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'tangocho',
    title: 'tangocho — Japanese vocabulary tracker with spaced repetition',
    description,
    locale: 'en_US',
    images: [
      { url: '/screenshots/home.png', width: 500, height: 907, alt: 'tangocho home with today’s words from AI friends' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'tangocho — Japanese vocabulary tracker with spaced repetition',
    description,
    images: ['/screenshots/home.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'tangocho',
      alternateName: '単語帳',
      url: BASE_URL,
      description,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'WebSite',
      name: 'tangocho',
      url: BASE_URL,
      description,
      inLanguage: ['en', 'ja'],
    },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutContent />
    </>
  );
}
