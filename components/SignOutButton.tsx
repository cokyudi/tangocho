'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

export default function SignOutButton({
  className,
  variant = 'neutral',
}: {
  className?: string;
  variant?: 'accent' | 'neutral';
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signOut() {
    setLoading(true);
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <Button onClick={signOut} disabled={loading} variant={variant} className={className}>
      {loading ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
