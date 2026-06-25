'use client';

import { useState } from 'react';
import { SOURCE_TYPES, SOURCE_TYPE_LABELS, type SourceType } from '@/constants/sources';

export type Source = { id: string; type: string; name: string; detail: string | null };
export type SourceSelection = {
  sourceId: string | null;
  newSource: { type: SourceType; name: string; detail: string } | null;
};

const inputClass =
  'w-full border-2 border-ink bg-surface px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

export default function SourceField({
  sources,
  value,
  onChange,
}: {
  sources: Source[];
  value: SourceSelection;
  onChange: (s: SourceSelection) => void;
}) {
  const [mode, setMode] = useState<'existing' | 'new'>(
    value.newSource ? 'new' : sources.length ? 'existing' : 'new',
  );
  const [sourceId, setSourceId] = useState(value.sourceId ?? '');
  const [newType, setNewType] = useState<SourceType>(value.newSource?.type ?? 'drama');
  const [newName, setNewName] = useState(value.newSource?.name ?? '');
  const [newDetail, setNewDetail] = useState(value.newSource?.detail ?? '');

  const grouped: Record<string, Source[]> = {};
  for (const s of sources) (grouped[s.type] ??= []).push(s);

  function emitExisting(id: string) {
    setSourceId(id);
    onChange({ sourceId: id || null, newSource: null });
  }
  function emitNew(next: { type?: SourceType; name?: string; detail?: string }) {
    const t = next.type ?? newType;
    const n = next.name ?? newName;
    const d = next.detail ?? newDetail;
    onChange({ sourceId: null, newSource: n.trim() ? { type: t, name: n, detail: d } : null });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-display font-bold uppercase tracking-wide text-muted">
          Where did you learn it?
        </label>
        <button
          type="button"
          onClick={() => {
            const next = mode === 'existing' ? 'new' : 'existing';
            setMode(next);
            if (next === 'existing') emitExisting(sourceId);
            else emitNew({});
          }}
          className="font-display text-xs font-bold text-accent underline"
        >
          {mode === 'existing' ? '+ New source' : 'Pick existing'}
        </button>
      </div>

      {mode === 'existing' ? (
        <select value={sourceId} onChange={(e) => emitExisting(e.target.value)} className={inputClass}>
          <option value="">— none —</option>
          {SOURCE_TYPES.filter((t) => grouped[t]?.length).map((t) => (
            <optgroup key={t} label={SOURCE_TYPE_LABELS[t]}>
              {grouped[t].map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.detail ? ` — ${s.detail}` : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <select
            value={newType}
            onChange={(e) => {
              const t = e.target.value as SourceType;
              setNewType(t);
              emitNew({ type: t });
            }}
            className={inputClass}
          >
            {SOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {SOURCE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              emitNew({ name: e.target.value });
            }}
            placeholder="Name (e.g. Midnight Diner)"
            className={inputClass}
          />
          <input
            value={newDetail}
            onChange={(e) => {
              setNewDetail(e.target.value);
              emitNew({ detail: e.target.value });
            }}
            placeholder="Detail (e.g. S2 Ep.3)"
            className={`${inputClass} col-span-2`}
          />
        </div>
      )}
    </div>
  );
}
