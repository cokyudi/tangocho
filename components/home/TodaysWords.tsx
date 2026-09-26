import Link from 'next/link';
import Card from '@/components/ui/Card';
import TodaysWordsCard from '@/components/home/TodaysWordsCard';
import { createClient } from '@/lib/supabase/server';
import { getTodaysSuggestions } from '@/lib/daily';

// Async so Home can stream around it while the day's set is generated.
export default async function TodaysWords() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const suggestions = await getTodaysSuggestions(supabase, user.id);
  if (suggestions.length) return <TodaysWordsCard suggestions={suggestions} />;

  const { count } = await supabase.from('friends').select('id', { count: 'exact', head: true });
  return (
    <Card className="space-y-2 p-5 text-center text-muted">
      <p>
        {count
          ? 'No words from your friends today — try again in a minute.'
          : 'Add a friend and they’ll mention 4 new words every day.'}
      </p>
      <Link href="/friends" className="inline-block font-display font-bold text-accent">
        {count ? 'Manage friends →' : 'Add a friend →'}
      </Link>
    </Card>
  );
}

export function TodaysWordsSkeleton() {
  return (
    <Card className="space-y-3 p-5" aria-busy>
      <p className="text-sm text-muted">Your friends are thinking of words…</p>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-12 animate-pulse bg-ink/10" />
      ))}
    </Card>
  );
}
