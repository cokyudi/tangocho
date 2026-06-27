'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import SourceField, { type Source, type SourceSelection } from '@/components/SourceField';
import { updateWord, deleteWord } from '@/app/(app)/browse/actions';
import type { BrowseWord } from '@/components/browse/types';

const inputClass =
  'w-full border-2 border-ink bg-surface px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

export default function EditWordModal({
  word,
  sources,
  onClose,
}: {
  word: BrowseWord;
  sources: Source[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [fields, setFields] = useState({
    term: word.term,
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
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof fields, v: string) => setFields((f) => ({ ...f, [k]: v }));

  async function onSave() {
    setSaving(true);
    setError(null);
    const res = await updateWord({
      id: word.id,
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

  async function onDelete() {
    if (!confirm(`Delete “${word.term}”? This can’t be undone.`)) return;
    setDeleting(true);
    setError(null);
    const res = await deleteWord(word.id);
    setDeleting(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto border-2 border-ink bg-paper p-5 shadow-retro-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink">Edit word</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center border-2 border-ink bg-surface shadow-retro-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Japanese word" full>
            <input value={fields.term} onChange={(e) => set('term', e.target.value)} className={`${inputClass} font-jp text-lg`} />
          </Field>
          <Field label="Reading">
            <input value={fields.reading} onChange={(e) => set('reading', e.target.value)} className={`${inputClass} font-jp`} />
          </Field>
          <Field label="JLPT">
            <input value={fields.jlpt} onChange={(e) => set('jlpt', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Meaning (Indonesian)" full>
            <input value={fields.meaningId} onChange={(e) => set('meaningId', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Meaning (English)" full>
            <input value={fields.meaningEn} onChange={(e) => set('meaningEn', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Part of speech" full>
            <input value={fields.partOfSpeech} onChange={(e) => set('partOfSpeech', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Example (Japanese)" full>
            <input value={fields.exampleJp} onChange={(e) => set('exampleJp', e.target.value)} className={`${inputClass} font-jp`} />
          </Field>
          <Field label="Example (Indonesian)" full>
            <input value={fields.exampleTranslation} onChange={(e) => set('exampleTranslation', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Notes" full>
            <input value={fields.notes} onChange={(e) => set('notes', e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="mt-4">
          <SourceField sources={sources} value={source} onChange={setSource} />
        </div>

        {error && <p className="mt-3 text-sm font-display font-bold text-accent">{error}</p>}

        <div className="mt-5 flex gap-3">
          <Button onClick={onSave} disabled={saving} className="flex-1">
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save changes'}
          </Button>
          <Button
            type="button"
            variant="neutral"
            onClick={onDelete}
            disabled={deleting}
            aria-label="Delete word"
            className="shrink-0"
          >
            {deleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-1 ${full ? 'col-span-2' : ''}`}>
      <label className="block text-xs text-muted">{label}</label>
      {children}
    </div>
  );
}
