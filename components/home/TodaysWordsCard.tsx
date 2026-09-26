'use client';

import Link from 'next/link';
import { Loader2, Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Furigana from '@/components/Furigana';
import FuriganaText from '@/components/FuriganaText';
import { useTodaysWords } from '@/components/home/useTodaysWords';
import type { Suggestion } from '@/lib/daily';

const STATUS_LABEL: Record<string, string> = { saved: 'Saved', known: 'Known', skipped: 'Skipped' };

export default function TodaysWordsCard({ suggestions }: { suggestions: Suggestion[] }) {
  const t = useTodaysWords();
  const pending = suggestions.filter((s) => s.status === 'pending').length;

  return (
    <Card className="divide-y-2 divide-ink/15">
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="text-sm text-muted">
          {pending ? 'Pick the words worth keeping.' : 'Done for today — new words tomorrow.'}
        </p>
        <Link href="/friends" className="shrink-0 font-display text-sm font-bold text-accent">
          Friends →
        </Link>
      </div>

      {suggestions.map((s) => {
        const open = s.status === 'pending';
        return (
          <div key={s.id} className={`flex gap-3 p-4 ${open ? '' : 'opacity-60'}`}>
            {open ? (
              <input
                type="checkbox"
                aria-label={`Save ${s.term}`}
                checked={t.selected.has(s.id)}
                onChange={() => t.toggleSelected(s.id)}
                className="mt-1.5 h-5 w-5 shrink-0 accent-accent"
              />
            ) : (
              <Check className="mt-1.5 h-5 w-5 shrink-0 text-muted" aria-hidden />
            )}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                <Furigana term={s.term} reading={s.reading} className="text-xl font-bold text-ink" />
                <span className="text-sm text-fg">{s.meaning_id || s.meaning_en}</span>
                {!open && <Badge>{STATUS_LABEL[s.status]}</Badge>}
              </div>
              <button
                type="button"
                onClick={() => t.toggleRevealed(s.id)}
                aria-expanded={t.revealed.has(s.id)}
                className="block text-left"
              >
                <span className="font-display text-xs font-bold text-accent">{s.friends?.name}: </span>
                <FuriganaText text={s.line_furigana ?? s.line_ja} className="text-sm text-fg" />
                {t.revealed.has(s.id) && <span className="mt-1 block text-sm text-muted">{s.line_en}</span>}
              </button>
            </div>
            {open && (
              <button
                type="button"
                onClick={() => t.known(s.id)}
                disabled={t.busy}
                className="h-fit shrink-0 border-2 border-ink bg-surface px-2 py-1 font-display text-xs font-bold text-fg shadow-retro-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                Known
              </button>
            )}
          </div>
        );
      })}

      {pending > 0 && (
        <div className="space-y-2 p-4">
          {t.error && <p className="text-sm font-display font-bold text-accent">{t.error}</p>}
          <div className="flex gap-3">
            <Button onClick={t.save} disabled={t.busy || !t.selected.size} className="flex-1">
              {t.busy ? <Loader2 className="h-5 w-5 animate-spin" /> : `Save selected (${t.selected.size})`}
            </Button>
            <Button variant="neutral" onClick={t.skip} disabled={t.busy}>
              Not today
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
