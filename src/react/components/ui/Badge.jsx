import { forwardRef } from 'react';

const BASE_CLASSES =
  'tw-inline-flex tw-min-w-0 tw-max-w-full tw-items-center tw-rounded-full tw-border tw-font-medium tw-leading-none tw-whitespace-nowrap';

const TONE_CLASSES = {
  neutral:
    'tw-border-[var(--ct-border)] tw-bg-[rgba(244,247,251,0.06)] tw-text-[var(--ct-text-muted)]',
  success:
    'tw-border-[rgba(74,222,128,0.24)] tw-bg-[var(--ct-success-soft)] tw-text-[var(--ct-success)]',
  warning: 'tw-border-[rgba(251,191,36,0.24)] tw-bg-[var(--ct-warn-soft)] tw-text-[var(--ct-warn)]',
  danger:
    'tw-border-[rgba(251,113,133,0.24)] tw-bg-[var(--ct-error-soft)] tw-text-[var(--ct-error)]',
  info: 'tw-border-[rgba(144,184,248,0.24)] tw-bg-[var(--ct-info-soft)] tw-text-[var(--ct-info)]',
  premium: 'tw-border-[rgba(217,164,65,0.26)] tw-bg-[rgba(217,164,65,0.14)] tw-text-[#F5C451]',
};

const SIZE_CLASSES = {
  sm: 'tw-px-2 tw-py-1 tw-text-xs',
  md: 'tw-px-2.5 tw-py-1.5 tw-text-sm',
};

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const Badge = forwardRef(function Badge(
  { tone = 'neutral', size = 'md', className = '', children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(
        BASE_CLASSES,
        TONE_CLASSES[tone] || TONE_CLASSES.neutral,
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
});
