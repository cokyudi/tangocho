import Badge from '@/components/ui/Badge';
import Furigana from '@/components/Furigana';
import type { BrowseWord } from '@/components/browse/types';
import { masteryLevel, masteryVariant, isDue, MASTERY_LABELS } from '@/lib/mastery';

export default function WordCard({
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
      className="block w-full space-y-2 border-2 border-ink bg-surface p-4 text-left shadow-retro transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Furigana term={w.term} reading={w.reading} className="text-2xl text-ink" />
      {w.meaning_id && <p className="text-ink">{w.meaning_id}</p>}
      {w.meaning_en && <p className="text-sm text-muted">{w.meaning_en}</p>}
      <div className="flex flex-wrap gap-1.5 pt-1">
        <Badge variant={masteryVariant(level)}>{MASTERY_LABELS[level]}</Badge>
        {isDue(w) && <Badge variant="highlight">Due</Badge>}
        {w.jlpt && <Badge variant="neutral">{w.jlpt}</Badge>}
        {sourceLabel && <Badge variant="neutral">{sourceLabel}</Badge>}
      </div>
    </button>
  );
}
