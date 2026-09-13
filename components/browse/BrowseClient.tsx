'use client';

import Link from 'next/link';
import { LayoutGrid, Table as TableIcon } from 'lucide-react';
import Card from '@/components/ui/Card';
import EditWordModal from '@/components/browse/EditWordModal';
import WordDetailSheet from '@/components/browse/WordDetailSheet';
import BrowseFilters from '@/components/browse/BrowseFilters';
import ViewToggle from '@/components/browse/ViewToggle';
import WordCard from '@/components/browse/WordCard';
import WordRow from '@/components/browse/WordRow';
import { useBrowse } from '@/components/browse/useBrowse';
import type { Source } from '@/components/SourceField';
import type { BrowseWord } from '@/components/browse/types';

export default function BrowseClient({
  words,
  sources,
}: {
  words: BrowseWord[];
  sources: Source[];
}) {
  const { view, setView, filters, filtered, sourceLabel, viewing, setViewing, editing, setEditing, startEdit } =
    useBrowse(words, sources);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">
          Browse <span className="text-muted">({words.length})</span>
        </h1>
        <div className="flex gap-2">
          <ViewToggle active={view === 'table'} onClick={() => setView('table')} label="Table">
            <TableIcon className="h-5 w-5" />
          </ViewToggle>
          <ViewToggle active={view === 'grid'} onClick={() => setView('grid')} label="Grid">
            <LayoutGrid className="h-5 w-5" />
          </ViewToggle>
        </div>
      </div>

      <BrowseFilters sources={sources} {...filters} />

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
          {filtered.map((w) => (
            <WordCard key={w.id} word={w} sourceLabel={sourceLabel(w.source_id)} onClick={() => setViewing(w)} />
          ))}
        </div>
      ) : (
        <Card className="divide-y-2 divide-ink/15">
          {filtered.map((w) => (
            <WordRow key={w.id} word={w} sourceLabel={sourceLabel(w.source_id)} onClick={() => setViewing(w)} />
          ))}
        </Card>
      )}

      {viewing && (
        <WordDetailSheet
          word={viewing}
          sourceLabel={sourceLabel(viewing.source_id)}
          onClose={() => setViewing(null)}
          onEdit={startEdit}
        />
      )}

      {editing && (
        <EditWordModal word={editing} sources={sources} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
