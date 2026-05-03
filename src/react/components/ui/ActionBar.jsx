import { forwardRef } from 'react';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const ActionBar = forwardRef(function ActionBar(
  { className = '', children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(
        'tw-flex tw-min-w-0 tw-flex-col tw-gap-2 sm:tw-flex-row sm:tw-items-center sm:tw-justify-end',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
