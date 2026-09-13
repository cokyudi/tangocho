'use client';

import { Loader2, Check } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SourceField, { type Source } from '@/components/SourceField';
import WordFields from '@/components/WordFields';
import TermInput from '@/components/capture/TermInput';
import { useCaptureForm } from '@/components/capture/useCaptureForm';

export default function CaptureForm({ sources }: { sources: Source[] }) {
  const { termInput, fields, setField, source, setSource, saving, error, savedCount, onSave } =
    useCaptureForm();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Capture</h1>
        {savedCount > 0 && (
          <Badge variant="accent" className="gap-1">
            <Check className="h-3.5 w-3.5" /> {savedCount} saved
          </Badge>
        )}
      </div>

      <TermInput {...termInput} />

      <Card className="grid grid-cols-2 gap-3 p-4">
        <WordFields
          fields={fields}
          onChange={setField}
          readingLabel="Reading (furigana)"
          jlptPlaceholder="N5…N1"
        />
      </Card>

      <Card className="p-4">
        <SourceField sources={sources} value={source} onChange={setSource} />
      </Card>

      {error && <p className="text-sm font-display font-bold text-accent">{error}</p>}

      <Button onClick={onSave} disabled={saving} className="w-full">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save word'}
      </Button>
    </div>
  );
}
