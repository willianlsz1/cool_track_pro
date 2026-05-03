import { forwardRef } from 'react';

const BASE_CLASSES =
  'tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-xl tw-font-semibold tw-transition tw-duration-150 tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-[rgba(144,184,248,0.28)] focus-visible:tw-ring-offset-2 focus-visible:tw-ring-offset-[var(--ct-app-bg)] disabled:tw-pointer-events-none disabled:tw-opacity-55';

const VARIANT_CLASSES = {
  primary:
    'tw-bg-[var(--ct-brand)] tw-text-white tw-shadow-[0_14px_30px_rgba(95,133,219,0.22)] hover:tw-bg-[var(--ct-brand-hover)]',
  secondary:
    'tw-border tw-border-[var(--ct-border)] tw-bg-[var(--ct-surface-subtle)] tw-text-[var(--ct-text)] hover:tw-border-[var(--ct-border-strong)] hover:tw-bg-[var(--ct-surface-raised)]',
  ghost:
    'tw-bg-transparent tw-text-[var(--ct-text-muted)] hover:tw-bg-[rgba(144,184,248,0.08)] hover:tw-text-[var(--ct-text)]',
  danger:
    'tw-border tw-border-[rgba(251,113,133,0.32)] tw-bg-[var(--ct-error)] tw-text-white hover:tw-bg-[#f43f5e]',
  premium:
    'tw-border tw-border-[rgba(217,164,65,0.32)] tw-bg-[rgba(217,164,65,0.14)] tw-text-[#F5C451] hover:tw-bg-[rgba(217,164,65,0.2)]',
  outline:
    'tw-border tw-border-[var(--ct-border)] tw-bg-transparent tw-text-[var(--ct-text)] hover:tw-border-[var(--ct-border-strong)] hover:tw-bg-[rgba(144,184,248,0.08)]',
  link: 'tw-bg-transparent tw-p-0 tw-text-[var(--ct-brand-hover)] tw-underline-offset-4 hover:tw-underline',
};

const SIZE_CLASSES = {
  sm: 'tw-h-8 tw-px-3 tw-text-sm',
  md: 'tw-h-10 tw-px-4 tw-text-sm',
  lg: 'tw-h-11 tw-px-5 tw-text-base',
  icon: 'tw-h-10 tw-w-10 tw-p-0',
};

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    type = 'button',
    className = '',
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        BASE_CLASSES,
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        fullWidth && 'tw-w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
