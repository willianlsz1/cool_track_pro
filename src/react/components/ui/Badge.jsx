const BASE_CLASSES =
  'tw-inline-flex tw-items-center tw-rounded-full tw-font-medium tw-leading-none tw-whitespace-nowrap';

const TONE_CLASSES = {
  neutral: 'tw-bg-slate-100 tw-text-slate-700',
  success: 'tw-bg-emerald-100 tw-text-emerald-700',
  warning: 'tw-bg-amber-100 tw-text-amber-800',
  danger: 'tw-bg-red-100 tw-text-red-700',
  info: 'tw-bg-sky-100 tw-text-sky-700',
  premium: 'tw-bg-violet-100 tw-text-violet-700',
};

const SIZE_CLASSES = {
  sm: 'tw-px-2 tw-py-1 tw-text-xs',
  md: 'tw-px-2.5 tw-py-1.5 tw-text-sm',
};

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Badge({ tone = 'neutral', size = 'md', className = '', children, ...props }) {
  return (
    <span
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
}
