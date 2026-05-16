import type { ReactNode } from 'react';

import { appV2Tone } from '../styles/tokens';
import { ActionButton, SectionCard, StatusBadge, type StatusBadgeTone } from '../ui/primitives';

interface ServiceStepCardProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
}

export function ServiceStepCard({ children, eyebrow, title, description }: ServiceStepCardProps) {
  return (
    <SectionCard className="tw-overflow-hidden sm:tw-p-6">
      <p
        className={`tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.16em] ${appV2Tone.subtleText}`}
      >
        {eyebrow}
      </p>
      <h1 className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight ${appV2Tone.text}`}>
        {title}
      </h1>
      {description ? (
        <p
          className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-normal tw-leading-6 ${appV2Tone.mutedText}`}
        >
          {description}
        </p>
      ) : null}
      <div className="tw-mt-6">{children}</div>
    </SectionCard>
  );
}

interface ServiceActionsProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  primaryDisabled?: boolean;
}

export function ServiceActions({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryDisabled = false,
}: ServiceActionsProps) {
  return (
    <div className="tw-mt-6 tw-grid tw-gap-3 sm:tw-grid-cols-[minmax(0,1fr)_minmax(0,180px)]">
      <ActionButton onClick={onPrimary} disabled={primaryDisabled}>
        {primaryLabel}
      </ActionButton>
      <ActionButton variant="secondary" onClick={onSecondary}>
        {secondaryLabel}
      </ActionButton>
    </div>
  );
}

export function ServiceInfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
      >
        {label}
      </p>
      <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-semibold tw-leading-5 ${appV2Tone.text}`}>
        {value}
      </p>
    </div>
  );
}

export function ServiceStatusBadge({
  tone,
  children,
}: {
  tone: StatusBadgeTone;
  children: ReactNode;
}) {
  return (
    <StatusBadge tone={tone} className="tw-border">
      {children}
    </StatusBadge>
  );
}
