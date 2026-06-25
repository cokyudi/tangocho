'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Loader2, Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { SOURCE_TYPES, SOURCE_TYPE_LABELS, type SourceType } from '@/constants/sources';
import { saveWord } from '@/app/(app)/capture/actions';
import type { EnrichResult } from '@/lib/enrich/schema';

type Source = { id: string; type: string; name: string; detail: string | null };

const inputClass =
  'w-full border-2 border-ink bg-surface px-3 py-2 text-ink placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

const empty = {
  reading: '',
  meaningId: '',
  meaningEn: '',
  partOfSpeech: '',
  jlpt: '',
  exampleJp: '',
  exampleTranslation: '',
  notes: '',
};

export default function CaptureForm({ sources }: { sources: Source[] }) {
  const [term, setTerm] = useState('');
  const [fields, setFields] = useState(empty);
  const [enriching, setEnriching] = useState(false);
  const [enrichedFrom, setEnrichedFrom] = useState<'jisho' | 'gemini' | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  // Source selection
  const [sourceMode, setSourceMode] = useState<'existing' | 'new'>(
    sources.length ? 'existing' : 'new',
  );
  const [sourceId, setSourceId] = useState<string>('');
  const [newType, setNewType] = useState<SourceType>('drama');
  const [newName, setNewName] = useState('');
  const [newDetail, setNewDetail] = useState('');

  const termRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEnriched = useRef<string>('');

  useEffect(() => {
    termRef.current?.focus();
  }, []);

  const groupedSources = useMemo(() => {
    const groups: Record<string, Source[]> = {};
    for (const s of sources) (groups[s.type] ??= []).push(s);
    return groups;
  }, [sources]);

  const set = (k: keyof typeof empty, v: string) => setFields((f) => ({ ...f, [k]: v }));

  async function enrich(value: string) {
    const t = value.trim();
    if (!t || t === lastEnriched.current) return;
    lastEnriched.current = t;
    setEnriching(true);
    setError(null);
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: t }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? 'Enrich failed');
      const data = (await res.json()) as EnrichResult;
      setFields({
        reading: data.reading ?? '',
        meaningId: data.meaningId ?? '',
        meaningEn: data.meaningEn ?? '',
        partOfSpeech: data.partOfSpeech ?? '',
        jlpt: data.jlpt ?? '',
        exampleJp: data.exampleJp ?? '',
        exampleTranslation: data.exampleTranslation ?? '',
        notes: '',
      });
      setEnrichedFrom(data.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enrichment failed');
      setEnrichedFrom(null);
    } finally {
      setEnriching(false);
    }
  }

  function onTermChange(value: string) {
    setTerm(value);
    setEnrichedFrom(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => enrich(value), 700);
  }

  async function onSave() {
    if (!term.trim()) {
      setError('Type a word first');
      termRef.current?.focus();
      return;
    }
    setSaving(true);
    setError(null);
    const result = await saveWord({
      term,
      ...fields,
      sourceId: sourceMode === 'existing' && sourceId ? sourceId : null,
      newSource:
        sourceMode === 'new' && newName.trim()
          ? { type: newType, name: newName, detail: newDetail }
          : null,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // Reset for the next word; keep the source so consecutive adds are fast.
    setTerm('');
    setFields(empty);
    setEnrichedFrom(null);
    lastEnriched.current = '';
    setSavedCount((n) => n + 1);
    termRef.current?.focus();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Capture</h1>
        {savedCount > 0 && (
          <Badge variant="accent" className="gap-1">
            <Check className="h-3.5 w-3.5" /> {savedCount} saved
          </Badge>
        )}
      </div>

      {/* Term + AI fill */}
      <Card className="space-y-3 p-4">
        <label className="block text-xs font-display font-bold uppercase tracking-wide text-muted">
          Japanese word
        </label>
        <div className="flex gap-2">
          <input
            ref={termRef}
            value={term}
            onChange={(e) => onTermChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                enrich(term);
              }
            }}
            placeholder="例: 食べる, ぴえん…"
            className={`${inputClass} font-jp text-2xl`}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <Button
            type="button"
            variant="neutral"
            onClick={() => enrich(term)}
            disabled={enriching || !term.trim()}
            className="shrink-0"
            aria-label="Fill with AI"
          >
            {enriching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          </Button>
        </div>
        {enrichedFrom && (
          <p className="text-xs text-muted">
            Auto-filled from{' '}
            <span className="font-display font-bold text-accent">
              {enrichedFrom === 'jisho' ? 'Jisho' : 'Gemini'}
            </span>
            . Edit anything below.
          </p>
        )}
      </Card>

      {/* Editable fields */}
      <Card className="grid grid-cols-2 gap-3 p-4">
        <Labeled label="Reading (furigana)">
          <input value={fields.reading} onChange={(e) => set('reading', e.target.value)} className={`${inputClass} font-jp`} />
        </Labeled>
        <Labeled label="JLPT">
          <input value={fields.jlpt} onChange={(e) => set('jlpt', e.target.value)} className={inputClass} placeholder="N5…N1" />
        </Labeled>
        <Labeled label="Meaning (Indonesian)" full>
          <input value={fields.meaningId} onChange={(e) => set('meaningId', e.target.value)} className={inputClass} />
        </Labeled>
        <Labeled label="Meaning (English)" full>
          <input value={fields.meaningEn} onChange={(e) => set('meaningEn', e.target.value)} className={inputClass} />
        </Labeled>
        <Labeled label="Part of speech" full>
          <input value={fields.partOfSpeech} onChange={(e) => set('partOfSpeech', e.target.value)} className={inputClass} />
        </Labeled>
        <Labeled label="Example (Japanese)" full>
          <input value={fields.exampleJp} onChange={(e) => set('exampleJp', e.target.value)} className={`${inputClass} font-jp`} />
        </Labeled>
        <Labeled label="Example (Indonesian)" full>
          <input value={fields.exampleTranslation} onChange={(e) => set('exampleTranslation', e.target.value)} className={inputClass} />
        </Labeled>
        <Labeled label="Notes" full>
          <input value={fields.notes} onChange={(e) => set('notes', e.target.value)} className={inputClass} />
        </Labeled>
      </Card>

      {/* Source */}
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-display font-bold uppercase tracking-wide text-muted">
            Where did you learn it?
          </label>
          <button
            type="button"
            onClick={() => setSourceMode((m) => (m === 'existing' ? 'new' : 'existing'))}
            className="font-display text-xs font-bold text-accent underline"
          >
            {sourceMode === 'existing' ? '+ New source' : 'Pick existing'}
          </button>
        </div>

        {sourceMode === 'existing' ? (
          <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className={inputClass}>
            <option value="">— none —</option>
            {SOURCE_TYPES.filter((t) => groupedSources[t]?.length).map((t) => (
              <optgroup key={t} label={SOURCE_TYPE_LABELS[t]}>
                {groupedSources[t].map((s) => (
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
            <select value={newType} onChange={(e) => setNewType(e.target.value as SourceType)} className={inputClass}>
              {SOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {SOURCE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name (e.g. Midnight Diner)" className={inputClass} />
            <input value={newDetail} onChange={(e) => setNewDetail(e.target.value)} placeholder="Detail (e.g. S2 Ep.3)" className={`${inputClass} col-span-2`} />
          </div>
        )}
      </Card>

      {error && <p className="text-sm font-display font-bold text-accent">{error}</p>}

      <Button onClick={onSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save word'}
      </Button>
    </div>
  );
}

function Labeled({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1 ${full ? 'col-span-2' : ''}`}>
      <label className="block text-xs text-muted">{label}</label>
      {children}
    </div>
  );
}
