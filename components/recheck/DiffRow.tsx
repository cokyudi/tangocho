import { Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Furigana from '@/components/Furigana';
import type { Diff } from '@/components/recheck/useRecheck';

const LABELS = { reading: 'Reading', part_of_speech: 'Part of speech', jlpt: 'JLPT' } as const;

export default function DiffRow({ diff, onApply }: { diff: Diff; onApply: () => void }) {
  const { word, fields, applied, error } = diff;

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <Furigana term={word.term} reading={word.reading} className="text-2xl text-ink" />
        {applied ? (
          <span className="inline-flex items-center gap-1 font-display text-sm font-bold text-muted">
            <Check className="h-4 w-4" /> Applied
          </span>
        ) : (
          <Button variant="neutral" onClick={onApply} className="shrink-0 !py-2">
            Apply
          </Button>
        )}
      </div>

      <dl className="space-y-1 text-sm">
        {(Object.keys(fields) as (keyof typeof LABELS)[]).map((key) => (
          <div key={key} className="flex flex-wrap gap-x-2">
            <dt className="text-muted">{LABELS[key]}</dt>
            <dd className="text-muted line-through">{word[key] || '—'}</dd>
            <dd className="font-jp font-bold text-ink">{fields[key]}</dd>
          </div>
        ))}
      </dl>

      {error && <p className="text-sm font-display font-bold text-accent">{error}</p>}
    </Card>
  );
}
