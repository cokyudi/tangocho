'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';
import { reviewSrs, type Rating } from '@/lib/srs';

type ReviewResult = { ok: true; due_date: string } | { ok: false; error: string };

export async function reviewWord(wordId: string, rating: Rating): Promise<ReviewResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowedEmail(user.email)) return { ok: false, error: 'Unauthorized' };

  // Re-fetch current SRS state server-side (don't trust the client).
  const { data: word, error: fErr } = await supabase
    .from('words')
    .select('ease_factor, interval, repetitions')
    .eq('id', wordId)
    .single();
  if (fErr || !word) return { ok: false, error: fErr?.message ?? 'Word not found' };

  const next = reviewSrs(
    { ease_factor: word.ease_factor, interval: word.interval, repetitions: word.repetitions },
    rating,
  );

  const { error: uErr } = await supabase
    .from('words')
    .update({
      ease_factor: next.ease_factor,
      interval: next.interval,
      repetitions: next.repetitions,
      due_date: next.due_date,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq('id', wordId);
  if (uErr) return { ok: false, error: uErr.message };

  await supabase.from('review_logs').insert({
    user_id: user.id,
    word_id: wordId,
    rating,
    prev_interval: word.interval,
    new_interval: next.interval,
    prev_ef: word.ease_factor,
    new_ef: next.ease_factor,
  });

  revalidatePath('/');
  revalidatePath('/practice');
  revalidatePath('/browse');
  return { ok: true, due_date: next.due_date };
}
