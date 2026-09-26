import { useState } from 'react';
import { saveFriend, type Relationship } from '@/app/(app)/friends/actions';

export type Friend = {
  id: string;
  name: string;
  relationship: string;
  themes: string[];
  persona: string | null;
  active: boolean;
};

export function useFriendForm(friend: Friend | null, onDone: () => void) {
  const [name, setName] = useState(friend?.name ?? '');
  const [relationship, setRelationship] = useState<Relationship>(
    friend?.relationship === 'coworker' ? 'coworker' : 'friend',
  );
  // Edited as one comma-separated string, stored as text[].
  const [themes, setThemes] = useState(friend?.themes.join(', ') ?? '');
  const [persona, setPersona] = useState(friend?.persona ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setSaving(true);
    setError(null);
    const res = await saveFriend({
      id: friend?.id ?? null,
      name,
      relationship,
      themes: themes.split(/[,、]/),
      persona,
    });
    setSaving(false);
    if (res.ok) onDone();
    else setError(res.error);
  }

  return {
    name, setName,
    relationship, setRelationship,
    themes, setThemes,
    persona, setPersona,
    saving, error, onSave,
  };
}
