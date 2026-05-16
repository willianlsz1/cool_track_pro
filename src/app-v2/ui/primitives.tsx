import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { appV2Tone } from '../styles/tokens';

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <main
      className={`tw-mx-auto tw-box-border tw-flex tw-min-h-screen tw-w-full tw-max-w-[1280px] tw-flex-col tw-gap-5 tw-px-4 tw-pb-36 tw-pt-5 sm:tw-px-6 lg:tw-px-7 lg:tw-pb-8 lg:tw-pt-7 xl:tw-px-8 ${className}`}
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
      className={`tw-rounded-2xl tw-border tw-bg-white ${paddingClass} tw-shadow-[0_20px_52px_-40px_rgba(15,23,42,0.46)] ${appV2Tone.border} ${className}`}
    >
      {children}
    </section>
  );
}

export type StatusBadgeTone = 'danger' | 'warning' | 'success' | 'primary' | 'muted';

const statusBadgeToneClass: Record<StatusBadgeTone, string> = {
  danger: 'tw-bg-[#FEF2F2] tw-text-[#DC2626]',
  warning: 'tw-bg-[#FFF7ED] tw-text-[#D97706]',
  success: 'tw-bg-[#F0FDF4] tw-text-[#16A34A]',
  primary: 'tw-bg-[#EFF6FF] tw-text-[#2563EB]',
  muted: `tw-border tw-bg-[#F8FAFC] ${appV2Tone.border} ${appV2Tone.mutedText}`,
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
  const rowClass = `tw-min-w-0 tw-border-t tw-bg-white tw-px-5 tw-py-4 first:tw-border-t-0 ${appV2Tone.border} ${
    interactive ? `tw-transition hover:tw-bg-[#F8FAFC] ${appV2Tone.focus}` : ''
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
  primary: `${appV2Tone.action} tw-border-0 tw-shadow-[0_20px_34px_-22px_rgba(37,99,235,0.95)]`,
  secondary: `tw-border tw-bg-white tw-text-[#2563EB] ${appV2Tone.border}`,
  ghost: `tw-border tw-bg-[#F8FAFC] ${appV2Tone.border} ${appV2Tone.text}`,
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
      className={`tw-inline-flex tw-min-h-12 tw-items-center tw-justify-center tw-rounded-xl tw-px-5 tw-py-3 tw-text-sm tw-font-bold disabled:tw-cursor-not-allowed disabled:tw-border-[#D7E3F2] disabled:tw-bg-[#E8EEF7] disabled:tw-text-[#7A8AA6] disabled:tw-shadow-none ${actionButtonVariantClass[variant]} ${appV2Tone.focus} ${className}`}
    >
      {children}
    </button>
  );
}
