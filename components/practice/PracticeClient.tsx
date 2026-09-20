'use client';

import { Eye, EyeOff, Layers, Mic, Volume2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Flashcard from '@/components/practice/Flashcard';
import RatingButtons from '@/components/practice/RatingButtons';
import SpeakCard from '@/components/practice/SpeakCard';
import SpokenResult from '@/components/practice/SpokenResult';
import PracticeDone from '@/components/practice/PracticeDone';
import { usePracticeSession, type Mode } from '@/components/practice/usePracticeSession';
import { speak } from '@/lib/speech';

const MODES: { mode: Mode; label: string; Icon: typeof Mic }[] = [
  { mode: 'flip', label: 'Flip', Icon: Layers },
  { mode: 'speak', label: 'Speak', Icon: Mic },
];

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
  const speaking = s.mode === 'speak';

  if (s.total === 0) {
    return (
      <PracticeDone title="Nothing due" subtitle="You're all caught up. Come back later or add new words." />
    );
  }

  if (s.pos >= s.total) {
    return (
      <PracticeDone
        title="All done"
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

      <div role="group" aria-label="Practice mode" className="mb-4 grid grid-cols-2 border-2 border-ink shadow-retro-sm">
        {MODES.map(({ mode, label, Icon }) => (
          <button
            key={mode}
            type="button"
            aria-pressed={s.mode === mode}
            onClick={() => s.changeMode(mode)}
            className={`flex items-center justify-center gap-1.5 py-2 font-display text-sm font-bold ${
              s.mode === mode ? 'bg-accent text-on-accent' : 'bg-surface text-fg'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      {speaking && !s.flipped ? (
        <SpeakCard key={s.pos} word={s.word} spoken={s.spoken} onHeard={s.onHeard} />
      ) : (
        <Flashcard
          word={s.word}
          flipped={s.flipped}
          showFurigana={speaking || s.showFurigana}
          onFlip={s.flip}
        />
      )}

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-center gap-5 text-sm font-display font-bold text-muted">
          {!speaking && (
            <button type="button" onClick={s.toggleFurigana} className="flex items-center gap-1.5 hover:text-accent">
              {s.showFurigana ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {s.showFurigana ? 'Hide reading' : 'Show reading'}
            </button>
          )}
          {s.flipped && (
            <button
              type="button"
              onClick={() => speak(s.word.reading ?? s.word.term)}
              className="flex items-center gap-1.5 hover:text-accent"
            >
              <Volume2 className="h-4 w-4" /> Play
            </button>
          )}
          {speaking && s.flipped && s.spoken && <SpokenResult spoken={s.spoken} />}
        </div>

        {s.flipped ? (
          <RatingButtons
            word={s.word}
            pending={s.pending}
            onRate={s.rate}
            suggest={speaking && s.spoken?.status === 'miss' ? 'forgot' : undefined}
          />
        ) : (
          <Button onClick={s.showAnswer} className="w-full">
            Show answer
          </Button>
        )}
      </div>
    </div>
  );
}
