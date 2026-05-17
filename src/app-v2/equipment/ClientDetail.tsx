import { useState } from 'react';

import { ClientForm } from './ClientForm';
import type { SaveClientDraft } from './clientActions';
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
  onSaveClient: (draft: SaveClientDraft) => string | null;
  onCreateEquipmentForClient?: (clientId: string) => void;
}

const defaultEquipmentInput: BuildEquipmentViewModelInput = {
  today: mockEquipmentToday,
  clientes: mockEquipmentClientes,
  equipamentos: mockEquipmentEquipamentos,
  compromissos: mockEquipmentCompromissos,
  registros: mockEquipmentRegistros,
};

export function ClientDetail({
  clientId,
  input,
  onBack,
  onOpenEquipment,
  onSaveClient,
  onCreateEquipmentForClient,
}: ClientDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const viewInput = input ?? defaultEquipmentInput;
  const detail = buildEquipmentClientDetailViewModel(viewInput, clientId);
  const client = viewInput.clientes.find((item) => item.id === clientId);

  function saveClientDraft(draft: SaveClientDraft): string | null {
    const error = onSaveClient(draft);

    if (!error) {
      setIsEditing(false);
    }

    return error;
  }

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
          <InfoRow label="Endereço" value={detail.addressLine} />
          <InfoRow label="Documento" value={detail.documentLine} />
          <InfoRow label="Status" value={detail.statusLabel} />
        </dl>
      </SectionCard>

      {isEditing && client ? (
        <ClientForm
          title="Editar cliente"
          initialClient={client}
          onCancel={() => setIsEditing(false)}
          onSave={saveClientDraft}
        />
      ) : (
        <div className="tw-flex tw-flex-col tw-gap-3 sm:tw-flex-row">
          <ActionButton onClick={() => setIsEditing(true)}>Editar cliente</ActionButton>
          {onCreateEquipmentForClient ? (
            <ActionButton variant="secondary" onClick={() => onCreateEquipmentForClient(clientId)}>
              Criar equipamento para este cliente
            </ActionButton>
          ) : null}
        </div>
      )}

      <SectionCard labelledBy="client-local-report-title">
        <div className="tw-flex tw-items-start tw-justify-between tw-gap-4">
          <div className="tw-min-w-0">
            <h2
              id="client-local-report-title"
              className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}
            >
              {detail.localReport.title}
            </h2>
            <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
              Leitura operacional local, sem exportação ou integração real.
            </p>
          </div>
          <StatusBadge tone={detail.statusTone} className="tw-shrink-0">
            {detail.statusLabel}
          </StatusBadge>
        </div>

        <dl className="tw-mt-5 tw-grid tw-gap-3 sm:tw-grid-cols-2">
          {detail.localReport.facts.map((fact) => (
            <InfoRow key={fact.label} label={fact.label} value={fact.value} />
          ))}
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

      <SectionCard className="tw-overflow-hidden tw-p-0" labelledBy="client-services-title">
        <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-p-5">
          <div className="tw-min-w-0">
            <h2
              id="client-services-title"
              className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}
            >
              Serviços relacionados
            </h2>
            <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
              {detail.servicesCountLabel}
            </p>
          </div>
        </div>

        {detail.services.length === 0 ? (
          <ListRow>
            <p className={`tw-m-0 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
              Nenhum serviço relacionado.
            </p>
          </ListRow>
        ) : (
          detail.services.map((service) => (
            <ListRow key={service.id}>
              <div className="tw-flex tw-min-w-0 tw-items-start tw-justify-between tw-gap-4">
                <div className="tw-min-w-0">
                  <p className={`tw-m-0 tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
                    {service.equipmentName}
                  </p>
                  <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
                    {service.kindLabel} - {service.dateLabel}
                  </p>
                  <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-medium ${appV2Tone.subtleText}`}>
                    {service.summary}
                  </p>
                </div>
                <StatusBadge tone={service.statusTone} className="tw-shrink-0">
                  {service.statusLabel}
                </StatusBadge>
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
