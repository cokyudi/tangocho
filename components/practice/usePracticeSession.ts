import { useEffect, useRef, useState } from 'react';
import { reviewWord } from '@/app/(app)/practice/actions';
import { reviewSrs, type Rating } from '@/lib/srs';
import { isKana, isMatch, lookupReading, normalize, speak } from '@/lib/speech';
import type { PracticeWord } from '@/components/practice/PracticeClient';

type QueueWord = PracticeWord & { relearn?: boolean };
export type Mode = 'flip' | 'speak';
// `text` is what we show (kana when known); `note` keeps the recognized kanji.
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

  async function onHeard(transcripts: string[]) {
    if (!word) return;
    const id = ++heardId.current;
    const heard = transcripts[0] ?? '';
    const kanjiNote = (t: string) => (isKana(t) ? undefined : t);

    if (isMatch(transcripts, word)) {
      // Show the reading rather than the kanji it happened to pick.
      const kana = isKana(heard) ? heard : (word.reading ?? heard);
      return setSpoken({ text: kana, status: 'match', note: kanjiNote(heard) });
    }

    // Homophone: recognition picked different kanji with the same reading
    // (鑑賞 for 感傷). Said correctly, so accept it. Stay in 'checking' until
    // Jisho answers instead of flashing a ✗ that then turns into a ✓.
    const candidates = transcripts.slice(0, 3).filter((t) => !isKana(t));
    if (!candidates.length) return setSpoken({ text: heard, status: 'miss' });

    setSpoken({ text: heard, status: 'checking' });
    const target = normalize(word.reading ?? word.term);
    let kana: string | null = null;
    for (const t of candidates) {
      const reading = await lookupReading(t);
      if (heardId.current !== id) return;
      if (reading && normalize(reading) === target) {
        return setSpoken({ text: reading, status: 'match', note: t });
      }
      kana ??= t === heard ? reading : null;
    }
    setSpoken({ text: kana ?? heard, status: 'miss', note: kana ? kanjiNote(heard) : undefined });
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
