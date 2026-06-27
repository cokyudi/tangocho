import { Fragment } from 'react';

// Renders a sentence annotated in the 漢字[かな] convention as ruby text,
// e.g. "今日[きょう]は学校[がっこう]へ行[い]く。". Plain text (no brackets)
// renders unchanged, so it safely handles un-annotated examples too.
const TOKEN = /([一-龯々〆〇ヶ]+)\[([぀-ヿー]+)\]/g;

type Segment = { text: string } | { base: string; reading: string };

function parseFurigana(input: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const m of input.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) segments.push({ text: input.slice(last, i) });
    segments.push({ base: m[1], reading: m[2] });
    last = i + m[0].length;
  }
  if (last < input.length) segments.push({ text: input.slice(last) });
  return segments;
}

export default function FuriganaText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`font-jp ${className}`}>
      {parseFurigana(text).map((seg, i) =>
        'text' in seg ? (
          <Fragment key={i}>{seg.text}</Fragment>
        ) : (
          <ruby key={i}>
            {seg.base}
            <rt>{seg.reading}</rt>
          </ruby>
        ),
      )}
    </span>
  );
}
