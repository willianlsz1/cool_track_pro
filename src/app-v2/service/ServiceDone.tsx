import { appV2Tone } from '../styles/tokens';
import { ActionButton, ListRow, SectionCard, StatusBadge } from '../ui/primitives';
import type { ServiceDoneViewModel } from './serviceFlowViewModel';

interface ServiceDoneProps {
  done: ServiceDoneViewModel;
  onBackToServices: () => void;
  onOpenEquipment: () => void;
}

export function ServiceDone({ done, onBackToServices, onOpenEquipment }: ServiceDoneProps) {
  return (
    <div className="tw-grid tw-gap-5">
      <SectionCard className="sm:tw-p-6">
        <div className="tw-flex tw-flex-col tw-gap-4 sm:tw-flex-row sm:tw-items-start sm:tw-justify-between">
          <div className="tw-min-w-0">
            <p
              className={`tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.16em] ${appV2Tone.subtleText}`}
            >
              Finalizado
            </p>
            <h1
              className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight ${appV2Tone.text}`}
            >
              {done.title}
            </h1>
            <p
              className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-normal tw-leading-6 ${appV2Tone.mutedText}`}
            >
              {done.summary}
            </p>
          </div>
          <StatusBadge tone="success" className="tw-w-fit tw-shrink-0 tw-border">
            Concluído
          </StatusBadge>
        </div>

        <div className="tw-mt-6 tw-grid tw-gap-3 sm:tw-grid-cols-[minmax(0,1fr)_minmax(0,180px)]">
          <ActionButton onClick={onOpenEquipment}>Ver equipamento</ActionButton>
          <ActionButton variant="secondary" onClick={onBackToServices}>
            Voltar para Serviços
          </ActionButton>
        </div>
      </SectionCard>

      <SectionCard className="tw-overflow-hidden tw-p-0" labelledBy="service-summary-title">
        <div className="tw-p-5">
          <h2
            id="service-summary-title"
            className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}
          >
            Resumo do serviço
          </h2>
        </div>
        {done.technicalSummary.map((item) => (
          <ListRow key={item}>
            <p className={`tw-m-0 tw-text-sm tw-font-medium tw-leading-6 ${appV2Tone.text}`}>
              {item}
            </p>
          </ListRow>
        ))}
      </SectionCard>

      <SectionCard labelledBy="service-next-outputs-title">
        <h2
          id="service-next-outputs-title"
          className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}
        >
          Saídas futuras
        </h2>
        <div className="tw-mt-4 tw-grid tw-gap-2 sm:tw-grid-cols-3">
          {done.disabledOutputs.map((output) => (
            <button
              key={output}
              type="button"
              disabled
              className={`tw-min-h-11 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-px-3 tw-text-sm tw-font-semibold tw-text-[#64748B] ${appV2Tone.border}`}
            >
              {output} indisponível
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
