'use client';

import { Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DiffRow from '@/components/recheck/DiffRow';
import { useRecheck, type RecheckWord } from '@/components/recheck/useRecheck';

export default function RecheckClient({ words }: { words: RecheckWord[] }) {
  const { checked, running, done, diffs, run, apply, applyAll } = useRecheck(words);
  const pending = diffs.filter((d) => !d.applied).length;

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-ink">Dictionary re-check</h1>
        <p className="text-muted">
          Compares each word’s reading, part of speech and JLPT level against Jisho. Nothing changes
          until you apply it.
        </p>
      </section>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm text-muted" aria-live="polite">
          {running ? `Checking ${checked} / ${words.length}…` : `${words.length} words`}
          {done && ` · ${diffs.length} ${diffs.length === 1 ? 'difference' : 'differences'}`}
        </p>
        <div className="flex gap-2">
          {done && pending > 0 && (
            <Button variant="neutral" onClick={applyAll}>
              Apply all ({pending})
            </Button>
          )}
          <Button onClick={run} disabled={running || !words.length}>
            {running ? <Loader2 className="h-5 w-5 animate-spin" /> : done ? 'Check again' : 'Check'}
          </Button>
        </div>
      </Card>

      {diffs.map((diff) => (
        <DiffRow key={diff.word.id} diff={diff} onApply={() => apply(diff)} />
      ))}

      {done && !diffs.length && (
        <p className="text-center text-muted">Everything matches Jisho.</p>
      )}
    </div>
  );
}
