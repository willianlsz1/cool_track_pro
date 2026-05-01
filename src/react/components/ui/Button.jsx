const BASE_CLASSES =
  'tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-rounded-md tw-font-medium tw-transition-colors tw-duration-150 tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-60';

const VARIANT_CLASSES = {
  primary: 'tw-bg-slate-900 tw-text-white hover:tw-bg-slate-800 focus-visible:tw-ring-slate-400',
  secondary:
    'tw-bg-slate-100 tw-text-slate-900 hover:tw-bg-slate-200 focus-visible:tw-ring-slate-300',
  ghost:
    'tw-bg-transparent tw-text-slate-700 hover:tw-bg-slate-100 focus-visible:tw-ring-slate-300',
  danger: 'tw-bg-red-600 tw-text-white hover:tw-bg-red-700 focus-visible:tw-ring-red-400',
  outline:
    'tw-border tw-border-slate-300 tw-bg-transparent tw-text-slate-800 hover:tw-bg-slate-50 focus-visible:tw-ring-slate-300',
  link: 'tw-bg-transparent tw-p-0 tw-text-sky-700 tw-underline-offset-4 hover:tw-underline focus-visible:tw-ring-sky-300',
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

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  return (
    <button
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
}
