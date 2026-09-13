import { useState } from 'react';
import { reviewWord } from '@/app/(app)/practice/actions';
import { reviewSrs, type Rating } from '@/lib/srs';
import type { PracticeWord } from '@/components/practice/PracticeClient';

type QueueWord = PracticeWord & { relearn?: boolean };

export function usePracticeSession(words: PracticeWord[]) {
  const [queue, setQueue] = useState<QueueWord[]>(words);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(false);
  const [pending, setPending] = useState<Rating | null>(null);
  const [reviewed, setReviewed] = useState(0);

  const total = queue.length;
  const word = queue[pos];

  async function rate(rating: Rating) {
    if (!word || pending) return;
    setPending(rating);
    await reviewWord(word.id, rating);
    setPending(null);
    setReviewed((n) => n + 1);

    // Same-session relearning: a forgotten card comes back at the end of the
    // deck. reviewWord already persisted interval=1/reps=0, so reflect that in
    // the requeued copy for an honest interval preview.
    if (rating === 'forgot') {
      const next = reviewSrs(
        { ease_factor: word.ease_factor, interval: word.interval, repetitions: word.repetitions },
        'forgot',
      );
      setQueue((q) => [
        ...q,
        {
          ...word,
          relearn: true,
          ease_factor: next.ease_factor,
          interval: next.interval,
          repetitions: next.repetitions,
        },
      ]);
    }

    setPos((p) => p + 1);
    setFlipped(false);
    setShowFurigana(false);
  }

  return {
    word,
    pos,
    total,
    reviewed,
    flipped,
    flip: () => setFlipped((f) => !f),
    showAnswer: () => setFlipped(true),
    showFurigana,
    toggleFurigana: () => setShowFurigana((s) => !s),
    pending,
    rate,
  };
}
