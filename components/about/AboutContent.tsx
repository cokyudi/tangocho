'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ThemeSwitch from '@/components/ThemeSwitch';
import Reveal from '@/components/about/Reveal';
import HeroMockup from '@/components/about/HeroMockup';
import SourceMarquee from '@/components/about/SourceMarquee';
import ScreenshotCarousel, { type Shot } from '@/components/about/ScreenshotCarousel';

const shots: Shot[] = [
  { src: '/screenshots/capture.png', alt: 'Capture screen auto-filling a word', caption: 'Capture · AI auto-fill' },
  { src: '/screenshots/browse.png', alt: 'Browse list with filters', caption: 'Browse · filter & search' },
  { src: '/screenshots/detail.png', alt: 'Word detail with furigana example', caption: 'Detail · meaning, example, source' },
  { src: '/screenshots/practice.png', alt: 'Practice flashcard', caption: 'Practice · SM-2 flashcards' },
  { src: '/screenshots/progress.png', alt: 'Progress dashboard', caption: 'Progress · mastery & streak' },
  { src: '/screenshots/home.png', alt: 'Home dashboard', caption: 'Home · at a glance' },
];

const features = [
  { title: 'Capture', jp: '取り込む', body: 'Type a word; Jisho + Gemini auto-fill the reading, Indonesian & English meanings, and an example. Tag where you heard it.' },
  { title: 'Browse', jp: '一覧', body: 'Every word as a table or bento grid, with furigana. Filter by source, mastery, or what’s due. Tap for full detail.' },
  { title: 'Practice', jp: '復習', body: 'SM-2 spaced-repetition flashcards. Flip, rate forgot / hard / easy, and the app schedules the next review.' },
];

const stack = [
  'Next.js 16 (App Router)',
  'TypeScript',
  'Supabase Postgres + RLS',
  'Google OAuth',
  'Vercel AI SDK + Gemini',
  'Jisho API',
  'SM-2 algorithm',
  'Tailwind CSS',
  'PWA',
];

export default function AboutContent() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
        <span className="font-display text-xl font-bold text-ink">
          tangocho<span className="ml-1 text-accent">単語帳</span>
        </span>
        <ThemeSwitch />
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-14 px-4 pb-16 pt-6">
        {/* Hero */}
        <Reveal>
          <section className="grid items-center gap-8 sm:grid-cols-[1.2fr_1fr]">
            <div className="space-y-5">
              <Badge variant="highlight">Personal project · 単語帳 = “vocabulary notebook”</Badge>
              <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
                Capture Japanese words the moment you hear them — and never{' '}
                <span className="relative inline-block">
                  <motion.span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0.5 h-[0.4em] bg-highlight"
                    style={{ transformOrigin: 'left' }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
                  />
                  <span className="relative">forget</span>
                </span>{' '}
                them.
              </h1>
              <p className="max-w-md text-lg text-muted">
                A single-user app I built to learn Japanese while living in Japan: fast AI-assisted
                capture, the memory of where each word came from, and spaced-repetition review.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button href="/login">Sign in</Button>
                <Button href="https://yudidputra.com" variant="neutral">
                  Portfolio ↗
                </Button>
              </div>
              <p className="text-sm text-muted">
                It’s a private, single-account app (email allowlist) — this page is the tour.
              </p>
            </div>
            <HeroMockup />
          </section>
        </Reveal>

        {/* Source marquee */}
        <Reveal>
          <SourceMarquee />
        </Reveal>

        {/* Features */}
        <section className="grid gap-4 sm:grid-cols-3">
          {features.map((f, i) => (
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
            <h2 className="font-display text-2xl font-bold text-ink">See it in action</h2>
            <ScreenshotCarousel shots={shots} />
          </section>
        </Reveal>

        {/* How it's built */}
        <Reveal>
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-ink">How it’s built</h2>
            <Card className="space-y-4 p-5">
              <p className="text-muted">
                A full-stack PWA on entirely free tiers. Words are auto-enriched by a{' '}
                <span className="font-bold text-ink">Jisho → Gemini fallback</span> pipeline, review
                scheduling uses a hand-implemented <span className="font-bold text-ink">SM-2</span>{' '}
                algorithm, and every row is protected by Postgres{' '}
                <span className="font-bold text-ink">row-level security</span> with a single-user
                Google OAuth allowlist.
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
          Built by{' '}
          <Link href="https://yudidputra.com" className="font-display font-bold text-accent">
            Yudi Dharma Putra
          </Link>
          .
        </footer>
      </main>
    </div>
  );
}
