'use client';

import { useState } from 'react';
import { Pencil, Pause, Play } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import FriendForm from '@/components/friends/FriendForm';
import PushToggle from '@/components/friends/PushToggle';
import { setFriendActive } from '@/app/(app)/friends/actions';
import type { Friend } from '@/components/friends/useFriendForm';

const iconButton =
  'inline-flex h-9 w-9 items-center justify-center border-2 border-ink bg-surface shadow-retro-sm hover:-translate-x-0.5 hover:-translate-y-0.5';

export default function FriendsClient({ friends }: { friends: Friend[] }) {
  // null = closed, 'new' = add form, otherwise the friend being edited.
  const [editing, setEditing] = useState<Friend | 'new' | null>(null);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-ink">Friends</h1>
        <p className="text-muted">
          Characters who mention 4 words a day on Home, in their own voice. Friends talk casually,
          coworkers politely.
        </p>
      </section>

      <PushToggle />

      {editing ? (
        <FriendForm
          key={editing === 'new' ? 'new' : editing.id}
          friend={editing === 'new' ? null : editing}
          onDone={() => setEditing(null)}
        />
      ) : (
        <Button onClick={() => setEditing('new')}>+ Add a friend</Button>
      )}

      {friends.length === 0 && !editing && (
        <Card className="p-6 text-center text-muted">No friends yet. Add one to get daily words.</Card>
      )}

      <ul className="space-y-3">
        {friends.map((friend) => (
          <li key={friend.id}>
            <Card className={`space-y-2 p-4 ${friend.active ? '' : 'opacity-60'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-jp text-lg font-bold text-ink">{friend.name}</span>
                  <Badge variant={friend.relationship === 'coworker' ? 'neutral' : 'highlight'}>
                    {friend.relationship === 'coworker' ? 'Coworker' : 'Friend'}
                  </Badge>
                  {!friend.active && <Badge>Paused</Badge>}
                </div>
                <div className="flex gap-2">
                  <button type="button" aria-label={`Edit ${friend.name}`} onClick={() => setEditing(friend)} className={iconButton}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={friend.active ? `Pause ${friend.name}` : `Resume ${friend.name}`}
                    onClick={() => setFriendActive(friend.id, !friend.active)}
                    className={iconButton}
                  >
                    {friend.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {friend.themes.length > 0 && (
                <p className="text-sm text-fg">{friend.themes.join(' · ')}</p>
              )}
              {friend.persona && <p className="text-sm text-muted">{friend.persona}</p>}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
