import type { ComponentPropsWithoutRef } from 'react';

export default function Card({
  className = '',
  children,
  ...rest
}: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={`border-2 border-ink bg-surface shadow-retro ${className}`} {...rest}>
      {children}
    </div>
  );
}
