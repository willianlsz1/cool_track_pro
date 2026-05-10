import { appV2Tone } from '../styles/tokens';
import type { ServiceInProgressViewModel } from './servicesHomeViewModel';

interface ServiceInProgressCardProps {
  service: ServiceInProgressViewModel;
  onResumeService: () => void;
}

export function ServiceInProgressCard({ service, onResumeService }: ServiceInProgressCardProps) {
  return (
    <section className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
      <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>Em andamento</p>
      <h2 className={`tw-mt-1 tw-text-2xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
        {service.equipmentName}
      </h2>
      <p className={`tw-mt-2 tw-text-sm tw-font-bold ${appV2Tone.mutedText}`}>
        {service.customerLine}
      </p>

      <div
        className={`tw-mt-4 tw-grid tw-grid-cols-2 tw-gap-3 tw-rounded-lg tw-border tw-bg-[#F8FAFC] tw-p-3 ${appV2Tone.border}`}
      >
        <Info label="Tipo" value={service.kindLabel} />
        <Info label="Status" value={service.progressLabel} />
      </div>

      <button
        type="button"
        onClick={onResumeService}
        className={`tw-mt-5 tw-min-h-12 tw-w-full tw-rounded-lg tw-border-0 tw-px-4 tw-py-3 tw-text-base tw-font-extrabold ${appV2Tone.action} ${appV2Tone.focus}`}
      >
        {service.actionLabel}
      </button>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>{label}</p>
      <p className={`tw-mt-1 tw-text-sm tw-font-black ${appV2Tone.text}`}>{value}</p>
    </div>
  );
}
