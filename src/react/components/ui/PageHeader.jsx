import { forwardRef } from 'react';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const PageHeader = forwardRef(function PageHeader(
  { title, description, subtitle, actions, filters, className = '', children, ...props },
  ref,
) {
  const supportText = description ?? subtitle;

  return (
    <header
      ref={ref}
      className={cx(
        'tw-min-w-0 tw-rounded-2xl tw-border tw-border-[var(--ct-border)] tw-bg-[var(--ct-surface)] tw-p-4 tw-text-[var(--ct-text)] tw-shadow-[var(--ct-shadow-soft)] sm:tw-p-5',
        className,
      )}
      {...props}
    >
      <div className="tw-flex tw-min-w-0 tw-flex-col tw-gap-3 lg:tw-flex-row lg:tw-items-start lg:tw-justify-between">
        <div className="tw-min-w-0">
          {title ? (
            <h1 className="tw-m-0 tw-truncate tw-text-2xl tw-font-bold tw-text-[var(--ct-text)]">
              {title}
            </h1>
          ) : null}
          {supportText ? (
            <p className="tw-mt-1 tw-text-sm tw-text-[var(--ct-text-muted)]">{supportText}</p>
          ) : null}
          {children}
        </div>
        {actions ? <div className="tw-shrink-0">{actions}</div> : null}
      </div>
      {filters ? <div className="tw-mt-4 tw-min-w-0">{filters}</div> : null}
    </header>
  );
});
