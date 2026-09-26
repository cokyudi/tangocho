import Link from 'next/link';
import { Download, BookCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { MASTERY_LABELS, MASTERY_LEVELS } from '@/lib/mastery';
import { computeProgress, tokyoDay } from '@/lib/progress';

export const metadata = { title: 'Progress' };

export default async function ProgressPage() {
  const supabase = await createClient();
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 29);
  const since = tokyoDay(monthAgo);
  const [{ data: words }, { data: logs }, { data: suggestions }] = await Promise.all([
    supabase.from('words').select('repetitions, interval'),
    supabase.from('review_logs').select('reviewed_at').order('reviewed_at', { ascending: false }),
    supabase.from('daily_suggestions').select('status').gte('date', since).neq('status', 'pending'),
  ]);

  const allWords = words ?? [];
  const allLogs = logs ?? [];

  const { dist, maxDist, days, maxDay, streak } = computeProgress(allWords, allLogs);

  // Friend words, last 30 days. Mostly skipped = picks miss the mark (a RAG trigger, see SPEC).
  const decided = suggestions ?? [];
  const friendStats = (['saved', 'known', 'skipped'] as const).map((status) => ({
    label: status[0].toUpperCase() + status.slice(1),
    value: decided.filter((s) => s.status === status).length,
  }));
  const saveRate = decided.length ? Math.round((friendStats[0].value / decided.length) * 100) : null;

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
            <div className="flex items-end justify-between gap-1">
              {days.map((d) => {
                // h-24 is a definite height, so the bar's % height resolves.
                const pct = d.count ? Math.max(8, (d.count / maxDay) * 100) : 0;
                return (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex h-24 w-full flex-col justify-end">
                      {d.count > 0 && (
                        <>
                          {/* Short bars can't hold the number, so it sits above. */}
                          {pct < 25 && (
                            <span className="text-center text-[10px] font-bold leading-none text-ink">
                              {d.count}
                            </span>
                          )}
                          <div
                            className="flex w-full justify-center border-2 border-ink bg-accent pt-0.5"
                            style={{ height: `${pct}%` }}
                            title={`${d.day}: ${d.count}`}
                          >
                            {pct >= 25 && (
                              <span className="text-[10px] font-bold leading-none text-on-accent">
                                {d.count}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <span className="text-[9px] text-muted">{d.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Friend words · 30 days</h2>
          <Link href="/friends" className="font-display text-sm font-bold text-accent">
            Friends →
          </Link>
        </div>
        <Card className="space-y-3 p-4">
          {decided.length === 0 ? (
            <p className="py-2 text-center text-muted">No friend words decided yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 text-center">
                {friendStats.map((s) => (
                  <div key={s.label}>
                    <span className="block font-display text-2xl font-bold text-ink">{s.value}</span>
                    <span className="text-xs text-muted">{s.label}</span>
                  </div>
                ))}
              </div>
              <p className="border-t-2 border-ink/15 pt-3 text-center text-sm text-muted">
                Save rate <span className="font-display font-bold text-ink">{saveRate}%</span>
              </p>
            </>
          )}
        </Card>
      </section>

      <p className="text-center">
        <Badge variant="neutral">Keep the streak alive</Badge>
      </p>

      <section className="space-y-3 border-t-2 border-ink/15 pt-6">
        <h2 className="font-display text-lg font-bold text-ink">Backup & data</h2>
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
        <Card className="flex items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted">
            Re-check saved words against Jisho (reading, part of speech, JLPT).
          </p>
          <Link
            href="/recheck"
            className="inline-flex shrink-0 items-center gap-1.5 border-2 border-ink bg-surface px-3 py-2 font-display text-sm font-bold text-ink shadow-retro-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <BookCheck className="h-4 w-4" />
            Re-check
          </Link>
        </Card>
      </section>
    </div>
  );
}
