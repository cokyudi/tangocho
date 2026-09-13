'use client';

import { Eye, EyeOff } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Flashcard from '@/components/practice/Flashcard';
import RatingButtons from '@/components/practice/RatingButtons';
import PracticeDone from '@/components/practice/PracticeDone';
import { usePracticeSession } from '@/components/practice/usePracticeSession';

export type PracticeWord = {
  id: string;
  term: string;
  reading: string | null;
  meaning_id: string | null;
  meaning_en: string | null;
  example_jp: string | null;
  example_furigana: string | null;
  example_translation: string | null;
  jlpt: string | null;
  part_of_speech: string | null;
  ease_factor: number;
  interval: number;
  repetitions: number;
  due_date: string | null;
  source: { name: string; detail: string | null; type: string } | null;
};

export default function PracticeClient({ words }: { words: PracticeWord[] }) {
  const s = usePracticeSession(words);

  if (s.total === 0) {
    return (
      <PracticeDone title="Nothing due 🎉" subtitle="You're all caught up. Come back later or add new words." />
    );
  }

  if (s.pos >= s.total) {
    return (
      <PracticeDone
        title="All done 🎉"
        subtitle={`Reviewed ${s.reviewed} ${s.reviewed === 1 ? 'card' : 'cards'}. Nice work.`}
      />
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Practice</h1>
        <div className="flex items-center gap-2">
          {s.word.relearn && <Badge variant="highlight">Relearning</Badge>}
          <Badge variant="neutral">
            {s.pos + 1} / {s.total}
          </Badge>
        </div>
      </div>

      <Flashcard word={s.word} flipped={s.flipped} showFurigana={s.showFurigana} onFlip={s.flip} />

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={s.toggleFurigana}
          className="mx-auto flex items-center gap-1.5 text-sm font-display font-bold text-muted hover:text-accent"
        >
          {s.showFurigana ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {s.showFurigana ? 'Hide reading' : 'Show reading'}
        </button>

        {s.flipped ? (
          <RatingButtons word={s.word} pending={s.pending} onRate={s.rate} />
        ) : (
          <Button onClick={s.showAnswer} className="w-full">
            Show answer
          </Button>
        )}
      </div>
    </div>
  );
}
