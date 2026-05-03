import { forwardRef } from 'react';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const EmptyState = forwardRef(function EmptyState(
  { icon, title, description, action, className = '', children, ...props },
  ref,
) {
  return (
    <section
      ref={ref}
      className={cx(
        'tw-flex tw-min-w-0 tw-flex-col tw-items-center tw-justify-center tw-rounded-2xl tw-border tw-border-dashed tw-border-[var(--ct-border)] tw-bg-[var(--ct-surface)] tw-p-6 tw-text-center tw-text-[var(--ct-text)]',
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="tw-mb-3 tw-flex tw-h-11 tw-w-11 tw-items-center tw-justify-center tw-rounded-2xl tw-bg-[var(--ct-surface-subtle)] tw-text-[var(--ct-brand-hover)]">
          {icon}
        </div>
      ) : null}
      {title ? (
        <h2 className="tw-m-0 tw-text-lg tw-font-bold tw-text-[var(--ct-text)]">{title}</h2>
      ) : null}
      {description ? (
        <p className="tw-mt-2 tw-max-w-xl tw-text-sm tw-text-[var(--ct-text-muted)]">
          {description}
        </p>
      ) : null}
      {children}
      {action ? <div className="tw-mt-4">{action}</div> : null}
    </section>
  );
});
