// Renders a term with furigana above it. Falls back to plain term when the
// reading is missing or identical (e.g. kana-only words).
export default function Furigana({
  term,
  reading,
  className = '',
}: {
  term: string;
  reading: string | null;
  className?: string;
}) {
  if (!reading || reading === term) {
    return <span className={`font-jp ${className}`}>{term}</span>;
  }
  return (
    <ruby className={`font-jp ${className}`}>
      {term}
      <rt>{reading}</rt>
    </ruby>
  );
}
