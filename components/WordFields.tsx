import Field, { inputClass } from '@/components/ui/Field';

export type WordFieldValues = {
  reading: string;
  meaningId: string;
  meaningEn: string;
  partOfSpeech: string;
  jlpt: string;
  exampleJp: string;
  exampleTranslation: string;
  notes: string;
};

export default function WordFields({
  fields,
  onChange,
  readingLabel = 'Reading',
  jlptPlaceholder,
}: {
  fields: WordFieldValues;
  onChange: (key: keyof WordFieldValues, value: string) => void;
  readingLabel?: string;
  jlptPlaceholder?: string;
}) {
  const input = (key: keyof WordFieldValues, className = inputClass, placeholder?: string) => (
    <input
      value={fields[key]}
      onChange={(e) => onChange(key, e.target.value)}
      className={className}
      placeholder={placeholder}
    />
  );

  return (
    <>
      <Field label={readingLabel}>{input('reading', `${inputClass} font-jp`)}</Field>
      <Field label="JLPT">{input('jlpt', inputClass, jlptPlaceholder)}</Field>
      <Field label="Meaning (Indonesian)" full>{input('meaningId')}</Field>
      <Field label="Meaning (English)" full>{input('meaningEn')}</Field>
      <Field label="Part of speech" full>{input('partOfSpeech')}</Field>
      <Field label="Example (Japanese)" full>{input('exampleJp', `${inputClass} font-jp`)}</Field>
      <Field label="Example (Indonesian)" full>{input('exampleTranslation')}</Field>
      <Field label="Notes" full>{input('notes')}</Field>
    </>
  );
}
