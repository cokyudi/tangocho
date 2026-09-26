'use client';

import { Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Field, { inputClass } from '@/components/ui/Field';
import { useFriendForm, type Friend } from '@/components/friends/useFriendForm';

export default function FriendForm({ friend, onDone }: { friend: Friend | null; onDone: () => void }) {
  const f = useFriendForm(friend, onDone);

  return (
    <Card className="space-y-4 p-5">
      <h2 className="font-display text-lg font-bold text-ink">{friend ? `Edit ${friend.name}` : 'New friend'}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name">
          <input value={f.name} onChange={(e) => f.setName(e.target.value)} placeholder="田中" className={inputClass} />
        </Field>
        <Field label="Relationship">
          <select
            value={f.relationship}
            onChange={(e) => f.setRelationship(e.target.value as typeof f.relationship)}
            className={inputClass}
          >
            <option value="friend">Friend (casual)</option>
            <option value="coworker">Coworker (polite)</option>
          </select>
        </Field>
        <Field label="Themes (comma-separated)" full>
          <input
            value={f.themes}
            onChange={(e) => f.setThemes(e.target.value)}
            placeholder="IT, meetings, ramen"
            className={inputClass}
          />
        </Field>
        <Field label="Persona" full>
          <textarea
            value={f.persona}
            onChange={(e) => f.setPersona(e.target.value)}
            rows={3}
            placeholder="30s engineer, dry humour, loves camping"
            className={inputClass}
          />
        </Field>
      </div>
      {f.error && <p className="text-sm font-display font-bold text-accent">{f.error}</p>}
      <div className="flex gap-3">
        <Button onClick={f.onSave} disabled={f.saving} className="flex-1">
          {f.saving ? <Loader2 className="h-5 w-5 animate-spin" /> : friend ? 'Save changes' : 'Add friend'}
        </Button>
        <Button variant="neutral" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}
