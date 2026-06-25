import Link from 'next/link';
import type { Metadata } from 'next';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ThemeSwitch from '@/components/ThemeSwitch';

export const metadata: Metadata = {
  title: 'tangocho — Japanese vocabulary notebook',
  description:
    'A personal Japanese vocabulary tracker: capture words with AI auto-fill, remember where you learned them, and review with spaced repetition.',
};

const features = [
  {
    title: 'Capture',
    jp: '取り込む',
    body: 'Type a word; Jisho + Gemini auto-fill the reading, Indonesian & English meanings, and an example. Tag where you heard it — a drama, a friend, a tweet.',
  },
  {
    title: 'Browse',
    jp: '一覧',
    body: 'Every word as a table or bento grid, with furigana. Filter by source, mastery level, or what’s due. Edit inline.',
  },
  {
    title: 'Practice',
    jp: '復習',
    body: 'SM-2 spaced-repetition flashcards. Flip, rate forgot / hard / easy, and the app schedules the next review so words actually stick.',
  },
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

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
        <span className="font-display text-xl font-bold text-ink">
          tangocho<span className="ml-1 text-accent">単語帳</span>
        </span>
        <ThemeSwitch />
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-12 px-4 pb-16 pt-8">
        {/* Hero */}
        <section className="space-y-5">
          <Badge variant="highlight">Personal project · 単語帳 = “vocabulary notebook”</Badge>
          <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Capture Japanese words the moment you hear them — and never forget them.
          </h1>
          <p className="max-w-xl text-lg text-muted">
            A single-user app I built to learn Japanese while living in Japan: fast AI-assisted
            capture, the source memory of where each word came from, and spaced-repetition review.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/login">Sign in</Button>
            <Button href="https://yudidputra.com" variant="neutral">
              Portfolio ↗
            </Button>
          </div>
          <p className="text-sm text-muted">
            It’s a private, single-account app (email allowlist), so sign-in is limited to me — this
            page is the tour.
          </p>
        </section>

        {/* Features */}
        <section className="grid gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="space-y-2 p-5">
              <h2 className="font-display text-lg font-bold text-ink">
                {f.title} <span className="font-jp text-sm text-accent">{f.jp}</span>
              </h2>
              <p className="text-sm text-muted">{f.body}</p>
            </Card>
          ))}
        </section>

        {/* How it's built */}
        <section className="space-y-4">
          <h2 className="font-display text-2xl font-bold text-ink">How it’s built</h2>
          <Card className="space-y-4 p-5">
            <p className="text-muted">
              A full-stack PWA on entirely free tiers. Words are auto-enriched by a{' '}
              <span className="font-bold text-ink">Jisho → Gemini fallback</span> pipeline (Jisho for
              reliable readings, Gemini for the Indonesian meaning, examples, and slang). Review
              scheduling uses a hand-implemented <span className="font-bold text-ink">SM-2</span>{' '}
              algorithm. Every row is protected by Postgres{' '}
              <span className="font-bold text-ink">row-level security</span>, with a single-user
              Google OAuth allowlist enforced in middleware.
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
