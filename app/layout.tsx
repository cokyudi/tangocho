import '../styles/globals.css';
import { GeistSans } from 'geist/font/sans';
import { Noto_Sans_JP, Space_Grotesk } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import Providers from '@/app/providers';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  applicationName: 'tangocho',
  title: {
    default: 'tangocho 単語帳',
    template: '%s | tangocho',
  },
  description: 'Personal Japanese vocabulary notebook — capture, browse, and review words with spaced repetition.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'tangocho',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf6ec' },
    { media: '(prefers-color-scheme: dark)', color: '#15130d' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      suppressHydrationWarning
      className={`h-full ${GeistSans.variable} ${notoSansJP.variable} ${spaceGrotesk.variable}`}
    >
      <body suppressHydrationWarning className="flex min-h-screen flex-col font-sans">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border-2 focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-ink focus:shadow-retro"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-6">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
