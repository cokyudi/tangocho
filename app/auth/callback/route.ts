import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth';

// OAuth redirect target: exchange the code for a session, enforce the
// allowlist, then send the user into the app (or the denied screen).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isAllowedEmail(user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/denied`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
