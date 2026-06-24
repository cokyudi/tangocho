import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'accent' | 'neutral';

const classes = (variant: Variant, className = '') =>
  [
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-display font-bold border-2 border-ink shadow-retro transition-transform duration-150',
    'hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
    variant === 'accent' ? 'bg-accent text-on-accent' : 'bg-surface text-fg',
    className,
  ].join(' ');

type CommonProps = { variant?: Variant; className?: string; children: ReactNode };
type ButtonProps = CommonProps & ComponentPropsWithoutRef<'button'> & { href?: undefined };
type LinkProps = CommonProps & ComponentPropsWithoutRef<'a'> & { href: string };

export default function Button(props: ButtonProps | LinkProps) {
  if ('href' in props && props.href) {
    const { variant = 'accent', className, children, href, ...rest } = props;
    if (/^(https?:|mailto:|tel:)/.test(href)) {
      return (
        <a href={href} className={classes(variant, className)} {...rest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes(variant, className)} {...rest}>
        {children}
      </Link>
    );
  }
  const { variant = 'accent', className, children, ...rest } = props as ButtonProps;
  return (
    <button className={classes(variant, className)} {...rest}>
      {children}
    </button>
  );
}
