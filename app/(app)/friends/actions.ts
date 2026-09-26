'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';

export type Relationship = 'friend' | 'coworker';

export type FriendInput = {
  id: string | null;
  name: string;
  relationship: Relationship;
  themes: string[];
  persona: string;
};

type Result = { ok: true } | { ok: false; error: string };

async function authed() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user && isAllowedEmail(user.email) ? { supabase, user } : null;
}

const sourceDetail = (r: Relationship) => (r === 'coworker' ? 'AI coworker' : 'AI friend');

// A friend owns a 'person' source so the words it suggests are tagged with it.
export async function saveFriend(input: FriendInput): Promise<Result> {
  const ctx = await authed();
  if (!ctx) return { ok: false, error: 'Unauthorized' };
  const { supabase, user } = ctx;

  const name = input.name.trim();
  if (!name) return { ok: false, error: 'Name is required' };
  const fields = {
    name,
    relationship: input.relationship,
    themes: input.themes.map((t) => t.trim()).filter(Boolean),
    persona: input.persona.trim() || null,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from('friends')
      .update(fields)
      .eq('id', input.id)
      .select('source_id')
      .single();
    if (error) return { ok: false, error: error.message };
    await supabase
      .from('sources')
      .update({ name, detail: sourceDetail(input.relationship) })
      .eq('id', data.source_id);
  } else {
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .insert({ user_id: user.id, type: 'person', name, detail: sourceDetail(input.relationship) })
      .select('id')
      .single();
    if (sourceError) return { ok: false, error: sourceError.message };
    const { error } = await supabase
      .from('friends')
      .insert({ ...fields, user_id: user.id, source_id: source.id });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath('/friends');
  return { ok: true };
}

export async function setFriendActive(id: string, active: boolean): Promise<Result> {
  const ctx = await authed();
  if (!ctx) return { ok: false, error: 'Unauthorized' };

  const { error } = await ctx.supabase.from('friends').update({ active }).eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/friends');
  return { ok: true };
}
