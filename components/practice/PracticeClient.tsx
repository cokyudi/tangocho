'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Furigana from '@/components/Furigana';
import FuriganaText from '@/components/FuriganaText';
import { reviewWord } from '@/app/(app)/practice/actions';
import { reviewSrs, type Rating } from '@/lib/srs';

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

const RATINGS: { rating: Rating; label: string; variant: 'accent' | 'neutral' }[] = [
  { rating: 'forgot', label: 'Forgot', variant: 'neutral' },
  { rating: 'hard', label: 'Hard', variant: 'neutral' },
  { rating: 'easy', label: 'Easy', variant: 'accent' },
];

function intervalLabel(days: number) {
  if (days < 1) return '<1d';
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${Math.round(days / 365)}y`;
}

export default function PracticeClient({ words }: { words: PracticeWord[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(false);
  const [pending, setPending] = useState<Rating | null>(null);
  const [reviewed, setReviewed] = useState(0);

  const total = words.length;
  const word = words[index];

  async function rate(rating: Rating) {
    if (!word || pending) return;
    setPending(rating);
    await reviewWord(word.id, rating);
    setPending(null);
    setReviewed((n) => n + 1);
    if (index + 1 >= total) {
      setIndex(total); // move past the end → done screen
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
      setShowFurigana(false);
    }
  }

  if (total === 0) {
    return (
      <Done title="Nothing due 🎉" subtitle="You're all caught up. Come back later or add new words." />
    );
  }

  if (index >= total) {
    return (
      <Done
        title="All done 🎉"
        subtitle={`Reviewed ${reviewed} ${reviewed === 1 ? 'word' : 'words'}. Nice work.`}
      />
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Practice</h1>
        <Badge variant="neutral">
          {index + 1} / {total}
        </Badge>
      </div>

      {/* Card */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex flex-1 flex-col items-center justify-center gap-5 border-2 border-ink bg-surface p-6 text-center shadow-retro-lg"
      >
        <Furigana
          term={word.term}
          reading={showFurigana ? word.reading : null}
          className="text-5xl text-ink"
        />

        {!flipped ? (
          <span className="text-sm text-muted">Tap to flip</span>
        ) : (
          <div className="space-y-3">
            {word.meaning_id && <p className="text-2xl font-bold text-ink">{word.meaning_id}</p>}
            {word.meaning_en && <p className="text-muted">{word.meaning_en}</p>}
            {word.example_jp && (
              <div className="border-t-2 border-ink/15 pt-3">
                <FuriganaText
                  text={word.example_furigana ?? word.example_jp}
                  className="text-lg leading-loose text-ink"
                />
                {word.example_translation && (
                  <p className="text-sm text-muted">{word.example_translation}</p>
                )}
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-1.5 pt-1">
              {word.jlpt && <Badge variant="neutral">{word.jlpt}</Badge>}
              {word.source && (
                <Badge variant="neutral">
                  {word.source.name}
                  {word.source.detail ? ` · ${word.source.detail}` : ''}
                </Badge>
              )}
            </div>
          </div>
        )}
      </button>

      {/* Controls */}
      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={() => setShowFurigana((s) => !s)}
          className="mx-auto flex items-center gap-1.5 text-sm font-display font-bold text-muted hover:text-accent"
        >
          {showFurigana ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showFurigana ? 'Hide reading' : 'Show reading'}
        </button>

        {flipped ? (
          <div className="grid grid-cols-3 gap-2">
            {RATINGS.map(({ rating, label, variant }) => {
              const preview = reviewSrs(
                {
                  ease_factor: word.ease_factor,
                  interval: word.interval,
                  repetitions: word.repetitions,
                },
                rating,
              );
              return (
                <Button
                  key={rating}
                  variant={variant}
                  onClick={() => rate(rating)}
                  disabled={pending !== null}
                  className="flex-col !px-2 !py-3"
                >
                  {pending === rating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>{label}</span>
                      <span className="text-xs font-normal opacity-80">
                        {intervalLabel(preview.interval)}
                      </span>
                    </>
                  )}
                </Button>
              );
            })}
          </div>
        ) : (
          <Button onClick={() => setFlipped(true)} className="w-full">
            Show answer
          </Button>
        )}
      </div>
    </div>
  );
}

function Done({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
      <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
      <p className="max-w-sm text-muted">{subtitle}</p>
      <div className="flex gap-3">
        <Button href="/capture">+ Add a word</Button>
        <Button href="/browse" variant="neutral">
          Browse
        </Button>
      </div>
    </div>
  );
}
