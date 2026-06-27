import Image from 'next/image';

// A minimal retro phone frame: thick ink bezel, hard offset shadow, notch.
export default function PhoneFrame({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="w-full border-2 border-ink bg-ink shadow-retro-lg">
      <div className="flex h-5 items-center justify-center">
        <span className="h-1.5 w-12 rounded-full bg-paper/50" />
      </div>
      <Image
        src={src}
        alt={alt}
        width={432}
        height={936}
        priority={priority}
        sizes="(min-width: 640px) 260px, 80vw"
        className="block h-auto w-full"
      />
    </div>
  );
}
