'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import AboutHeader from '@/components/about/AboutHeader';
import ChangelogList, { formatDate } from '@/components/about/ChangelogList';
import { useAboutLanguage } from '@/components/about/useAboutLanguage';
import { changelog, type ChangelogEntry } from '@/constants/changelog';

// Entries are newest first, so grouping by YYYY-MM keeps month order.
const byMonth = changelog.reduce<Map<string, ChangelogEntry[]>>((m, e) => {
  const key = e.date.slice(0, 7);
  m.set(key, [...(m.get(key) ?? []), e]);
  return m;
}, new Map());

export default function ChangelogContent() {
  const { language, t, toggleLanguage } = useAboutLanguage();

  return (
    <div className="min-h-screen">
      <AboutHeader toggle={t.toggle} onToggle={toggleLanguage} />
      <main className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-16 pt-6">
        <section className="space-y-2">
          <Link href="/about" className="font-display text-sm font-bold text-accent">
            {t.changelog.back}
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink">
            {t.changelog.pageTitle}{' '}
            {language === 'en' && <span className="font-jp text-lg text-accent">{t.changelog.jp}</span>}
          </h1>
          <p className="text-muted">{t.changelog.pageIntro}</p>
        </section>

        {[...byMonth].map(([month, entries]) => (
          <section key={month} className="space-y-3">
            <h2 className="font-display text-lg font-bold text-ink">
              {formatDate(`${month}-01`, language, { year: 'numeric', month: 'long' })}
            </h2>
            <Card className="p-5">
              <ChangelogList entries={entries} language={language} readPost={t.changelog.readPost} />
            </Card>
          </section>
        ))}
      </main>
    </div>
  );
}
