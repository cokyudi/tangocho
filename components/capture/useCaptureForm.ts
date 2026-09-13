import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { saveWord } from '@/app/(app)/capture/actions';
import type { EnrichResult } from '@/lib/enrich/schema';
import type { SourceSelection } from '@/components/SourceField';
import type { WordFieldValues } from '@/components/WordFields';
import { useDebounce } from '@/lib/hooks/useDebounce';

const empty: WordFieldValues = {
  reading: '',
  meaningId: '',
  meaningEn: '',
  partOfSpeech: '',
  jlpt: '',
  exampleJp: '',
  exampleTranslation: '',
  notes: '',
};

export type EnrichedFrom = { source: 'jisho' | 'gemini'; geminiUsed: boolean };

export function useCaptureForm() {
  const [term, setTermState] = useState('');
  const [fields, setFields] = useState(empty);
  const [enriching, setEnriching] = useState(false);
  const [enrichedFrom, setEnrichedFrom] = useState<EnrichedFrom | null>(null);
  // Furigana-annotated example (derived from enrichment, not directly edited).
  const [exampleFurigana, setExampleFurigana] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  // Source selection (kept across saves for fast consecutive adds)
  const [source, setSource] = useState<SourceSelection>({ sourceId: null, newSource: null });

  const termRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false); // true while an IME composition is in progress
  const lastEnriched = useRef<string>('');

  useEffect(() => {
    termRef.current?.focus();
  }, []);

  const setField = (k: keyof WordFieldValues, v: string) => {
    setFields((f) => ({ ...f, [k]: v }));
    if (k === 'exampleJp') setExampleFurigana(null); // editing invalidates the AI furigana
  };

  const setTerm = (value: string) => {
    setTermState(value);
    setEnrichedFrom(null);
  };

  const enrich = useCallback(async (value: string) => {
    const t = value.trim();
    if (!t || t === lastEnriched.current) return;
    lastEnriched.current = t;
    setEnriching(true);
    setError(null);
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: t }),
      });
      if (!res.ok)
        throw new Error(
          (await res.json().catch(() => ({})))?.error ??
            'AI lookup failed — try again or fill the fields manually.',
        );
      const data = (await res.json()) as EnrichResult;
      setFields({
        reading: data.reading ?? '',
        meaningId: data.meaningId ?? '',
        meaningEn: data.meaningEn ?? '',
        partOfSpeech: data.partOfSpeech ?? '',
        jlpt: data.jlpt ?? '',
        exampleJp: data.exampleJp ?? '',
        exampleTranslation: data.exampleTranslation ?? '',
        notes: '',
      });
      setExampleFurigana(data.exampleFurigana ?? null);
      setEnrichedFrom({ source: data.source, geminiUsed: data.geminiUsed });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI lookup failed — try again or fill the fields manually.');
      setEnrichedFrom(null);
    } finally {
      setEnriching(false);
    }
  }, []);

  // Auto-enrich only once typing has settled (and not mid-IME-composition),
  // so we don't spend Gemini/Jisho calls on every keystroke.
  const debouncedTerm = useDebounce(term, 800);
  useEffect(() => {
    if (composingRef.current) return;
    enrich(debouncedTerm);
  }, [debouncedTerm, enrich]);

  async function onSave() {
    if (!term.trim()) {
      setError('Type a word first');
      termRef.current?.focus();
      return;
    }
    setSaving(true);
    setError(null);
    const result = await saveWord({
      term,
      ...fields,
      exampleFurigana,
      sourceId: source.sourceId,
      newSource: source.newSource,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Reset for the next word; keep the source so consecutive adds are fast.
    setTermState('');
    setFields(empty);
    setExampleFurigana(null);
    setEnrichedFrom(null);
    lastEnriched.current = '';
    setSavedCount((n) => n + 1);
    termRef.current?.focus();
  }

  const termInput = {
    inputRef: termRef,
    term,
    enriching,
    enrichedFrom,
    onChange: setTerm,
    onCompositionStart: () => {
      composingRef.current = true;
    },
    onCompositionEnd: (value: string) => {
      composingRef.current = false;
      setTermState(value);
    },
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !composingRef.current) {
        e.preventDefault();
        enrich(term);
      }
    },
    onEnrich: () => enrich(term),
  };

  return { termInput, fields, setField, source, setSource, saving, error, savedCount, onSave };
}
