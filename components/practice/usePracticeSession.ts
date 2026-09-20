import { useEffect, useRef, useState } from 'react';
import { reviewWord } from '@/app/(app)/practice/actions';
import { reviewSrs, type Rating } from '@/lib/srs';
import { isKana, isMatch, lookupReading, normalize, speak } from '@/lib/speech';
import type { PracticeWord } from '@/components/practice/PracticeClient';

type QueueWord = PracticeWord & { relearn?: boolean };
export type Mode = 'flip' | 'speak';
// `text` is what we show (kana when known); `note` explains a match, or keeps
// the recognized kanji on a miss.
export type Spoken = { text: string; status: 'checking' | 'match' | 'miss'; note?: string };
const MODE_KEY = 'practice-mode';

export function usePracticeSession(words: PracticeWord[]) {
  const [queue, setQueue] = useState<QueueWord[]>(words);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(false);
  const [pending, setPending] = useState<Rating | null>(null);
  const [reviewed, setReviewed] = useState(0);
  const [mode, setMode] = useState<Mode>('flip');
  const [spoken, setSpoken] = useState<Spoken | null>(null);
  // Guards the async homophone lookup against landing on a later card.
  const heardId = useRef(0);

  useEffect(() => {
    // Read the persisted mode after mount (localStorage is client-only).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (localStorage.getItem(MODE_KEY) === 'speak') setMode('speak');
  }, []);

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
    setSpoken(null);
    heardId.current++;
  }

  function changeMode(next: Mode) {
    setMode(next);
    localStorage.setItem(MODE_KEY, next);
  }

  function showAnswer() {
    setFlipped(true);
    if (mode === 'speak' && word) speak(word.reading ?? word.term);
  }

  async function onHeard(heard: string) {
    if (!word) return;
    const id = ++heardId.current;
    const kanjiNote = (t: string) => (isKana(t) ? undefined : t);

    if (isMatch(heard, word)) {
      // Show the reading rather than the kanji it happened to pick.
      const kana = isKana(heard) ? heard : (word.reading ?? heard);
      return setSpoken({ text: kana, status: 'match' });
    }

    // Homophone: recognition picked different kanji with the same reading
    // (鑑賞 for 感傷). Said correctly, so accept it. Stay in 'checking' until
    // Jisho answers instead of flashing a ✗ that then turns into a ✓.
    if (isKana(heard)) return setSpoken({ text: heard, status: 'miss' });

    setSpoken({ text: heard, status: 'checking' });
    const reading = await lookupReading(heard);
    if (heardId.current !== id) return;
    if (reading && normalize(reading) === normalize(word.reading ?? word.term)) {
      // Don't show the recognized kanji (鑑賞): it isn't this card's word.
      return setSpoken({ text: reading, status: 'match', note: 'same reading' });
    }
    setSpoken({ text: reading ?? heard, status: 'miss', note: reading ? kanjiNote(heard) : undefined });
  }

  return {
    word,
    pos,
    total,
    reviewed,
    flipped,
    flip: () => setFlipped((f) => !f),
    showAnswer,
    showFurigana,
    toggleFurigana: () => setShowFurigana((s) => !s),
    pending,
    rate,
    mode,
    changeMode,
    spoken,
    onHeard,
  };
}
