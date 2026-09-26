import { useState } from 'react';
import { saveSuggestions, markKnown, skipRest } from '@/app/(app)/actions';

type Result = { ok: true } | { ok: false; error: string };

export function useTodaysWords() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  async function run(action: () => Promise<Result>) {
    setBusy(true);
    setError(null);
    const res = await action();
    setBusy(false);
    if (res.ok) setSelected(new Set());
    else setError(res.error);
  }

  return {
    selected,
    revealed,
    busy,
    error,
    toggleSelected: (id: string) => setSelected((s) => toggle(s, id)),
    toggleRevealed: (id: string) => setRevealed((s) => toggle(s, id)),
    save: () => run(() => saveSuggestions([...selected])),
    known: (id: string) => run(() => markKnown(id)),
    skip: () => run(skipRest),
  };
}
