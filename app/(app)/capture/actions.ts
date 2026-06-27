'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';
import type { SourceType } from '@/constants/sources';

export type SaveWordInput = {
  term: string;
  reading: string;
  meaningId: string;
  meaningEn: string;
  partOfSpeech: string;
  jlpt: string;
  exampleJp: string;
  exampleFurigana: string | null;
  exampleTranslation: string;
  notes: string;
  sourceId: string | null;
  newSource: { type: SourceType; name: string; detail: string } | null;
};

type SaveResult = { ok: true } | { ok: false; error: string };

const clean = (s: string) => {
  const t = s.trim();
  return t.length ? t : null;
};

export async function saveWord(input: SaveWordInput): Promise<SaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowedEmail(user.email)) return { ok: false, error: 'Unauthorized' };

  if (!input.term.trim()) return { ok: false, error: 'Term is required' };

  let sourceId = input.sourceId;
  if (!sourceId && input.newSource && input.newSource.name.trim()) {
    const { data, error } = await supabase
      .from('sources')
      .insert({
        user_id: user.id,
        type: input.newSource.type,
        name: input.newSource.name.trim(),
        detail: clean(input.newSource.detail),
      })
      .select('id')
      .single();
    if (error) return { ok: false, error: error.message };
    sourceId = data.id;
  }

  const { error } = await supabase.from('words').insert({
    user_id: user.id,
    source_id: sourceId,
    term: input.term.trim(),
    reading: clean(input.reading),
    meaning_id: clean(input.meaningId),
    meaning_en: clean(input.meaningEn),
    part_of_speech: clean(input.partOfSpeech),
    jlpt: clean(input.jlpt),
    example_jp: clean(input.exampleJp),
    example_furigana: input.exampleFurigana,
    example_translation: clean(input.exampleTranslation),
    notes: clean(input.notes),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/browse');
  revalidatePath('/');
  return { ok: true };
}
