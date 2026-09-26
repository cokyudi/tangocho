'use client';

import { Bell, BellOff, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { usePushToggle } from '@/components/friends/usePushToggle';

const HINT: Record<string, string> = {
  unsupported: 'On iPhone, add tangocho to your Home Screen and open it from there to turn on notifications.',
  denied: 'Notifications are blocked for this site. Allow them in your browser or phone settings.',
};

export default function PushToggle() {
  const p = usePushToggle();
  if (p.state === 'loading') return null;

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {p.state === 'on' ? <Bell className="h-5 w-5 text-accent" /> : <BellOff className="h-5 w-5 text-muted" />}
          <p className="text-sm text-fg">
            {p.state === 'on' ? 'Daily notification at 07:00 is on.' : 'Get your friends’ words at 07:00 every day.'}
          </p>
        </div>
        {(p.state === 'on' || p.state === 'off') && (
          <Button
            variant={p.state === 'on' ? 'neutral' : 'accent'}
            onClick={p.state === 'on' ? p.disable : p.enable}
            disabled={p.busy}
            className="shrink-0"
          >
            {p.busy ? <Loader2 className="h-5 w-5 animate-spin" /> : p.state === 'on' ? 'Turn off' : 'Turn on'}
          </Button>
        )}
      </div>
      {HINT[p.state] && <p className="text-sm text-muted">{HINT[p.state]}</p>}
      {p.state === 'on' && (
        <button type="button" onClick={p.test} disabled={p.busy} className="font-display text-sm font-bold text-accent">
          Send a test notification →
        </button>
      )}
      {p.message && <p className="text-sm text-muted" aria-live="polite">{p.message}</p>}
    </Card>
  );
}
