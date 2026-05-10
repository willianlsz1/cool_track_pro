import type { ServiceContextViewModel, ServiceTone } from './serviceFlowViewModel';
import { appV2Tone } from '../styles/tokens';

interface ServiceStepContextProps {
  context: ServiceContextViewModel;
  onCancel: () => void;
  onContinue: () => void;
}

const toneClasses: Record<ServiceTone, string> = {
  danger: appV2Tone.danger,
  warning: appV2Tone.warning,
  success: appV2Tone.success,
  primary: appV2Tone.actionSoft,
};

export function ServiceStepContext({ context, onCancel, onContinue }: ServiceStepContextProps) {
  return (
    <section className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
      <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>Contexto</p>
      <h1 className={`tw-mt-1 tw-text-2xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
        {context.title}
      </h1>

      <div className="tw-mt-5 tw-grid tw-gap-4">
        <div>
          <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
            Equipamento
          </p>
          <p className={`tw-mt-1 tw-text-lg tw-font-black ${appV2Tone.text}`}>
            {context.equipmentName}
          </p>
          <p className={`tw-mt-1 tw-text-sm tw-font-semibold ${appV2Tone.mutedText}`}>
            {context.equipmentLine}
          </p>
        </div>

        <InfoBlock label="Cliente/local" value={context.customerLine} />
        <InfoBlock label="Motivo" value={context.reason} />

        <span
          className={`tw-w-fit tw-rounded-md tw-border tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold ${toneClasses[context.statusTone]}`}
        >
          {context.statusLabel}
        </span>
      </div>

      <div className="tw-mt-6 tw-flex tw-flex-col tw-gap-3">
        <button
          type="button"
          onClick={onContinue}
          className={`tw-min-h-12 tw-rounded-lg tw-border-0 tw-px-4 tw-py-3 tw-text-base tw-font-extrabold ${appV2Tone.action} ${appV2Tone.focus}`}
        >
          Continuar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`tw-min-h-11 tw-rounded-lg tw-border tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-extrabold tw-text-[#1D4ED8] ${appV2Tone.border} ${appV2Tone.focus}`}
        >
          Voltar para Serviços
        </button>
      </div>
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>{label}</p>
      <p className={`tw-mt-1 tw-text-sm tw-font-bold tw-leading-5 ${appV2Tone.text}`}>{value}</p>
    </div>
  );
}
