import type { Metadata } from 'next';
import ChangelogContent from '@/components/about/ChangelogContent';

export const metadata: Metadata = {
  title: 'Updates · 更新履歴',
  description: 'Every feature added to tangocho (単語帳), the Japanese vocabulary tracker, newest first.',
  alternates: { canonical: '/changelog' },
};

export default function ChangelogPage() {
  return <ChangelogContent />;
}
