import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteWord } from '@/app/(app)/browse/actions';
import type { BrowseWord } from '@/components/browse/types';

export function useDeleteWord(word: BrowseWord, onDone: () => void) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!confirm(`Delete “${word.term}”? This can’t be undone.`)) return;
    setDeleting(true);
    setError(null);
    const res = await deleteWord(word.id);
    setDeleting(false);
    if (!res.ok) return setError(res.error);
    router.refresh();
    onDone();
  }

  return { deleting, error, onDelete };
}
