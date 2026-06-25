'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-ink">
          tangocho<span className="ml-1 text-accent">単語帳</span>
        </h1>
        <p className="mt-2 text-muted">Your personal Japanese vocabulary notebook.</p>
      </div>

      <Card className="w-full space-y-4 p-6 text-center">
        <p className="text-sm text-muted">This is a private app. Sign in to continue.</p>
        <Button onClick={signIn} disabled={loading} className="w-full">
          {loading ? 'Redirecting…' : 'Continue with Google'}
        </Button>
        {error && <p className="text-sm text-accent">{error}</p>}
      </Card>
    </div>
  );
}
