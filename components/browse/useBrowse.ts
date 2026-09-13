import { useEffect, useMemo, useState } from 'react';
import type { Source } from '@/components/SourceField';
import type { BrowseWord } from '@/components/browse/types';
import { masteryLevel, isDue, type MasteryLevel } from '@/lib/mastery';

const VIEW_KEY = 'tangocho:browseView';

export type BrowseView = 'table' | 'grid';

export function useBrowse(words: BrowseWord[], sources: Source[]) {
  const [view, setView] = useState<BrowseView>('table');
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [masteryFilter, setMasteryFilter] = useState<MasteryLevel | ''>('');
  const [dueOnly, setDueOnly] = useState(false);
  const [viewing, setViewing] = useState<BrowseWord | null>(null);
  const [editing, setEditing] = useState<BrowseWord | null>(null);

  useEffect(() => {
    // Read the persisted view after mount (localStorage is client-only).
    const saved = localStorage.getItem(VIEW_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === 'grid' || saved === 'table') setView(saved);
  }, []);

  const setViewPersisted = (v: BrowseView) => {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  };

  const sourceMap = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words.filter((w) => {
      if (sourceFilter && w.source_id !== sourceFilter) return false;
      if (masteryFilter && masteryLevel(w) !== masteryFilter) return false;
      if (dueOnly && !isDue(w)) return false;
      if (q) {
        const hay = `${w.term} ${w.reading ?? ''} ${w.meaning_id ?? ''} ${w.meaning_en ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [words, query, sourceFilter, masteryFilter, dueOnly]);

  const sourceLabel = (id: string | null) => {
    if (!id) return null;
    const s = sourceMap.get(id);
    if (!s) return null;
    return `${s.name}${s.detail ? ` · ${s.detail}` : ''}`;
  };

  const startEdit = () => {
    setEditing(viewing);
    setViewing(null);
  };

  return {
    view,
    setView: setViewPersisted,
    filters: {
      query,
      setQuery,
      sourceFilter,
      setSourceFilter,
      masteryFilter,
      setMasteryFilter,
      dueOnly,
      setDueOnly,
    },
    filtered,
    sourceLabel,
    viewing,
    setViewing,
    editing,
    setEditing,
    startEdit,
  };
}
