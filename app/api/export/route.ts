import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';

// Full backup of the user's data as a downloadable JSON file. RLS scopes every
// query to the signed-in user; the allowlist gate is belt-and-braces.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowedEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [sources, words, reviewLogs] = await Promise.all([
    supabase.from('sources').select('*').order('created_at'),
    supabase.from('words').select('*').order('created_at'),
    supabase.from('review_logs').select('*').order('reviewed_at'),
  ]);

  const err = sources.error ?? words.error ?? reviewLogs.error;
  if (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  const payload = {
    app: 'tangocho',
    version: 1,
    exported_at: new Date().toISOString(),
    sources: sources.data ?? [],
    words: words.data ?? [],
    review_logs: reviewLogs.data ?? [],
  };

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="tangocho-export-${date}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
