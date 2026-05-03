import { forwardRef } from 'react';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const Table = forwardRef(function Table({ className = '', children, ...props }, ref) {
  return (
    <div className="tw-w-full tw-min-w-0 tw-overflow-x-auto tw-rounded-2xl tw-border tw-border-[var(--ct-border)] tw-bg-[var(--ct-surface)]">
      <table
        ref={ref}
        className={cx(
          'tw-w-full tw-min-w-full tw-border-collapse tw-text-left tw-text-sm tw-text-[var(--ct-text)] [&_td]:tw-border-t [&_td]:tw-border-[var(--ct-border)] [&_td]:tw-px-4 [&_td]:tw-py-3 [&_th]:tw-bg-[var(--ct-surface-subtle)] [&_th]:tw-px-4 [&_th]:tw-py-3 [&_th]:tw-text-xs [&_th]:tw-font-bold [&_th]:tw-uppercase [&_th]:tw-text-[var(--ct-text-faint)] [&_tr]:tw-transition hover:[&_tbody_tr]:tw-bg-[rgba(144,184,248,0.08)]',
          className,
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
});
