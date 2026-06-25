'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function HeaderSignOut() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signOut() {
    setLoading(true);
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      aria-label="Sign out"
      onClick={signOut}
      disabled={loading}
      className="inline-flex h-11 w-11 items-center justify-center border-2 border-ink bg-surface text-fg shadow-retro-sm transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-accent active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
    >
      <LogOut className="h-5 w-5" />
    </button>
  );
}
