import Image from 'next/image';

// The omamori mascot: 64px pixel art in public/mascot/, shown at 2x with crisp pixels (unoptimized, so Next
// doesn't resample it). Decorative only, next to copy that already says what's going on.
export default function Mascot({ pose }: { pose: 'celebrate' | 'card' }) {
  return (
    <Image
      src={`/mascot/${pose}.png`}
      alt=""
      aria-hidden
      width={128}
      height={128}
      unoptimized
      className="[image-rendering:pixelated]"
    />
  );
}
