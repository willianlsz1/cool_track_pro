import { forwardRef } from 'react';

const BASE_CLASSES =
  'tw-h-11 tw-w-full tw-min-w-0 tw-rounded-xl tw-border tw-border-[var(--ct-border)] tw-bg-[var(--ct-surface-subtle)] tw-px-3.5 tw-text-sm tw-text-[var(--ct-text)] tw-outline-none tw-transition focus:tw-border-[var(--ct-brand-hover)] focus:tw-ring-2 focus:tw-ring-[rgba(144,184,248,0.22)] disabled:tw-cursor-not-allowed disabled:tw-opacity-55';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select ref={ref} className={cx(BASE_CLASSES, className)} {...props}>
      {children}
    </select>
  );
});
