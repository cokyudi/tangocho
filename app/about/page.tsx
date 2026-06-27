import type { Metadata } from 'next';
import AboutContent from '@/components/about/AboutContent';

export const metadata: Metadata = {
  title: 'tangocho — Japanese vocabulary notebook',
  description:
    'A personal Japanese vocabulary tracker: capture words with AI auto-fill, remember where you learned them, and review with spaced repetition.',
};

export default function AboutPage() {
  return <AboutContent />;
}
