'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';
import { tokyoDay } from '@/lib/progress';
import { addDays } from '@/lib/srs';

type Result = { ok: true } | { ok: false; error: string };

// "Known" = mastered right away: masteryLevel() needs repetitions > 0 and interval > 90.
const KNOWN_INTERVAL = 180;

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user && isAllowedEmail(user.email) ? { supabase, user } : null;
}

async function saveAs(ids: string[], status: 'saved' | 'known'): Promise<Result> {
  const ctx = await authed();
  if (!ctx) return { ok: false, error: 'Unauthorized' };
  const { supabase, user } = ctx;

  const { data: rows, error } = await supabase
    .from('daily_suggestions')
    .select('*, friends(source_id)')
    .in('id', ids)
    .eq('status', 'pending');
  if (error) return { ok: false, error: error.message };

  const srs =
    status === 'known'
      ? {
          repetitions: 1,
          interval: KNOWN_INTERVAL,
          due_date: addDays(new Date(), KNOWN_INTERVAL),
          last_reviewed_at: new Date().toISOString(),
        }
      : {};

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
        ...srs,
      })
      .select('id')
      .single();
    if (wordError) return { ok: false, error: wordError.message };
    await supabase.from('daily_suggestions').update({ status, word_id: word.id }).eq('id', s.id);
  }

  revalidatePath('/');
  revalidatePath('/browse');
  return { ok: true };
}

export async function saveSuggestions(ids: string[]): Promise<Result> {
  const res = await saveAs(ids, 'saved');
  return res.ok ? skipRest() : res;
}

export async function markKnown(id: string): Promise<Result> {
  return saveAs([id], 'known');
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
