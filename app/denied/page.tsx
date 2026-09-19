import { Lock } from 'lucide-react';
import Card from '@/components/ui/Card';
import SignOutButton from '@/components/SignOutButton';

export const metadata = { title: 'Not allowed' };

export default function DeniedPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="inline-flex items-center gap-3 font-display text-3xl font-bold text-ink">
        Sorry, this one&apos;s private
        <Lock aria-hidden className="h-7 w-7 shrink-0 text-accent" strokeWidth={2.5} />
      </h1>
      <Card className="w-full space-y-4 p-6">
        <p className="text-muted">
          tangocho is a personal app for one account. That Google account isn&apos;t on the
          allowlist.
        </p>
        <SignOutButton variant="accent" className="w-full" />
      </Card>
    </main>
  );
}
