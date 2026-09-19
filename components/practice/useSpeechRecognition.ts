import { useEffect, useRef, useState } from 'react';
import { createRecognition, type Recognition } from '@/lib/speech';

const ERRORS: Record<string, string> = {
  unsupported: "This browser can't do speech recognition. Try Chrome, or the home-screen app.",
  'not-allowed':
    'Speech recognition blocked. Turn on Dictation and allow this browser under Settings → Privacy & Security → Speech Recognition.',
  'no-speech': "Didn't hear anything. Try again.",
};
ERRORS['service-not-allowed'] = ERRORS['not-allowed'];

export function useSpeechRecognition(onResult: (transcripts: string[]) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<Recognition | null>(null);

  useEffect(() => () => ref.current?.abort(), []);

  function listen() {
    const r = createRecognition();
    if (!r) return setError(ERRORS.unsupported);
    ref.current = r;
    setError(null);
    r.onresult = (e) => onResult(Array.from(e.results[0], (a) => a.transcript));
    r.onerror = (e) => setError(ERRORS[e.error] ?? `Speech recognition error: ${e.error}`);
    r.onend = () => setListening(false);
    setListening(true);
    r.start();
  }

  return { listening, error, listen };
}
