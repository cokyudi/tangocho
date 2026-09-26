import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTodaysSuggestions } from '@/lib/daily';
import { dailyPayload, sendPush } from '@/lib/push';
import { tokyoDay } from '@/lib/progress';

// Vercel cron, daily 07:00 JST (vercel.json). Pre-generates today's friend
// words so Home opens instantly, then sends one push per subscribed user.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: subs, error } = await supabase.from('push_subscriptions').select('user_id, endpoint, p256dh, auth');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const today = tokyoDay(new Date());
  let sent = 0;
  for (const userId of new Set(subs.map((s) => s.user_id))) {
    const suggestions = await getTodaysSuggestions(supabase, userId);
    const { count } = await supabase
      .from('words')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .or(`due_date.is.null,due_date.lte.${today}`);
    const payload = dailyPayload(suggestions, count ?? 0);
    if (payload) sent += await sendPush(supabase, subs.filter((s) => s.user_id === userId), payload);
  }

  return NextResponse.json({ ok: true, sent });
}
