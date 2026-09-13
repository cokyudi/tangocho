import Badge from '@/components/ui/Badge';
import Furigana from '@/components/Furigana';
import FuriganaText from '@/components/FuriganaText';
import type { PracticeWord } from '@/components/practice/PracticeClient';

export default function Flashcard({
  word,
  flipped,
  showFurigana,
  onFlip,
}: {
  word: PracticeWord;
  flipped: boolean;
  showFurigana: boolean;
  onFlip: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onFlip}
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
  );
}
