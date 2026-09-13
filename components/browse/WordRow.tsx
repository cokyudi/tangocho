import { ChevronRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Furigana from '@/components/Furigana';
import type { BrowseWord } from '@/components/browse/types';
import { masteryLevel, masteryVariant, isDue, MASTERY_LABELS } from '@/lib/mastery';

export default function WordRow({
  word: w,
  sourceLabel,
  onClick,
}: {
  word: BrowseWord;
  sourceLabel: string | null;
  onClick: () => void;
}) {
  const level = masteryLevel(w);
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 p-3 text-left hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
    >
      <div className="min-w-0 flex-1">
        <Furigana term={w.term} reading={w.reading} className="text-xl text-ink" />
        <p className="truncate text-sm text-muted">{w.meaning_id || w.meaning_en || '—'}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Badge variant={masteryVariant(level)}>{MASTERY_LABELS[level]}</Badge>
          {isDue(w) && <Badge variant="highlight">Due</Badge>}
          {sourceLabel && <Badge variant="neutral">{sourceLabel}</Badge>}
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
    </button>
  );
}
