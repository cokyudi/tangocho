'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';
import { sendPush } from '@/lib/push';

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

export type PushSubscriptionInput = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function savePushSubscription(sub: PushSubscriptionInput): Promise<Result> {
  const ctx = await authed();
  if (!ctx) return { ok: false, error: 'Unauthorized' };
  // The server POSTs to this URL later, so only accept real push-service endpoints.
  if (!sub.endpoint.startsWith('https://')) return { ok: false, error: 'Invalid subscription' };

  const { error } = await ctx.supabase.from('push_subscriptions').upsert(
    { user_id: ctx.user.id, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    { onConflict: 'endpoint' },
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function removePushSubscription(endpoint: string): Promise<Result> {
  const ctx = await authed();
  if (!ctx) return { ok: false, error: 'Unauthorized' };

  const { error } = await ctx.supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// Lets me check a device right away instead of waiting for the 07:00 cron.
export async function sendTestPush(): Promise<Result> {
  const ctx = await authed();
  if (!ctx) return { ok: false, error: 'Unauthorized' };

  const { data: subs } = await ctx.supabase.from('push_subscriptions').select('endpoint, p256dh, auth');
  if (!subs?.length) return { ok: false, error: 'No device has notifications on' };
  const sent = await sendPush(ctx.supabase, subs, {
    title: 'tangocho',
    body: 'Notifications are on. Friend words arrive at 07:00.',
    url: '/friends',
  });
  return sent ? { ok: true } : { ok: false, error: 'Push failed — check the server log' };
}
