import { useState } from 'react';

import {
  buildEquipmentDetailViewModel,
  type BuildEquipmentViewModelInput,
  type EquipmentTone,
} from './equipmentViewModel';
import { EquipmentForm } from './EquipmentForm';
import type { SaveEquipmentDraft } from './equipmentActions';
import {
  mockEquipmentClientes,
  mockEquipmentCompromissos,
  mockEquipmentEquipamentos,
  mockEquipmentRegistros,
  mockEquipmentToday,
} from './mockEquipmentData';
import { appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard, StatusBadge } from '../ui/primitives';

interface EquipmentDetailProps {
  equipmentId: string;
  input?: BuildEquipmentViewModelInput;
  onBack: () => void;
  onOpenClient?: (clientId: string) => void;
  onStartService?: (equipmentId: string) => void;
  onSaveEquipment?: (draft: SaveEquipmentDraft) => string | null;
}

const accentClasses: Record<EquipmentTone, string> = {
  danger: 'tw-bg-[#DC2626]',
  warning: 'tw-bg-[#D97706]',
  success: 'tw-bg-[#16A34A]',
  primary: 'tw-bg-[#2563EB]',
};

const defaultEquipmentInput: BuildEquipmentViewModelInput = {
  today: mockEquipmentToday,
  clientes: mockEquipmentClientes,
  equipamentos: mockEquipmentEquipamentos,
  compromissos: mockEquipmentCompromissos,
  registros: mockEquipmentRegistros,
};

export function EquipmentDetail({
  equipmentId,
  input,
  onBack,
  onOpenClient,
  onStartService,
  onSaveEquipment,
}: EquipmentDetailProps) {
  const equipmentInput = input ?? defaultEquipmentInput;
  const detail = buildEquipmentDetailViewModel(equipmentInput, equipmentId);
  const equipment = equipmentInput.equipamentos.find((item) => item.id === equipmentId);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <PageShell>
      <button
        type="button"
        onClick={onBack}
        className={`tw-self-start tw-rounded-lg tw-border-0 tw-bg-transparent tw-px-0 tw-py-2 tw-text-sm tw-font-semibold tw-text-[#2563EB] ${appV2Tone.focus}`}
      >
        Voltar para equipamentos
      </button>

      <div className="tw-grid tw-gap-5 lg:tw-grid-cols-[minmax(0,1fr)_360px] lg:tw-items-start">
        <SectionCard className="tw-relative tw-overflow-hidden">
          <span
            className={`tw-absolute tw-inset-y-0 tw-left-0 tw-w-1 ${accentClasses[detail.statusTone]}`}
            aria-hidden="true"
          />
          <div className="tw-flex tw-items-start tw-justify-between tw-gap-4">
            <div className="tw-min-w-0">
              <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
                Equipamento
              </p>
              <h1
                className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight sm:tw-text-[2rem] ${appV2Tone.text}`}
              >
                {detail.name}
              </h1>
              <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
                {detail.typeLine}
              </p>
            </div>
            <StatusBadge tone={detail.statusTone} className="tw-shrink-0 tw-border">
              {detail.statusLabel}
            </StatusBadge>
          </div>

          <dl className="tw-mt-6 tw-grid tw-gap-3 sm:tw-grid-cols-2">
            <InfoRow label="Cliente" value={detail.customerName} />
            <InfoRow label="Local" value={detail.location} />
            {detail.criticalityLabel ? (
              <InfoRow label="Criticidade" value={detail.criticalityLabel} />
            ) : null}
            {detail.priorityLabel ? (
              <InfoRow label="Prioridade" value={detail.priorityLabel} />
            ) : null}
          </dl>

          <div className="tw-mt-7 tw-grid tw-gap-3 sm:tw-grid-cols-[minmax(0,248px)_minmax(0,216px)]">
            <ActionButton onClick={() => onStartService?.(equipmentId)}>
              {detail.primaryActionLabel}
            </ActionButton>
            <ActionButton variant="secondary">{detail.secondaryActionLabel}</ActionButton>
            {onSaveEquipment && equipment ? (
              <ActionButton variant="ghost" onClick={() => setIsEditing(true)}>
                Editar equipamento
              </ActionButton>
            ) : null}
          </div>
        </SectionCard>

        {isEditing && onSaveEquipment && equipment ? (
          <EquipmentForm
            title="Editar equipamento"
            clientes={equipmentInput.clientes}
            initialEquipment={equipment}
            onCancel={() => setIsEditing(false)}
            onSave={(draft) => {
              const result = onSaveEquipment(draft);

              if (!result) {
                setIsEditing(false);
              }

              return result;
            }}
          />
        ) : null}

        <div className="tw-grid tw-gap-4">
          <SectionCard labelledBy="technical-summary-title">
            <h2
              id="technical-summary-title"
              className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}
            >
              Resumo técnico
            </h2>
            <dl className="tw-mt-5 tw-grid tw-gap-4">
              <InfoRow label="Último serviço" value={detail.lastServiceLabel} />
              <InfoRow label="Preventiva" value={detail.nextPreventiveLabel} />
              <InfoRow label="Observação" value={detail.note} />
            </dl>
          </SectionCard>

          <SectionCard>
            <h2 className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}>
              Cliente vinculado
            </h2>
            <p className={`tw-m-0 tw-mt-4 tw-text-sm tw-font-bold ${appV2Tone.text}`}>
              {detail.customerName}
            </p>
            {detail.customerContact ? (
              <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
                {detail.customerContact}
              </p>
            ) : null}
            {detail.customerAddress ? (
              <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
                {detail.customerAddress}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (detail.customerId) {
                  onOpenClient?.(detail.customerId);
                }
              }}
              disabled={!detail.customerId}
              className={`tw-mt-4 tw-border-0 tw-bg-transparent tw-px-0 tw-py-2 tw-text-sm tw-font-semibold tw-text-[#2563EB] ${appV2Tone.focus}`}
            >
              {detail.customerActionLabel}
            </button>
          </SectionCard>
        </div>
      </div>
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
