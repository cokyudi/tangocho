import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAllowedEmail } from '@/lib/auth';

// Paths reachable without an authenticated, allowlisted session.
const PUBLIC_PATHS = ['/login', '/denied', '/auth', '/offline', '/about'];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Setup guard: until Supabase env is configured, don't enforce auth (there is
  // no backend or data to protect yet). Full protection activates once set.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    // A signed-in, allowlisted user landing on /login goes straight to the app.
    if (pathname === '/login' && user && isAllowedEmail(user.email)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  if (!user) {
    // Guests landing on the root see the public showcase; everything else
    // routes to sign-in.
    return NextResponse.redirect(new URL(pathname === '/' ? '/about' : '/login', request.url));
  }

  if (!isAllowedEmail(user.email)) {
    return NextResponse.redirect(new URL('/denied', request.url));
  }

  return response;
}
