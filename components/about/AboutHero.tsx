'use client';

import { motion } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import HeroMockup from '@/components/about/HeroMockup';
import type { AboutCopy } from '@/constants/aboutCopy';

export default function AboutHero({ t }: { t: AboutCopy['hero'] }) {
  return (
    <section className="grid items-center gap-8 sm:grid-cols-[1.2fr_1fr]">
      <div className="space-y-5">
        <Badge variant="highlight">{t.badge}</Badge>
        <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
          {t.titleBefore}
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
            <span className="relative">{t.titleHighlight}</span>
          </span>
          {t.titleAfter}
        </h1>
        <p className="max-w-md text-lg text-muted">
          {t.body}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href="/login">{t.signIn}</Button>
          <Button href="https://yudidputra.com" variant="neutral">
            {t.portfolio}
          </Button>
        </div>
        <p className="text-sm text-muted">
          {t.private}
        </p>
      </div>
      <HeroMockup alts={t.mockupAlts} />
    </section>
  );
}
