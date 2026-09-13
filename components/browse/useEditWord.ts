import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateWord } from '@/app/(app)/browse/actions';
import type { SourceSelection } from '@/components/SourceField';
import type { WordFieldValues } from '@/components/WordFields';
import type { BrowseWord } from '@/components/browse/types';
import { useDeleteWord } from '@/components/browse/useDeleteWord';

export function useEditWord(word: BrowseWord, onClose: () => void) {
  const router = useRouter();
  const [term, setTerm] = useState(word.term);
  const [fields, setFields] = useState<WordFieldValues>({
    reading: word.reading ?? '',
    meaningId: word.meaning_id ?? '',
    meaningEn: word.meaning_en ?? '',
    partOfSpeech: word.part_of_speech ?? '',
    jlpt: word.jlpt ?? '',
    exampleJp: word.example_jp ?? '',
    exampleTranslation: word.example_translation ?? '',
    notes: word.notes ?? '',
  });
  const [source, setSource] = useState<SourceSelection>({
    sourceId: word.source_id,
    newSource: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const del = useDeleteWord(word, onClose);

  const setField = (k: keyof WordFieldValues, v: string) => setFields((f) => ({ ...f, [k]: v }));

  async function onSave() {
    setSaving(true);
    setError(null);
    const res = await updateWord({
      id: word.id,
      term,
      ...fields,
      // Keep the AI furigana only if the example text is unchanged; otherwise drop it.
      exampleFurigana:
        fields.exampleJp.trim() === (word.example_jp ?? '').trim()
          ? (word.example_furigana ?? null)
          : null,
      sourceId: source.sourceId,
      newSource: source.newSource,
    });
    setSaving(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
    onClose();
  }

  return {
    term,
    setTerm,
    fields,
    setField,
    source,
    setSource,
    saving,
    onSave,
    deleting: del.deleting,
    onDelete: del.onDelete,
    error: error ?? del.error,
  };
}
