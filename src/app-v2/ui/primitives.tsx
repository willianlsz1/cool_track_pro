import type { ButtonHTMLAttributes, ReactNode } from 'react';

import {
  appV2Border,
  appV2Interactive,
  appV2Shadow,
  appV2Status,
  appV2Surface,
  appV2Text,
  appV2Tone,
} from '../styles/tokens';

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <main
      className={`tw-mx-auto tw-box-border tw-flex tw-min-h-screen tw-w-full tw-max-w-none tw-flex-col tw-gap-5 tw-px-4 tw-pb-36 tw-pt-5 sm:tw-px-6 lg:tw-px-7 lg:tw-pb-8 lg:tw-pt-7 xl:tw-px-8 ${className}`}
    >
      {children}
    </main>
  );
}

type SectionCardProps = {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  label?: string;
  padding?: 'sm' | 'md';
};

export function SectionCard({
  children,
  className = '',
  labelledBy,
  label,
  padding = 'md',
}: SectionCardProps) {
  const paddingClass = padding === 'sm' ? 'tw-p-4' : 'tw-p-5';

  return (
    <section
      aria-label={label}
      aria-labelledby={labelledBy}
      className={`tw-rounded-2xl tw-border ${appV2Surface.card} ${paddingClass} ${appV2Shadow.card} ${appV2Border.default} ${className}`}
    >
      {children}
    </section>
  );
}

type SectionEyebrowProps = {
  children: ReactNode;
  className?: string;
};

export function SectionEyebrow({ children, className = '' }: SectionEyebrowProps) {
  return (
    <p
      className={`tw-m-0 tw-inline-flex tw-rounded-full tw-bg-[#EFF6FF] tw-px-3 tw-py-1 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-leading-4 tw-tracking-[0.04em] tw-text-[#1E4F8A] ${className}`}
    >
      {children}
    </p>
  );
}

export type StatusBadgeTone = 'danger' | 'warning' | 'success' | 'primary' | 'muted';

const statusBadgeToneClass: Record<StatusBadgeTone, string> = {
  danger: `${appV2Status.danger.surface} ${appV2Status.danger.text}`,
  warning: `${appV2Status.warning.surface} ${appV2Status.warning.text}`,
  success: `${appV2Status.success.surface} ${appV2Status.success.text}`,
  primary: `${appV2Status.primary.surface} ${appV2Status.primary.text}`,
  muted: `tw-border ${appV2Status.muted.surface} ${appV2Status.muted.border} ${appV2Status.muted.text}`,
};

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusBadgeTone;
  className?: string;
};

export function StatusBadge({ children, tone = 'muted', className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`tw-inline-flex tw-items-center tw-rounded-md tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold ${statusBadgeToneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

type ListRowProps = {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
};

export function ListRow({ children, className = '', interactive = false, onClick }: ListRowProps) {
  const rowClass = `tw-min-w-0 tw-border-t ${appV2Surface.card} tw-px-5 tw-py-4 first:tw-border-t-0 ${appV2Border.default} ${
    interactive ? `tw-transition ${appV2Interactive.hoverMuted} ${appV2Tone.focus}` : ''
  } ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`tw-w-full tw-border-x-0 tw-border-b-0 tw-text-left ${rowClass}`}
      >
        {children}
      </button>
    );
  }

  return <div className={rowClass}>{children}</div>;
}

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

const actionButtonVariantClass = {
  primary: `${appV2Tone.action} tw-border-0 ${appV2Shadow.action}`,
  secondary: `tw-border ${appV2Surface.card} ${appV2Text.action} ${appV2Border.default}`,
  ghost: `tw-border ${appV2Surface.muted} ${appV2Border.default} ${appV2Text.primary}`,
};

export function ActionButton({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`tw-inline-flex tw-min-h-12 tw-items-center tw-justify-center tw-rounded-xl tw-px-5 tw-py-3 tw-text-sm tw-font-bold disabled:tw-cursor-not-allowed ${appV2Interactive.disabledControl} ${actionButtonVariantClass[variant]} ${appV2Tone.focus} ${className}`}
    >
      {children}
    </button>
  );
}
