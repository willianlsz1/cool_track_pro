import { buildEquipmentClientDetailViewModel } from './equipmentClientsViewModel';
import type { BuildEquipmentViewModelInput } from './equipmentViewModel';
import {
  mockEquipmentClientes,
  mockEquipmentCompromissos,
  mockEquipmentEquipamentos,
  mockEquipmentRegistros,
  mockEquipmentToday,
} from './mockEquipmentData';
import { appV2Tone } from '../styles/tokens';
import { ActionButton, ListRow, PageShell, SectionCard, StatusBadge } from '../ui/primitives';

interface ClientDetailProps {
  clientId: string;
  input?: BuildEquipmentViewModelInput;
  onBack: () => void;
  onOpenEquipment: (equipmentId: string) => void;
}

const defaultEquipmentInput: BuildEquipmentViewModelInput = {
  today: mockEquipmentToday,
  clientes: mockEquipmentClientes,
  equipamentos: mockEquipmentEquipamentos,
  compromissos: mockEquipmentCompromissos,
  registros: mockEquipmentRegistros,
};

export function ClientDetail({ clientId, input, onBack, onOpenEquipment }: ClientDetailProps) {
  const detail = buildEquipmentClientDetailViewModel(input ?? defaultEquipmentInput, clientId);

  return (
    <PageShell>
      <button
        type="button"
        onClick={onBack}
        className={`tw-self-start tw-rounded-lg tw-border-0 tw-bg-transparent tw-px-0 tw-py-2 tw-text-sm tw-font-semibold tw-text-[#2563EB] ${appV2Tone.focus}`}
      >
        Voltar para clientes
      </button>

      <SectionCard labelledBy="client-detail-title">
        <div className="tw-flex tw-items-start tw-justify-between tw-gap-4">
          <div className="tw-min-w-0">
            <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
              Cliente
            </p>
            <h1
              id="client-detail-title"
              className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight sm:tw-text-[2rem] ${appV2Tone.text}`}
            >
              {detail.name}
            </h1>
            <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
              {detail.equipmentCountLabel}
            </p>
          </div>
          <StatusBadge tone={detail.statusTone} className="tw-shrink-0">
            {detail.statusLabel}
          </StatusBadge>
        </div>

        <dl className="tw-mt-6 tw-grid tw-gap-3 sm:tw-grid-cols-2">
          <InfoRow label="Contato" value={detail.contactLine} />
          <InfoRow label="Endereco" value={detail.addressLine} />
          <InfoRow label="Documento" value={detail.documentLine} />
          <InfoRow label="Status" value={detail.statusLabel} />
        </dl>
      </SectionCard>

      <SectionCard className="tw-overflow-hidden tw-p-0" labelledBy="client-equipment-title">
        <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-p-5">
          <div className="tw-min-w-0">
            <h2
              id="client-equipment-title"
              className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}
            >
              Equipamentos vinculados
            </h2>
            <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
              Equipamentos deste cliente.
            </p>
          </div>
        </div>

        {detail.equipments.length === 0 ? (
          <ListRow>
            <p className={`tw-m-0 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
              Nenhum equipamento vinculado.
            </p>
          </ListRow>
        ) : (
          detail.equipments.map((equipment) => (
            <ListRow key={equipment.id} interactive onClick={() => onOpenEquipment(equipment.id)}>
              <div className="tw-flex tw-min-w-0 tw-items-start tw-justify-between tw-gap-4">
                <div className="tw-min-w-0">
                  <p className={`tw-m-0 tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
                    {equipment.name}
                  </p>
                  <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
                    {equipment.customerLine}
                  </p>
                  <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-medium ${appV2Tone.subtleText}`}>
                    {equipment.metaLine}
                  </p>
                </div>
                <div className="tw-flex tw-shrink-0 tw-flex-col tw-items-end tw-gap-2">
                  <StatusBadge tone={equipment.statusTone}>{equipment.statusLabel}</StatusBadge>
                  <StatusBadge tone={equipment.nextActionTone}>
                    {equipment.nextActionLabel}
                  </StatusBadge>
                </div>
              </div>
            </ListRow>
          ))
        )}
      </SectionCard>

      <ActionButton variant="secondary" onClick={onBack} className="tw-self-start">
        Ver todos os clientes
      </ActionButton>
    </PageShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
      >
        {label}
      </dt>
      <dd className={`tw-mt-1 tw-text-sm tw-font-semibold tw-leading-5 ${appV2Tone.text}`}>
        {value}
      </dd>
    </div>
  );
}
