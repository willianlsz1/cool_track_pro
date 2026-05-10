import { appV2Tone } from '../styles/tokens';
import {
  buildServiceContextViewModel,
  buildServiceReviewViewModel,
  type BuildServiceFlowInput,
  type ServiceDraft,
} from './serviceFlowViewModel';

interface ServicesHomeProps {
  draft: ServiceDraft | null;
  input: BuildServiceFlowInput;
  onResumeService: () => void;
  onStartService: () => void;
}

export function ServicesHome({ draft, input, onResumeService, onStartService }: ServicesHomeProps) {
  const context = draft ? buildServiceContextViewModel(input, draft) : null;
  const review = draft ? buildServiceReviewViewModel(input, draft) : null;

  return (
    <main className="tw-mx-auto tw-flex tw-min-h-screen tw-w-full tw-max-w-[520px] tw-flex-col tw-px-4 tw-pb-36 tw-pt-5">
      <header className="tw-mb-5">
        <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
          Fluxo técnico
        </p>
        <h1 className={`tw-mt-1 tw-text-3xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
          Serviços
        </h1>
      </header>

      {context && review ? (
        <section className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
          <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
            Em andamento
          </p>
          <h2 className={`tw-mt-1 tw-text-2xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
            {context.equipmentName}
          </h2>
          <p className={`tw-mt-2 tw-text-sm tw-font-bold ${appV2Tone.mutedText}`}>
            {context.customerLine}
          </p>
          <div
            className={`tw-mt-4 tw-rounded-lg tw-border tw-bg-[#F8FAFC] tw-p-3 ${appV2Tone.border}`}
          >
            <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>Tipo</p>
            <p className={`tw-mt-1 tw-text-sm tw-font-black ${appV2Tone.text}`}>
              {review.kindLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onResumeService}
            className={`tw-mt-5 tw-min-h-12 tw-w-full tw-rounded-lg tw-border-0 tw-px-4 tw-py-3 tw-text-base tw-font-extrabold ${appV2Tone.action} ${appV2Tone.focus}`}
          >
            Retomar registro
          </button>
        </section>
      ) : (
        <section className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
          <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
            Nenhum registro em andamento
          </p>
          <h2 className={`tw-mt-1 tw-text-2xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
            Comece por um equipamento
          </h2>
          <p className={`tw-mt-3 tw-text-sm tw-font-semibold tw-leading-6 ${appV2Tone.mutedText}`}>
            Nesta etapa, Serviços mantém apenas o registro local em andamento. Histórico, relatórios
            e orçamentos entram depois.
          </p>
          <button
            type="button"
            onClick={onStartService}
            className={`tw-mt-5 tw-min-h-12 tw-w-full tw-rounded-lg tw-border-0 tw-px-4 tw-py-3 tw-text-base tw-font-extrabold ${appV2Tone.action} ${appV2Tone.focus}`}
          >
            Iniciar registro
          </button>
        </section>
      )}
    </main>
  );
}
