import { Mic, Square } from 'lucide-react';
import Button from '@/components/ui/Button';
import SpokenResult from '@/components/practice/SpokenResult';
import { useSpeechRecognition } from '@/components/practice/useSpeechRecognition';
import type { PracticeWord } from '@/components/practice/PracticeClient';

export default function SpeakCard({
  word,
  spoken,
  onHeard,
}: {
  word: PracticeWord;
  spoken: { heard: string; matched: boolean } | null;
  onHeard: (transcripts: string[]) => void;
}) {
  const { listening, error, listen, stop } = useSpeechRecognition(onHeard);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 border-2 border-ink bg-surface p-6 text-center shadow-retro-lg">
      <p className="text-sm text-muted">Say it in Japanese</p>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-ink">{word.meaning_id ?? word.meaning_en}</p>
        {word.meaning_id && word.meaning_en && <p className="text-muted">{word.meaning_en}</p>}
      </div>

      <Button onClick={listening ? stop : listen} variant={spoken && !listening ? 'neutral' : 'accent'}>
        {listening ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        {listening ? 'Listening… tap to stop' : spoken ? 'Try again' : 'Speak'}
      </Button>

      <div aria-live="polite" className="min-h-6 text-sm">
        {error ? (
          <p className="font-display font-bold text-accent">{error}</p>
        ) : (
          spoken && <SpokenResult spoken={spoken} />
        )}
      </div>
    </div>
  );
}
