import webpush from 'web-push';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export type PushPayload = { title: string; body: string; url: string };
type Subscription = { endpoint: string; p256dh: string; auth: string };

// Sends to every device; drops subscriptions the push service says are gone.
export async function sendPush(supabase: SupabaseClient<Database>, subs: Subscription[], payload: PushPayload) {
  webpush.setVapidDetails(
    'https://tangocho.yudidputra.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
      );
      sent++;
    } catch (err) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
      } else {
        console.error('push failed', status, err);
      }
    }
  }
  return sent;
}

// One daily push: the first friend's line, plus counts.
export function dailyPayload(
  suggestions: { line_ja: string; friends: { name: string } | null }[],
  due: number,
): PushPayload | null {
  const counts = [suggestions.length && `${suggestions.length} new words`, due && `${due} due`]
    .filter(Boolean)
    .join(' · ');
  if (!counts) return null;
  const first = suggestions[0];
  return {
    title: first ? `${first.friends?.name ?? '友達'}: 「${first.line_ja}」` : '今日の復習',
    body: counts,
    url: '/',
  };
}
