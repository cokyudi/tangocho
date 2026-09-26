'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Reveal from '@/components/about/Reveal';
import AboutHeader from '@/components/about/AboutHeader';
import ChangelogList from '@/components/about/ChangelogList';
import { changelog } from '@/constants/changelog';
import AboutHero from '@/components/about/AboutHero';
import AboutStory from '@/components/about/AboutStory';
import SourceMarquee from '@/components/about/SourceMarquee';
import ScreenshotCarousel from '@/components/about/ScreenshotCarousel';
import { useAboutLanguage } from '@/components/about/useAboutLanguage';

const SHOT_ORDER = ['home', 'capture', 'browse', 'detail', 'practice', 'speak', 'friends', 'progress'] as const;

const stack = [
  'Next.js 16 (App Router)',
  'TypeScript',
  'Supabase Postgres + RLS',
  'Google OAuth',
  'Vercel AI SDK + Gemini',
  'Jisho API',
  'SM-2 algorithm',
  'Web Speech API',
  'Web Push',
  'Vercel Cron',
  'Tailwind CSS',
  'PWA',
];

export default function AboutContent() {
  const { language, t, toggleLanguage } = useAboutLanguage();
  const shots = SHOT_ORDER.map((id) => ({ src: `/screenshots/${id}.png`, ...t.shots[id] }));

  return (
    <div className="min-h-screen">
      <AboutHeader toggle={t.toggle} onToggle={toggleLanguage} />

      <main className="mx-auto w-full max-w-3xl space-y-14 px-4 pb-16 pt-6">
        {/* Hero */}
        <Reveal>
          <AboutHero t={t.hero} />
        </Reveal>

        {/* Story: the paper notebook it replaces */}
        <Reveal>
          <AboutStory t={t.story} />
        </Reveal>

        {/* Source marquee */}
        <Reveal>
          <SourceMarquee />
        </Reveal>

        {/* Features */}
        <section className="grid gap-4 sm:grid-cols-2">
          {t.features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <Card className="h-full space-y-2 p-5 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5">
                <h2 className="font-display text-lg font-bold text-ink">
                  {f.title} <span className="font-jp text-sm text-accent">{f.jp}</span>
                </h2>
                <p className="text-sm text-muted">{f.body}</p>
              </Card>
            </Reveal>
          ))}
        </section>

        {/* Screenshots carousel */}
        <Reveal>
          <section className="space-y-5">
            <h2 className="font-display text-2xl font-bold text-ink">{t.seeIt}</h2>
            <ScreenshotCarousel shots={shots} labels={t.carousel} />
          </section>
        </Reveal>

        {/* What's new: latest few; the full list lives on /changelog */}
        <Reveal>
          <section className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-ink">
                {t.changelog.heading} <span className="font-jp text-base text-accent">{t.changelog.jp}</span>
              </h2>
              <Link
                href={language === 'ja' ? '/changelog?lang=ja' : '/changelog'}
                className="shrink-0 font-display text-sm font-bold text-accent"
              >
                {t.changelog.seeAll}
              </Link>
            </div>
            <Card className="p-5">
              <ChangelogList entries={changelog.slice(0, 3)} language={language} readPost={t.changelog.readPost} />
            </Card>
          </section>
        </Reveal>

        {/* How it's built */}
        <Reveal>
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-ink">{t.builtHeading}</h2>
            <Card className="space-y-4 p-5">
              <p className="text-muted">
                {t.built.map((seg, k) =>
                  k % 2 ? (
                    <span key={k} className="font-bold text-ink">
                      {seg}
                    </span>
                  ) : (
                    seg
                  ),
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {stack.map((s) => (
                  <Badge key={s} variant="neutral">
                    {s}
                  </Badge>
                ))}
              </div>
            </Card>
          </section>
        </Reveal>

        <footer className="border-t-2 border-ink/15 pt-6 text-sm text-muted">
          {t.footerBefore}
          <Link href="https://yudidputra.com" className="font-display font-bold text-accent">
            Yudi Dharma Putra
          </Link>
          {t.footerAfter}
        </footer>
      </main>
    </div>
  );
}
