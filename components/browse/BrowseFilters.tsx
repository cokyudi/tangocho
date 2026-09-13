import { Search } from 'lucide-react';
import Card from '@/components/ui/Card';
import { inputClass } from '@/components/ui/Field';
import type { Source } from '@/components/SourceField';
import { MASTERY_LABELS, MASTERY_LEVELS, type MasteryLevel } from '@/lib/mastery';
import { SOURCE_TYPE_LABELS, type SourceType } from '@/constants/sources';

export default function BrowseFilters({
  sources,
  query,
  setQuery,
  sourceFilter,
  setSourceFilter,
  masteryFilter,
  setMasteryFilter,
  dueOnly,
  setDueOnly,
}: {
  sources: Source[];
  query: string;
  setQuery: (v: string) => void;
  sourceFilter: string;
  setSourceFilter: (v: string) => void;
  masteryFilter: MasteryLevel | '';
  setMasteryFilter: (v: MasteryLevel | '') => void;
  dueOnly: boolean;
  setDueOnly: (v: boolean) => void;
}) {
  return (
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
  );
}
