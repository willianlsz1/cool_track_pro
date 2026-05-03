import { forwardRef } from 'react';

const BASE_CLASSES =
  'tw-inline-flex tw-min-w-0 tw-max-w-full tw-truncate tw-items-center tw-gap-1.5 tw-rounded-full tw-border tw-px-2.5 tw-py-1 tw-text-xs tw-font-semibold tw-leading-none';

const TONE_CLASSES = {
  neutral:
    'tw-border-[var(--ct-border)] tw-bg-[rgba(244,247,251,0.06)] tw-text-[var(--ct-text-muted)]',
  success:
    'tw-border-[rgba(74,222,128,0.24)] tw-bg-[var(--ct-success-soft)] tw-text-[var(--ct-success)]',
  info: 'tw-border-[rgba(144,184,248,0.24)] tw-bg-[var(--ct-info-soft)] tw-text-[var(--ct-info)]',
  warning: 'tw-border-[rgba(251,191,36,0.24)] tw-bg-[var(--ct-warn-soft)] tw-text-[var(--ct-warn)]',
  danger:
    'tw-border-[rgba(251,113,133,0.24)] tw-bg-[var(--ct-error-soft)] tw-text-[var(--ct-error)]',
  premium: 'tw-border-[rgba(217,164,65,0.26)] tw-bg-[rgba(217,164,65,0.14)] tw-text-[#F5C451]',
};

const DOT_CLASSES = {
  neutral: 'tw-bg-[var(--ct-text-faint)]',
  success: 'tw-bg-[var(--ct-success)]',
  info: 'tw-bg-[var(--ct-info)]',
  warning: 'tw-bg-[var(--ct-warn)]',
  danger: 'tw-bg-[var(--ct-error)]',
  premium: 'tw-bg-[var(--ct-gold)]',
};

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const StatusPill = forwardRef(function StatusPill(
  { tone = 'neutral', dot = false, className = '', children, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx(BASE_CLASSES, TONE_CLASSES[tone] || TONE_CLASSES.neutral, className)}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cx(
            'tw-h-1.5 tw-w-1.5 tw-shrink-0 tw-rounded-full',
            DOT_CLASSES[tone] || DOT_CLASSES.neutral,
          )}
        />
      ) : null}
      <span className="tw-min-w-0 tw-truncate">{children}</span>
    </span>
  );
});
