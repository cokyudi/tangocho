import '../styles/globals.css';
import { GeistSans } from 'geist/font/sans';
import { Noto_Sans_JP, Space_Grotesk } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import Providers from '@/app/providers';

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
          {children}
        </Providers>
      </body>
    </html>
  );
}
