'use client';

import { motion } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import HeroMockup from '@/components/about/HeroMockup';

export default function AboutHero() {
  return (
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
  );
}
