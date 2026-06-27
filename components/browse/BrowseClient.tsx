'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, Table as TableIcon, Search, ChevronRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Furigana from '@/components/Furigana';
import EditWordModal from '@/components/browse/EditWordModal';
import WordDetailSheet from '@/components/browse/WordDetailSheet';
import type { Source } from '@/components/SourceField';
import type { BrowseWord } from '@/components/browse/types';
import {
  masteryLevel,
  isDue,
  MASTERY_LABELS,
  MASTERY_LEVELS,
  type MasteryLevel,
} from '@/lib/mastery';
import { SOURCE_TYPE_LABELS, type SourceType } from '@/constants/sources';

const VIEW_KEY = 'tangocho:browseView';

const inputClass =
  'w-full border-2 border-ink bg-surface px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

const masteryVariant = (l: MasteryLevel): 'accent' | 'highlight' | 'neutral' =>
  l === 'mastered' ? 'accent' : l === 'new' ? 'highlight' : 'neutral';

export default function BrowseClient({
  words,
  sources,
}: {
  words: BrowseWord[];
  sources: Source[];
}) {
  const [view, setView] = useState<'table' | 'grid'>('table');
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

  const setViewPersisted = (v: 'table' | 'grid') => {
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">
          Browse <span className="text-muted">({words.length})</span>
        </h1>
        <div className="flex gap-2">
          <ViewToggle active={view === 'table'} onClick={() => setViewPersisted('table')} label="Table">
            <TableIcon className="h-5 w-5" />
          </ViewToggle>
          <ViewToggle active={view === 'grid'} onClick={() => setViewPersisted('grid')} label="Grid">
            <LayoutGrid className="h-5 w-5" />
          </ViewToggle>
        </div>
      </div>

      {/* Filters */}
      <Card className="space-y-3 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search term, reading, meaning…"
            className={`${inputClass} pl-9`}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className={inputClass}>
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {SOURCE_TYPE_LABELS[s.type as SourceType] ?? s.type}: {s.name}
              </option>
            ))}
          </select>
          <select
            value={masteryFilter}
            onChange={(e) => setMasteryFilter(e.target.value as MasteryLevel | '')}
            className={inputClass}
          >
            <option value="">All mastery</option>
            {MASTERY_LEVELS.map((l) => (
              <option key={l} value={l}>
                {MASTERY_LABELS[l]}
              </option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 border-2 border-ink bg-surface px-3 py-2">
            <input type="checkbox" checked={dueOnly} onChange={(e) => setDueOnly(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            <span className="text-sm">Due only</span>
          </label>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted">
          {words.length === 0 ? (
            <>
              No words yet.{' '}
              <Link href="/capture" className="font-display font-bold text-accent">
                Add your first →
              </Link>
            </>
          ) : (
            'No words match these filters.'
          )}
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((w) => {
            const level = masteryLevel(w);
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setViewing(w)}
                className="block w-full space-y-2 border-2 border-ink bg-surface p-4 text-left shadow-retro transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Furigana term={w.term} reading={w.reading} className="text-2xl text-ink" />
                {w.meaning_id && <p className="text-ink">{w.meaning_id}</p>}
                {w.meaning_en && <p className="text-sm text-muted">{w.meaning_en}</p>}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Badge variant={masteryVariant(level)}>{MASTERY_LABELS[level]}</Badge>
                  {isDue(w) && <Badge variant="highlight">Due</Badge>}
                  {w.jlpt && <Badge variant="neutral">{w.jlpt}</Badge>}
                  {sourceLabel(w.source_id) && <Badge variant="neutral">{sourceLabel(w.source_id)}</Badge>}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <Card className="divide-y-2 divide-ink/15">
          {filtered.map((w) => {
            const level = masteryLevel(w);
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setViewing(w)}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-ink/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
              >
                <div className="min-w-0 flex-1">
                  <Furigana term={w.term} reading={w.reading} className="text-xl text-ink" />
                  <p className="truncate text-sm text-muted">
                    {w.meaning_id || w.meaning_en || '—'}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant={masteryVariant(level)}>{MASTERY_LABELS[level]}</Badge>
                    {isDue(w) && <Badge variant="highlight">Due</Badge>}
                    {sourceLabel(w.source_id) && <Badge variant="neutral">{sourceLabel(w.source_id)}</Badge>}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
              </button>
            );
          })}
        </Card>
      )}

      {viewing && (
        <WordDetailSheet
          word={viewing}
          sourceLabel={sourceLabel(viewing.source_id)}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing);
            setViewing(null);
          }}
        />
      )}

      {editing && (
        <EditWordModal word={editing} sources={sources} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={`${label} view`}
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-11 w-11 items-center justify-center border-2 border-ink shadow-retro-sm transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 ${
        active ? 'bg-accent text-on-accent' : 'bg-surface text-fg'
      }`}
    >
      {children}
    </button>
  );
}
