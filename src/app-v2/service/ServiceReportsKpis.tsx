import { appV2Tone } from '../styles/tokens';
import { SectionCard } from '../ui/primitives';
import type { ServicesReportsKpiViewModel } from './servicesReportsViewModel';

interface ServiceReportsKpisProps {
  kpis: ServicesReportsKpiViewModel[];
}

const dotClass = {
  danger: 'tw-bg-[#DC2626]',
  warning: 'tw-bg-[#D97706]',
  success: 'tw-bg-[#16A34A]',
  primary: 'tw-bg-[#2563EB]',
  muted: 'tw-bg-[#94A3B8]',
};

export function ServiceReportsKpis({ kpis }: ServiceReportsKpisProps) {
  return (
    <div className="tw-grid tw-gap-3 sm:tw-grid-cols-2 xl:tw-grid-cols-4">
      {kpis.map((kpi) => (
        <SectionCard key={kpi.label} padding="sm" className="tw-relative tw-min-h-[112px]">
          <span
            className={`tw-absolute tw-right-4 tw-top-4 tw-h-2.5 tw-w-2.5 tw-rounded-full ${dotClass[kpi.tone]}`}
            aria-hidden="true"
          />
          <p
            className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            {kpi.label}
          </p>
          <p className={`tw-m-0 tw-mt-6 tw-text-2xl tw-font-bold ${appV2Tone.text}`}>{kpi.value}</p>
        </SectionCard>
      ))}
    </div>
  );
}
