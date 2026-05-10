import { buildEquipmentDetailViewModel, type EquipmentTone } from './equipmentViewModel';
import {
  mockEquipmentClientes,
  mockEquipmentCompromissos,
  mockEquipmentEquipamentos,
  mockEquipmentRegistros,
  mockEquipmentToday,
} from './mockEquipmentData';
import { appV2Tone } from '../styles/tokens';

interface EquipmentDetailProps {
  equipmentId: string;
  onBack: () => void;
  onStartService?: (equipmentId: string) => void;
}

const toneClasses: Record<EquipmentTone, string> = {
  danger: appV2Tone.danger,
  warning: appV2Tone.warning,
  success: appV2Tone.success,
  primary: appV2Tone.actionSoft,
};

export function EquipmentDetail({ equipmentId, onBack, onStartService }: EquipmentDetailProps) {
  const detail = buildEquipmentDetailViewModel(
    {
      today: mockEquipmentToday,
      clientes: mockEquipmentClientes,
      equipamentos: mockEquipmentEquipamentos,
      compromissos: mockEquipmentCompromissos,
      registros: mockEquipmentRegistros,
    },
    equipmentId,
  );

  return (
    <main className="tw-mx-auto tw-flex tw-min-h-screen tw-w-full tw-max-w-[520px] tw-flex-col tw-px-4 tw-pb-36 tw-pt-5">
      <button
        type="button"
        onClick={onBack}
        className={`tw-mb-4 tw-self-start tw-border-0 tw-bg-transparent tw-px-0 tw-py-2 tw-text-sm tw-font-extrabold tw-text-[#1D4ED8] ${appV2Tone.focus}`}
      >
        Voltar para equipamentos
      </button>

      <section
        className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 tw-shadow-[0_18px_44px_-32px_rgba(10,19,40,0.42)] ${appV2Tone.border}`}
      >
        <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
          <div className="tw-min-w-0">
            <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
              Equipamento
            </p>
            <h1 className={`tw-mt-1 tw-text-2xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
              {detail.name}
            </h1>
            <p className={`tw-mt-2 tw-text-sm tw-font-semibold ${appV2Tone.mutedText}`}>
              {detail.typeLine}
            </p>
          </div>
          <span
            className={`tw-shrink-0 tw-rounded-md tw-border tw-px-2 tw-py-1 tw-text-xs tw-font-bold ${toneClasses[detail.statusTone]}`}
          >
            {detail.statusLabel}
          </span>
        </div>

        <dl className="tw-mt-5 tw-grid tw-gap-3">
          <InfoRow label="Cliente" value={detail.customerName} />
          <InfoRow label="Local" value={detail.location} />
          {detail.criticalityLabel ? (
            <InfoRow label="Criticidade" value={detail.criticalityLabel} />
          ) : null}
          {detail.priorityLabel ? (
            <InfoRow label="Prioridade" value={detail.priorityLabel} />
          ) : null}
        </dl>

        <div className="tw-mt-5 tw-flex tw-flex-col tw-gap-3">
          <button
            type="button"
            onClick={() => onStartService?.(equipmentId)}
            className={`tw-min-h-12 tw-rounded-lg tw-border-0 tw-px-4 tw-py-3 tw-text-base tw-font-extrabold tw-shadow-[0_16px_30px_-20px_rgba(30,91,255,0.9)] ${appV2Tone.action} ${appV2Tone.focus}`}
          >
            {detail.primaryActionLabel}
          </button>
          <button
            type="button"
            className={`tw-min-h-11 tw-rounded-lg tw-border tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-extrabold tw-text-[#1D4ED8] ${appV2Tone.border} ${appV2Tone.focus}`}
          >
            {detail.secondaryActionLabel}
          </button>
        </div>
      </section>

      <section
        className={`tw-mt-4 tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}
        aria-labelledby="technical-summary-title"
      >
        <h2 id="technical-summary-title" className={`tw-text-lg tw-font-black ${appV2Tone.text}`}>
          Resumo técnico
        </h2>
        <dl className="tw-mt-4 tw-grid tw-gap-3">
          <InfoRow label="Último serviço" value={detail.lastServiceLabel} />
          <InfoRow label="Preventiva" value={detail.nextPreventiveLabel} />
          <InfoRow label="Observação" value={detail.note} />
        </dl>
      </section>

      <section className={`tw-mt-4 tw-rounded-lg tw-border tw-bg-white tw-p-5 ${appV2Tone.border}`}>
        <h2 className={`tw-text-lg tw-font-black ${appV2Tone.text}`}>Cliente vinculado</h2>
        <p className={`tw-mt-3 tw-text-sm tw-font-bold ${appV2Tone.text}`}>{detail.customerName}</p>
        {detail.customerContact ? (
          <p className={`tw-mt-1 tw-text-sm tw-font-semibold ${appV2Tone.mutedText}`}>
            {detail.customerContact}
          </p>
        ) : null}
        {detail.customerAddress ? (
          <p className={`tw-mt-1 tw-text-sm tw-font-semibold ${appV2Tone.mutedText}`}>
            {detail.customerAddress}
          </p>
        ) : null}
        <button
          type="button"
          className={`tw-mt-4 tw-border-0 tw-bg-transparent tw-px-0 tw-py-2 tw-text-sm tw-font-extrabold tw-text-[#1D4ED8] ${appV2Tone.focus}`}
        >
          {detail.customerActionLabel}
        </button>
      </section>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>{label}</dt>
      <dd className={`tw-mt-1 tw-text-sm tw-font-bold tw-leading-5 ${appV2Tone.text}`}>{value}</dd>
    </div>
  );
}
