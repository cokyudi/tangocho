import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';
import { lookupJisho } from '@/lib/jisho';

// Reading of an arbitrary term, used by Speak mode to accept homophones:
// recognition returns 鑑賞 for 感傷 — same かんしょう, so the answer was said right.
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowedEmail(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const term = new URL(request.url).searchParams.get('q')?.trim();
  if (!term || term.length > 12) {
    return NextResponse.json({ error: 'Missing term' }, { status: 400 });
  }

  const entry = await lookupJisho(term);
  return NextResponse.json({ reading: entry?.reading ?? null });
}
