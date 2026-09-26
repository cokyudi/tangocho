import { useEffect, useState } from 'react';
import {
  savePushSubscription,
  removePushSubscription,
  sendTestPush,
  type PushSubscriptionInput,
} from '@/app/(app)/friends/actions';

type State = 'loading' | 'unsupported' | 'denied' | 'off' | 'on';

// The VAPID public key is base64url; pushManager wants raw bytes.
function keyBytes(base64url: string) {
  const b64 = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

export function usePushToggle() {
  const [state, setState] = useState<State>('loading');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // iOS only exposes PushManager to the installed home-screen app.
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setState('denied');
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        // Re-save on every visit: heals a subscription the server never got.
        if (sub) savePushSubscription(sub.toJSON() as PushSubscriptionInput);
        setState(sub ? 'on' : 'off');
      });
  }, []);

  async function enable() {
    setBusy(true);
    setMessage(null);
    try {
      if ((await Notification.requestPermission()) !== 'granted') {
        setState('denied');
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      // Chrome's first registration with its push service can hang; don't spin forever.
      const sub = await Promise.race([
        reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyBytes(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timed out — try again')), 20_000),
        ),
      ]);
      const res = await savePushSubscription(sub.toJSON() as PushSubscriptionInput);
      if (res.ok) setState('on');
      else setMessage(res.error);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not enable notifications');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setMessage(null);
    const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
    if (sub) {
      await removePushSubscription(sub.endpoint);
      await sub.unsubscribe();
    }
    setState('off');
    setBusy(false);
  }

  async function test() {
    setBusy(true);
    const res = await sendTestPush();
    setMessage(res.ok ? 'Sent — check your notifications.' : res.error);
    setBusy(false);
  }

  return { state, busy, message, enable, disable, test };
}
