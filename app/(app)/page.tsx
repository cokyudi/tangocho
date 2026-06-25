import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Furigana from '@/components/Furigana';
import { createClient } from '@/lib/supabase/server';
import { masteryLevel, isDue } from '@/lib/mastery';

export default async function Home() {
  const supabase = await createClient();
  const { data: words } = await supabase
    .from('words')
    .select('id, term, reading, meaning_id, meaning_en, repetitions, interval, due_date, created_at')
    .order('created_at', { ascending: false });

  const all = words ?? [];
  const dueCount = all.filter((w) => isDue(w)).length;
  const masteredCount = all.filter((w) => masteryLevel(w) === 'mastered').length;
  const recent = all.slice(0, 5);

  const stats = [
    { label: 'Words', value: all.length },
    { label: 'Due now', value: dueCount },
    { label: 'Mastered', value: masteredCount },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-ink">
          おかえり <span className="text-accent">👋</span>
        </h1>
        <p className="text-muted">Capture a word the moment you hear it.</p>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col items-center gap-1 p-4">
            <span className="font-display text-2xl font-bold text-ink">{s.value}</span>
            <span className="text-center text-xs text-muted">{s.label}</span>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Button href="/capture" className="flex-1">
          + Add a word
        </Button>
        <Button href="/practice" variant="neutral" className="flex-1">
          {dueCount > 0 ? `Practice (${dueCount} due)` : 'Start practice'}
        </Button>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Recently added</h2>
          {all.length > 0 && (
            <Link href="/browse" className="font-display text-sm font-bold text-accent">
              See all →
            </Link>
          )}
        </div>
        {recent.length === 0 ? (
          <Card className="p-6 text-center text-muted">
            <p>No words yet.</p>
            <Link href="/capture" className="mt-2 inline-block font-display font-bold text-accent">
              Add your first word →
            </Link>
          </Card>
        ) : (
          <Card className="divide-y-2 divide-ink/15">
            {recent.map((w) => (
              <Link
                key={w.id}
                href="/browse"
                className="flex items-center justify-between gap-3 p-3 hover:bg-ink/5"
              >
                <Furigana term={w.term} reading={w.reading} className="text-lg text-ink" />
                <span className="truncate text-sm text-muted">{w.meaning_id || w.meaning_en || ''}</span>
              </Link>
            ))}
          </Card>
        )}
      </section>

      {all.length === 0 && (
        <p className="text-center">
          <Badge variant="highlight">Capture your first word to get started</Badge>
        </p>
      )}
    </div>
  );
}
