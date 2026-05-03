import { forwardRef } from 'react';

const BASE_CLASSES =
  'tw-min-w-0 tw-rounded-2xl tw-border tw-border-[var(--ct-border)] tw-text-[var(--ct-text)]';

const VARIANT_CLASSES = {
  default: 'tw-bg-[var(--ct-surface)] tw-shadow-[var(--ct-shadow-soft)]',
  raised: 'tw-bg-[var(--ct-surface-raised)] tw-shadow-[var(--ct-shadow-soft)]',
  subtle: 'tw-bg-[var(--ct-surface-subtle)] tw-shadow-none',
  interactive:
    'tw-bg-[var(--ct-surface)] tw-shadow-[var(--ct-shadow-soft)] tw-transition hover:tw-border-[var(--ct-border-strong)] hover:tw-bg-[var(--ct-surface-raised)]',
};

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const Card = forwardRef(function Card(
  { as: Component = 'div', variant = 'default', className = '', children, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={cx(BASE_CLASSES, VARIANT_CLASSES[variant] || VARIANT_CLASSES.default, className)}
      {...props}
    >
      {children}
    </Component>
  );
});
