import type { ServiceDoneViewModel } from './serviceFlowViewModel';
import { appV2Tone } from '../styles/tokens';

interface ServiceDoneProps {
  done: ServiceDoneViewModel;
  onBackToServices: () => void;
  onOpenEquipment: () => void;
}

export function ServiceDone({ done, onBackToServices, onOpenEquipment }: ServiceDoneProps) {
  return (
    <section className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
      <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>Finalizado</p>
      <h1 className={`tw-mt-1 tw-text-2xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
        {done.title}
      </h1>
      <p className={`tw-mt-3 tw-text-sm tw-font-bold tw-leading-6 ${appV2Tone.mutedText}`}>
        {done.summary}
      </p>

      <div className="tw-mt-5 tw-grid tw-gap-3">
        {done.technicalSummary.map((item) => (
          <div
            key={item}
            className={`tw-rounded-lg tw-border tw-bg-[#F8FAFC] tw-p-3 tw-text-sm tw-font-bold tw-leading-5 ${appV2Tone.border} ${appV2Tone.text}`}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="tw-mt-5">
        <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
          Saídas futuras
        </p>
        <div className="tw-mt-2 tw-grid tw-gap-2">
          {done.disabledOutputs.map((output) => (
            <button
              key={output}
              type="button"
              disabled
              className={`tw-min-h-10 tw-rounded-lg tw-border tw-bg-[#F8FAFC] tw-px-3 tw-text-sm tw-font-extrabold tw-text-[#64748B] ${appV2Tone.border}`}
            >
              {output} indisponível nesta etapa
            </button>
          ))}
        </div>
      </div>

      <div className="tw-mt-6 tw-flex tw-flex-col tw-gap-3">
        <button
          type="button"
          onClick={onOpenEquipment}
          className={`tw-min-h-12 tw-rounded-lg tw-border-0 tw-px-4 tw-py-3 tw-text-base tw-font-extrabold ${appV2Tone.action} ${appV2Tone.focus}`}
        >
          Ver equipamento
        </button>
        <button
          type="button"
          onClick={onBackToServices}
          className={`tw-min-h-11 tw-rounded-lg tw-border tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-extrabold tw-text-[#1D4ED8] ${appV2Tone.border} ${appV2Tone.focus}`}
        >
          Voltar para Serviços
        </button>
      </div>
    </section>
  );
}
