import { useEffect, useRef, useState } from 'react';
import { createRecognition, type Recognition } from '@/lib/speech';

const ERRORS: Record<string, string> = {
  unsupported: "This browser can't do speech recognition. Try Chrome, or the home-screen app.",
  'not-allowed':
    'Speech recognition blocked. Turn on Dictation and allow this browser under Settings → Privacy & Security → Speech Recognition.',
  'no-speech': "Didn't hear anything. Try again.",
};
ERRORS['service-not-allowed'] = ERRORS['not-allowed'];

export function useSpeechRecognition(onResult: (heard: string) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<Recognition | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    return () => {
      clearTimers();
      ref.current?.abort();
    };
  }, []);

  function listen() {
    const r = createRecognition();
    if (!r) return setError(ERRORS.unsupported);
    ref.current = r;
    setError(null);
    // Report once on end with the latest (possibly interim) result: Safari
    // may only ever deliver interim results, flushed when stop() is called.
    let latest: string | null = null;
    r.onresult = (e) => {
      latest = e.results[0][0]?.transcript ?? null;
      clearTimers();
      // Close the mic as soon as we have the answer: on a final result, or
      // after a beat of silence (Safari never finalizes on its own).
      if (e.results[0].isFinal) r.stop();
      else timers.current.push(setTimeout(() => r.stop(), 1200));
    };
    r.onerror = (e) => setError(ERRORS[e.error] ?? `Speech recognition error: ${e.error}`);
    r.onend = () => {
      clearTimers();
      setListening(false);
      if (latest) onResult(latest);
    };
    setListening(true);
    r.start();
    // Safety net: never leave the mic open if nothing is recognized at all.
    timers.current.push(setTimeout(() => r.stop(), 10_000));
  }

  return { listening, error, listen, stop: () => ref.current?.stop() };
}
