import type { KeyboardEvent, RefObject } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Field';
import type { EnrichedFrom } from '@/components/capture/useCaptureForm';

export default function TermInput({
  inputRef,
  term,
  enriching,
  enrichedFrom,
  onChange,
  onCompositionStart,
  onCompositionEnd,
  onKeyDown,
  onEnrich,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  term: string;
  enriching: boolean;
  enrichedFrom: EnrichedFrom | null;
  onChange: (value: string) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onEnrich: () => void;
}) {
  return (
    <Card className="space-y-3 p-4">
      <label className="block text-xs font-display font-bold uppercase tracking-wide text-muted">
        Japanese word
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={term}
          onChange={(e) => onChange(e.target.value)}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={(e) => onCompositionEnd(e.currentTarget.value)}
          onKeyDown={onKeyDown}
          placeholder="例: 食べる, ぴえん…"
          className={`${inputClass} font-jp text-2xl`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <Button
          type="button"
          variant="neutral"
          onClick={onEnrich}
          disabled={enriching || !term.trim()}
          className="shrink-0"
          aria-label="Fill with AI"
        >
          {enriching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        </Button>
      </div>
      {enrichedFrom && (
        <p className="text-xs text-muted">
          Auto-filled from{' '}
          <span className="font-display font-bold text-accent">
            {enrichedFrom.source === 'gemini'
              ? 'Gemini'
              : enrichedFrom.geminiUsed
                ? 'Jisho + Gemini'
                : 'Jisho'}
          </span>
          . Edit anything below.
        </p>
      )}
    </Card>
  );
}
