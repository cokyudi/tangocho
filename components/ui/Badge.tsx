import type { ComponentPropsWithoutRef } from 'react';

type Variant = 'accent' | 'neutral' | 'highlight';

const variants: Record<Variant, string> = {
  accent: 'bg-accent text-on-accent',
  highlight: 'bg-highlight text-[#1b1916]',
  neutral: 'bg-surface text-fg',
};

export default function Badge({
  variant = 'neutral',
  className = '',
  children,
  ...rest
}: ComponentPropsWithoutRef<'span'> & { variant?: Variant }) {
  return (
    <span
      className={`inline-flex items-center border-2 border-ink px-2 py-0.5 text-xs font-display font-bold shadow-retro-sm ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
