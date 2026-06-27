'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Pencil, Trash2, Loader2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Furigana from '@/components/Furigana';
import FuriganaText from '@/components/FuriganaText';
import { deleteWord } from '@/app/(app)/browse/actions';
import { masteryLevel, isDue, MASTERY_LABELS } from '@/lib/mastery';
import type { BrowseWord } from '@/components/browse/types';

export default function WordDetailSheet({
  word,
  sourceLabel,
  onClose,
  onEdit,
}: {
  word: BrowseWord;
  sourceLabel: string | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const level = masteryLevel(word);
  const due = isDue(word);
  const meta = [word.reading, word.part_of_speech, word.jlpt].filter(Boolean).join(' · ');

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
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Furigana term={word.term} reading={word.reading} className="text-3xl text-ink" />
            {meta && <p className="mt-1 font-jp text-sm text-muted">{meta}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center border-2 border-ink bg-surface shadow-retro-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Meanings */}
        <div className="space-y-2">
          {word.meaning_id && (
            <p className="text-lg text-ink">
              <span className="mr-2 align-middle text-[10px] font-bold uppercase text-muted">ID</span>
              {word.meaning_id}
            </p>
          )}
          {word.meaning_en && (
            <p className="text-muted">
              <span className="mr-2 align-middle text-[10px] font-bold uppercase text-muted">EN</span>
              {word.meaning_en}
            </p>
          )}
        </div>

        {/* Example */}
        {word.example_jp && (
          <div className="mt-4 border-t-2 border-ink/15 pt-4">
            <FuriganaText
              text={word.example_furigana ?? word.example_jp}
              className="text-lg leading-loose text-ink"
            />
            {word.example_translation && (
              <p className="mt-1 text-sm text-muted">{word.example_translation}</p>
            )}
          </div>
        )}

        {/* Notes */}
        {word.notes && (
          <p className="mt-4 border-t-2 border-ink/15 pt-4 text-sm text-muted">{word.notes}</p>
        )}

        {/* Meta badges */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t-2 border-ink/15 pt-4">
          <Badge variant={level === 'mastered' ? 'accent' : level === 'new' ? 'highlight' : 'neutral'}>
            {MASTERY_LABELS[level]}
          </Badge>
          <Badge variant={due ? 'highlight' : 'neutral'}>
            {due ? 'Due now' : `Next review ${word.due_date ?? '—'}`}
          </Badge>
          {sourceLabel && <Badge variant="neutral">{sourceLabel}</Badge>}
        </div>

        {error && <p className="mt-3 text-sm font-display font-bold text-accent">{error}</p>}

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <Button onClick={onEdit} className="flex-1">
            <Pencil className="h-4 w-4" /> Edit
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
