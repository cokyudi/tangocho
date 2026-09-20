import { useState } from 'react';
import { applyJishoFields, type JishoFields } from '@/app/(app)/recheck/actions';

export type RecheckWord = {
  id: string;
  term: string;
  reading: string | null;
  part_of_speech: string | null;
  jlpt: string | null;
};

type Entry = { reading: string | null; partOfSpeech: string | null; jlpt: string | null };
export type Diff = {
  word: RecheckWord;
  fields: JishoFields;
  applied?: boolean;
  error?: string;
};

const FIELDS = [
  ['reading', 'reading'],
  ['part_of_speech', 'partOfSpeech'],
  ['jlpt', 'jlpt'],
] as const;

// Jisho differs when it has a value and ours is missing or different.
function diffOf(word: RecheckWord, entry: Entry): JishoFields {
  const fields: JishoFields = {};
  for (const [col, key] of FIELDS) {
    const theirs = entry[key]?.trim();
    if (theirs && theirs !== word[col]?.trim()) fields[col] = theirs;
  }
  return fields;
}

export function useRecheck(words: RecheckWord[]) {
  const [checked, setChecked] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [diffs, setDiffs] = useState<Diff[]>([]);

  async function run() {
    setRunning(true);
    setDone(false);
    setDiffs([]);
    setChecked(0);
    for (const word of words) {
      try {
        const res = await fetch(`/api/reading?q=${encodeURIComponent(word.term)}`);
        if (res.ok) {
          const fields = diffOf(word, (await res.json()) as Entry);
          if (Object.keys(fields).length) setDiffs((d) => [...d, { word, fields }]);
        }
      } catch {
        // Skip this word; a failed lookup is not a difference.
      }
      setChecked((n) => n + 1);
      // Be a polite client of an undocumented public API.
      await new Promise((r) => setTimeout(r, 150));
    }
    setRunning(false);
    setDone(true);
  }

  async function apply(diff: Diff) {
    const res = await applyJishoFields(diff.word.id, diff.fields);
    setDiffs((all) =>
      all.map((d) =>
        d.word.id === diff.word.id
          ? { ...d, applied: res.ok, error: res.ok ? undefined : res.error }
          : d,
      ),
    );
  }

  async function applyAll() {
    for (const d of diffs.filter((d) => !d.applied)) await apply(d);
  }

  return { checked, running, done, diffs, run, apply, applyAll };
}
