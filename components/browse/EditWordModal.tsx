'use client';

import { Loader2, X, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Field, { inputClass } from '@/components/ui/Field';
import SourceField, { type Source } from '@/components/SourceField';
import WordFields from '@/components/WordFields';
import { useEditWord } from '@/components/browse/useEditWord';
import type { BrowseWord } from '@/components/browse/types';

export default function EditWordModal({
  word,
  sources,
  onClose,
}: {
  word: BrowseWord;
  sources: Source[];
  onClose: () => void;
}) {
  const { term, setTerm, fields, setField, source, setSource, saving, onSave, deleting, onDelete, error } =
    useEditWord(word, onClose);

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
            <input value={term} onChange={(e) => setTerm(e.target.value)} className={`${inputClass} font-jp text-lg`} />
          </Field>
          <WordFields fields={fields} onChange={setField} />
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
