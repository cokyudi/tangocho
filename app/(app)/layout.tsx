import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());
  const { count } = await supabase
    .from('words')
    .select('id', { count: 'exact', head: true })
    .or(`due_date.is.null,due_date.lte.${today}`);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border-2 focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:text-ink focus:shadow-retro"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-6">
        {children}
      </main>
      <BottomNav dueCount={count ?? 0} />
    </>
  );
}
