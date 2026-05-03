import { forwardRef } from 'react';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const Tabs = forwardRef(function Tabs(
  { className = '', children, role = 'tablist', ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      role={role}
      className={cx(
        'tw-flex tw-min-w-0 tw-max-w-full tw-gap-1.5 tw-overflow-x-auto tw-rounded-2xl tw-border tw-border-[var(--ct-border)] tw-bg-[var(--ct-surface-subtle)] tw-p-1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

const TabsItem = forwardRef(function TabsItem(
  { active = false, className = '', children, role = 'tab', ...props },
  ref,
) {
  const { ['aria-selected']: ariaSelected, ...rest } = props;
  const selected = ariaSelected ?? (active ? 'true' : 'false');

  return (
    <button
      ref={ref}
      type="button"
      role={role}
      aria-selected={selected}
      className={cx(
        'tw-inline-flex tw-h-9 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl tw-px-3 tw-text-sm tw-font-semibold tw-outline-none tw-transition focus-visible:tw-ring-2 focus-visible:tw-ring-[rgba(144,184,248,0.28)]',
        active
          ? 'tw-bg-[var(--ct-brand)] tw-text-white'
          : 'tw-text-[var(--ct-text-muted)] hover:tw-bg-[rgba(144,184,248,0.08)] hover:tw-text-[var(--ct-text)]',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

Tabs.Item = TabsItem;
