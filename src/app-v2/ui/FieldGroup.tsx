import type { ReactNode } from 'react';

import { appV2Border, appV2Focus } from '../styles/tokens';

export interface FieldGroupProps {
  label: string;
  children: ReactNode;
  htmlFor?: string;
  optional?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export interface FormGridProps {
  children: ReactNode;
  className?: string;
  columns?: 'one' | 'two' | 'quoteItems';
}

export interface FormStackProps {
  children: ReactNode;
  className?: string;
}

export interface FormRowProps {
  children: ReactNode;
  className?: string;
  columns?: 'two' | 'quoteItems';
}

export const formGridClass = 'tw-grid-cols-1 tw-gap-x-5 tw-gap-y-5 md:tw-grid-cols-2';

export const fieldLabelClass =
  'tw-text-[0.7rem] tw-font-bold tw-uppercase tw-leading-4 tw-tracking-[0.02em] tw-text-[#1E4F8A]';

export const fieldInputClass = [
  'tw-box-border tw-min-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-[#F8FAFD] tw-px-3.5 tw-py-2',
  'tw-text-sm tw-font-medium tw-leading-5 tw-normal-case tw-tracking-normal tw-text-[#071A33]',
  'placeholder:tw-font-normal placeholder:tw-text-[#6F87A3]',
  appV2Border.default,
  appV2Focus,
].join(' ');

export const fieldTextareaClass = [
  fieldInputClass,
  'tw-min-h-20 tw-resize-y tw-py-3 md:tw-min-h-24',
].join(' ');

export const fieldSelectClass = [fieldInputClass, 'tw-appearance-auto'].join(' ');

export function FormGrid({ children, className = '', columns = 'two' }: FormGridProps) {
  const columnClass =
    columns === 'one'
      ? 'tw-grid-cols-1'
      : columns === 'quoteItems'
        ? 'tw-grid-cols-1 tw-gap-x-4 tw-gap-y-5 md:tw-grid-cols-[minmax(0,1fr)_minmax(120px,0.22fr)_minmax(180px,0.3fr)_auto] md:tw-items-end'
        : formGridClass;

  return <div className={`tw-grid ${columnClass} ${className}`}>{children}</div>;
}

export function FormStack({ children, className = '' }: FormStackProps) {
  return <div className={`tw-space-y-5 ${className}`}>{children}</div>;
}

export function FormRow({ children, className = '', columns = 'two' }: FormRowProps) {
  const columnClass =
    columns === 'quoteItems'
      ? 'tw-grid-cols-1 tw-gap-4 xl:tw-grid-cols-[minmax(0,1fr)_120px_220px_auto] xl:tw-items-end'
      : 'tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-2';

  return <div className={`tw-grid ${columnClass} ${className}`}>{children}</div>;
}

export function FieldGroup({
  label,
  children,
  htmlFor,
  optional = false,
  fullWidth = false,
  className = '',
}: FieldGroupProps) {
  const Wrapper = htmlFor ? 'label' : 'div';
  const wrapperProps = htmlFor ? { htmlFor } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`tw-flex tw-min-w-0 tw-flex-col tw-gap-2.5 ${fullWidth ? 'md:tw-col-span-2' : ''} ${className}`}
    >
      <span className={fieldLabelClass}>
        {label}
        {optional ? (
          <span className="tw-ml-1 tw-font-normal tw-normal-case tw-tracking-normal tw-text-[#8BA0BC]">
            (opcional)
          </span>
        ) : null}
      </span>
      {children}
    </Wrapper>
  );
}
