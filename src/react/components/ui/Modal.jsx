import { forwardRef, useId } from 'react';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const Modal = forwardRef(function Modal(
  {
    open = true,
    title,
    footer,
    onClose,
    className = '',
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...props
  },
  ref,
) {
  const generatedTitleId = useId();

  if (!open) return null;

  const titleId = title && !ariaLabelledBy ? generatedTitleId : undefined;

  return (
    <div
      data-ui="modal-overlay"
      className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-[rgba(10,12,16,0.72)] tw-p-4"
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy || titleId}
        className={cx(
          'tw-flex tw-max-h-[min(88vh,760px)] tw-w-full tw-max-w-2xl tw-min-w-0 tw-flex-col tw-overflow-hidden tw-rounded-2xl tw-border tw-border-[var(--ct-border)] tw-bg-[var(--ct-surface)] tw-text-[var(--ct-text)] tw-shadow-[0_30px_80px_rgba(0,0,0,0.42)]',
          className,
        )}
        {...props}
      >
        {(title || onClose) && (
          <div className="tw-flex tw-shrink-0 tw-items-center tw-justify-between tw-gap-3 tw-border-b tw-border-[var(--ct-border)] tw-px-5 tw-py-4">
            {title ? (
              <h2 id={titleId} className="tw-m-0 tw-min-w-0 tw-truncate tw-text-lg tw-font-bold">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {onClose ? (
              <button
                type="button"
                data-action="close-modal"
                className="tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-xl tw-border tw-border-[var(--ct-border)] tw-bg-[var(--ct-surface-subtle)] tw-text-[var(--ct-text-muted)] tw-outline-none tw-transition hover:tw-bg-[var(--ct-surface-raised)] hover:tw-text-[var(--ct-text)] focus-visible:tw-ring-2 focus-visible:tw-ring-[rgba(144,184,248,0.28)]"
                onClick={onClose}
                aria-label="Fechar"
              >
                x
              </button>
            ) : null}
          </div>
        )}
        <div className="tw-min-h-0 tw-flex-1 tw-overflow-y-auto tw-p-5">{children}</div>
        {footer ? (
          <div className="tw-shrink-0 tw-border-t tw-border-[var(--ct-border)] tw-px-5 tw-py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
});
