'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';
import { tokyoDay } from '@/lib/progress';

type Result = { ok: true } | { ok: false; error: string };

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user && isAllowedEmail(user.email) ? { supabase, user } : null;
}

export async function saveSuggestions(ids: string[]): Promise<Result> {
  const ctx = await authed();
  if (!ctx) return { ok: false, error: 'Unauthorized' };
  const { supabase, user } = ctx;

  const { data: rows, error } = await supabase
    .from('daily_suggestions')
    .select('*, friends(source_id)')
    .in('id', ids)
    .eq('status', 'pending');
  if (error) return { ok: false, error: error.message };

  for (const s of rows) {
    const { data: word, error: wordError } = await supabase
      .from('words')
      .insert({
        user_id: user.id,
        source_id: s.friends?.source_id ?? null,
        term: s.term,
        reading: s.reading,
        meaning_en: s.meaning_en,
        meaning_id: s.meaning_id,
        part_of_speech: s.part_of_speech,
        jlpt: s.jlpt,
        example_jp: s.line_ja,
        example_furigana: s.line_furigana,
        example_translation: s.line_id,
      })
      .select('id')
      .single();
    if (wordError) return { ok: false, error: wordError.message };
    await supabase.from('daily_suggestions').update({ status: 'saved', word_id: word.id }).eq('id', s.id);
  }

  revalidatePath('/browse');
  return skipRest();
}

// Already known: not added to the word list; the status alone steers future picks.
export async function markKnown(id: string): Promise<Result> {
  const ctx = await authed();
  if (!ctx) return { ok: false, error: 'Unauthorized' };

  const { error } = await ctx.supabase
    .from('daily_suggestions')
    .update({ status: 'known' })
    .eq('id', id)
    .eq('status', 'pending');
  if (error) return { ok: false, error: error.message };

  revalidatePath('/');
  return { ok: true };
}

// Whatever is still pending today was seen and passed on; the next prompt learns from it.
export async function skipRest(): Promise<Result> {
  const ctx = await authed();
  if (!ctx) return { ok: false, error: 'Unauthorized' };

  const { error } = await ctx.supabase
    .from('daily_suggestions')
    .update({ status: 'skipped' })
    .eq('date', tokyoDay(new Date()))
    .eq('status', 'pending');
  if (error) return { ok: false, error: error.message };

  revalidatePath('/');
  return { ok: true };
}
