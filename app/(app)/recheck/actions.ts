'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';

export type JishoFields = { reading?: string; part_of_speech?: string; jlpt?: string };

export async function applyJishoFields(
  id: string,
  fields: JishoFields,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowedEmail(user.email)) return { ok: false, error: 'Unauthorized' };
  if (!Object.keys(fields).length) return { ok: false, error: 'Nothing to apply' };

  const { error } = await supabase.from('words').update(fields).eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/browse');
  return { ok: true };
}
