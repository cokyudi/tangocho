import Card from '@/components/ui/Card';

export const metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="font-display text-3xl font-bold text-ink">
        You&apos;re offline <span className="text-accent">📡</span>
      </h1>
      <Card className="w-full p-6 text-muted">
        <p>tangocho needs a connection to load your words. Reconnect and try again.</p>
      </Card>
    </div>
  );
}
