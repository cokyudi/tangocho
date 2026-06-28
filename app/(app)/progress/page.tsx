import Link from 'next/link';
import { Download } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { masteryLevel, MASTERY_LABELS, MASTERY_LEVELS, type MasteryLevel } from '@/lib/mastery';

export const metadata = { title: 'Progress' };

const tokyoDay = (d: Date | string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date(d));

export default async function ProgressPage() {
  const supabase = await createClient();
  const [{ data: words }, { data: logs }] = await Promise.all([
    supabase.from('words').select('repetitions, interval'),
    supabase.from('review_logs').select('reviewed_at').order('reviewed_at', { ascending: false }),
  ]);

  const allWords = words ?? [];
  const allLogs = logs ?? [];

  // Mastery distribution
  const dist: Record<MasteryLevel, number> = { new: 0, learning: 0, young: 0, mature: 0, mastered: 0 };
  for (const w of allWords) dist[masteryLevel(w)]++;
  const maxDist = Math.max(1, ...MASTERY_LEVELS.map((l) => dist[l]));

  // Reviews per day, last 14 days (Tokyo)
  const counts = new Map<string, number>();
  for (const l of allLogs) {
    const d = tokyoDay(l.reviewed_at);
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  const days: { day: string; count: number; label: string }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = tokyoDay(d);
    days.push({ day: key, count: counts.get(key) ?? 0, label: key.slice(5) });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  // Current streak (consecutive days with >=1 review, tolerant of no review yet today)
  let streak = 0;
  const cursor = new Date(now);
  if (!counts.has(tokyoDay(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (counts.has(tokyoDay(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const stats = [
    { label: 'Words', value: allWords.length },
    { label: 'Reviews', value: allLogs.length },
    { label: 'Day streak', value: streak },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Progress</h1>
        <Link href="/" className="font-display text-sm font-bold text-accent">
          ← Home
        </Link>
      </div>

      <section className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col items-center gap-1 p-4">
            <span className="font-display text-2xl font-bold text-ink">{s.value}</span>
            <span className="text-center text-xs text-muted">{s.label}</span>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">Mastery</h2>
        <Card className="space-y-2 p-4">
          {MASTERY_LEVELS.map((l) => (
            <div key={l} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm text-muted">{MASTERY_LABELS[l]}</span>
              <div className="h-5 flex-1 border-2 border-ink bg-paper">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${(dist[l] / maxDist) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right font-display text-sm font-bold text-ink">{dist[l]}</span>
            </div>
          ))}
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-bold text-ink">Last 14 days</h2>
        <Card className="p-4">
          {allLogs.length === 0 ? (
            <p className="py-6 text-center text-muted">No reviews yet — start practicing.</p>
          ) : (
            <div className="flex h-32 items-end justify-between gap-1">
              {days.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full border-2 border-ink bg-accent"
                      style={{ height: `${Math.max(d.count ? 8 : 0, (d.count / maxDay) * 100)}%` }}
                      title={`${d.day}: ${d.count}`}
                    />
                  </div>
                  <span className="text-[9px] text-muted">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <p className="text-center">
        <Badge variant="neutral">Keep the streak alive 🔥</Badge>
      </p>

      <section className="space-y-3 border-t-2 border-ink/15 pt-6">
        <h2 className="font-display text-lg font-bold text-ink">Backup</h2>
        <Card className="flex items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted">
            Download all words, sources & review history as JSON.
          </p>
          <a
            href="/api/export"
            download
            className="inline-flex shrink-0 items-center gap-1.5 border-2 border-ink bg-surface px-3 py-2 font-display text-sm font-bold text-ink shadow-retro-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Download className="h-4 w-4" />
            Export
          </a>
        </Card>
      </section>
    </div>
  );
}
