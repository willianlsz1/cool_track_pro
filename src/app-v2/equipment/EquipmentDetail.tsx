import { useState } from 'react';

import {
  buildEquipmentDetailViewModel,
  type BuildEquipmentViewModelInput,
  type EquipmentTone,
} from './equipmentViewModel';
import { EquipmentForm, type EquipmentSaveResult } from './EquipmentForm';
import type { SaveEquipmentDraft } from './equipmentActions';
import {
  mockEquipmentClientes,
  mockEquipmentCompromissos,
  mockEquipmentEquipamentos,
  mockEquipmentRegistros,
  mockEquipmentSetores,
  mockEquipmentToday,
} from './mockEquipmentData';
import { appV2Tone } from '../styles/tokens';
import {
  ActionButton,
  PageShell,
  SectionCard,
  SectionEyebrow,
  StatusBadge,
} from '../ui/primitives';
import { resolveAppV2ActionResult, type AppV2ActionResult } from '../ui/actionResult';

type EquipmentArchiveResult = AppV2ActionResult;
type EquipmentAttachmentResult = AppV2ActionResult;
type PreventiveScheduleResult = AppV2ActionResult;

interface EquipmentDetailProps {
  equipmentId: string;
  input?: BuildEquipmentViewModelInput;
  onBack: () => void;
  onOpenClient?: (clientId: string) => void;
  onStartService?: (equipmentId: string) => void;
  onSaveEquipment?: (draft: SaveEquipmentDraft) => EquipmentSaveResult;
  onArchiveEquipment?: (equipmentId: string) => EquipmentArchiveResult;
  onUnarchiveEquipment?: (equipmentId: string) => EquipmentArchiveResult;
  onAddPlaceholderAttachment?: (equipmentId: string) => EquipmentAttachmentResult;
  onSchedulePreventive?: (equipmentId: string, targetDate: string) => PreventiveScheduleResult;
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
  setores: mockEquipmentSetores,
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
  onArchiveEquipment,
  onUnarchiveEquipment,
  onAddPlaceholderAttachment,
  onSchedulePreventive,
}: EquipmentDetailProps) {
  const equipmentInput = input ?? defaultEquipmentInput;
  const detail = buildEquipmentDetailViewModel(equipmentInput, equipmentId);
  const equipment = equipmentInput.equipamentos.find((item) => item.id === equipmentId);
  const [isEditing, setIsEditing] = useState(false);
  const [isArchivePending, setIsArchivePending] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isSchedulingPreventive, setIsSchedulingPreventive] = useState(false);
  const [preventiveDate, setPreventiveDate] = useState('');
  const [preventiveError, setPreventiveError] = useState<string | null>(null);
  const isArchived = Boolean(detail.archivedLabel);

  async function confirmArchiveEquipment() {
    if (!onArchiveEquipment) {
      return;
    }

    const result = await resolveArchiveResult(
      onArchiveEquipment(equipmentId),
      'Não foi possível arquivar o equipamento.',
    );

    if (result) {
      setArchiveError(result);
      return;
    }

    setArchiveError(null);
    setIsArchivePending(false);
  }

  async function unarchiveEquipment() {
    if (!onUnarchiveEquipment) {
      return;
    }

    const result = await resolveArchiveResult(
      onUnarchiveEquipment(equipmentId),
      'Não foi possível desarquivar o equipamento.',
    );

    if (result) {
      setArchiveError(result);
      return;
    }

    setArchiveError(null);
    setIsArchivePending(false);
  }

  async function addPlaceholderAttachment() {
    if (!onAddPlaceholderAttachment) {
      return;
    }

    const result = await resolveEquipmentAttachmentResult(onAddPlaceholderAttachment(equipmentId));

    if (result) {
      setAttachmentError(result);
      return;
    }

    setAttachmentError(null);
  }

  function openPreventiveSchedule() {
    setPreventiveDate(
      suggestPreventiveDate(
        equipmentInput.today,
        equipment?.periodicidadePreventivaDias,
        detail.nextPreventiveLabel,
      ),
    );
    setPreventiveError(null);
    setIsSchedulingPreventive(true);
  }

  async function schedulePreventive() {
    if (!onSchedulePreventive) {
      return;
    }

    const result = await resolvePreventiveScheduleResult(
      onSchedulePreventive(equipmentId, preventiveDate),
    );

    if (result) {
      setPreventiveError(result);
      return;
    }

    setPreventiveError(null);
    setIsSchedulingPreventive(false);
  }

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
        <div className="tw-grid tw-gap-5">
          <SectionCard className="tw-relative tw-overflow-hidden">
            <span
              className={`tw-absolute tw-inset-y-0 tw-left-0 tw-w-1 ${accentClasses[detail.statusTone]}`}
              aria-hidden="true"
            />
            <div className="tw-flex tw-items-start tw-justify-between tw-gap-4">
              <div className="tw-min-w-0">
                <SectionEyebrow>Equipamento</SectionEyebrow>
                <h1
                  className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight sm:tw-text-[2rem] ${appV2Tone.text}`}
                >
                  {detail.name}
                </h1>
                <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
                  {detail.typeLine} - {detail.customerName} - {detail.location}
                </p>
              </div>
              <StatusBadge tone={detail.statusTone} className="tw-shrink-0 tw-border">
                {detail.statusLabel}
              </StatusBadge>
            </div>

            {detail.archivedLabel ? (
              <p className="tw-m-0 tw-mt-5 tw-rounded-xl tw-border tw-border-[#BFDBFE] tw-bg-[#EFF6FF] tw-px-4 tw-py-3 tw-text-sm tw-font-bold tw-text-[#1D4ED8]">
                {detail.archivedLabel}
              </p>
            ) : null}

            <dl className="tw-mt-6 tw-grid tw-gap-3 sm:tw-grid-cols-2 xl:tw-grid-cols-4">
              <FactCard label="Status" value={detail.statusLabel} />
              <FactCard label="Setor" value={detail.sectorLabel} />
              <FactCard label="Último serviço" value={detail.lastServiceLabel} />
              <FactCard label="Próxima ação" value={detail.nextPreventiveLabel} />
            </dl>

            <div className="tw-mt-7 tw-grid tw-gap-3 sm:tw-grid-cols-[minmax(0,248px)_minmax(0,216px)]">
              <ActionButton disabled={isArchived} onClick={() => onStartService?.(equipmentId)}>
                {detail.primaryActionLabel}
              </ActionButton>
              <ActionButton
                variant="secondary"
                disabled={isArchived || !onSchedulePreventive}
                onClick={openPreventiveSchedule}
              >
                {detail.secondaryActionLabel}
              </ActionButton>
              {onSaveEquipment && equipment ? (
                <ActionButton variant="ghost" onClick={() => setIsEditing(true)}>
                  Editar equipamento
                </ActionButton>
              ) : null}
              {onArchiveEquipment && equipment && !isArchived ? (
                isArchivePending ? (
                  <>
                    <ActionButton
                      variant="ghost"
                      className="tw-border-[#FECACA] tw-bg-[#FEF2F2] tw-text-[#B91C1C]"
                      onClick={confirmArchiveEquipment}
                    >
                      Confirmar arquivar equipamento
                    </ActionButton>
                    <ActionButton variant="ghost" onClick={() => setIsArchivePending(false)}>
                      Cancelar arquivamento
                    </ActionButton>
                  </>
                ) : (
                  <ActionButton
                    variant="ghost"
                    className="tw-text-[#B91C1C]"
                    onClick={() => {
                      setArchiveError(null);
                      setIsArchivePending(true);
                    }}
                  >
                    Arquivar equipamento
                  </ActionButton>
                )
              ) : null}
              {onUnarchiveEquipment && equipment && isArchived ? (
                <ActionButton variant="ghost" onClick={unarchiveEquipment}>
                  Desarquivar equipamento
                </ActionButton>
              ) : null}
            </div>

            {archiveError ? (
              <p className="tw-m-0 tw-mt-4 tw-rounded-xl tw-border tw-border-[#FECACA] tw-bg-[#FEF2F2] tw-px-4 tw-py-3 tw-text-sm tw-font-semibold tw-text-[#991B1B]">
                {archiveError}
              </p>
            ) : null}

            {isSchedulingPreventive ? (
              <div className="tw-mt-6 tw-rounded-2xl tw-border tw-border-[#BFDBFE] tw-bg-[#EFF6FF] tw-p-4">
                <h2 className={`tw-m-0 tw-text-sm tw-font-bold ${appV2Tone.text}`}>
                  Agendar preventiva local
                </h2>
                <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-semibold ${appV2Tone.mutedText}`}>
                  Cria um compromisso mockado para este equipamento, sem calendário externo.
                </p>
                <div className="tw-mt-4 tw-grid tw-gap-4">
                  <label className="tw-block sm:tw-max-w-[360px]">
                    <span
                      className={`tw-block tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
                    >
                      Data da preventiva
                    </span>
                    <input
                      type="date"
                      name="equipment-preventive-date"
                      value={preventiveDate}
                      onChange={(event) => setPreventiveDate(event.target.value)}
                      className={`tw-mt-1 tw-w-full tw-rounded-xl tw-border tw-border-[#D8E1EC] tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-semibold ${appV2Tone.text} ${appV2Tone.focus}`}
                    />
                  </label>
                  <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row sm:tw-justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSchedulingPreventive(false);
                        setPreventiveError(null);
                      }}
                      className={`tw-min-h-10 tw-rounded-lg tw-border tw-border-[#CBD5E1] tw-bg-white tw-px-4 tw-py-2 tw-text-xs tw-font-bold tw-text-[#52677F] ${appV2Tone.focus}`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={schedulePreventive}
                      className={`tw-min-h-10 tw-rounded-lg tw-border tw-border-[#2563EB] tw-bg-[#2563EB] tw-px-4 tw-py-2 tw-text-xs tw-font-bold tw-text-white ${appV2Tone.focus}`}
                    >
                      Salvar preventiva
                    </button>
                  </div>
                </div>
                {preventiveError ? (
                  <p className="tw-m-0 tw-mt-3 tw-rounded-xl tw-border tw-border-[#FECACA] tw-bg-[#FEF2F2] tw-px-3 tw-py-2 tw-text-xs tw-font-semibold tw-text-[#991B1B]">
                    {preventiveError}
                  </p>
                ) : null}
              </div>
            ) : null}
          </SectionCard>

          {isEditing && onSaveEquipment && equipment ? (
            <EquipmentForm
              title="Editar equipamento"
              clientes={equipmentInput.clientes}
              setores={equipmentInput.setores}
              initialEquipment={equipment}
              onCancel={() => setIsEditing(false)}
              onSave={async (draft) => {
                const result = await onSaveEquipment(draft);

                if (!result) {
                  setIsEditing(false);
                }

                return result;
              }}
            />
          ) : null}

          <SectionCard labelledBy="equipment-attachments-title">
            <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
              <div>
                <h2
                  id="equipment-attachments-title"
                  className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}
                >
                  Fotos do equipamento
                </h2>
                <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
                  {detail.attachmentSummaryLabel}
                </p>
              </div>
              {onAddPlaceholderAttachment && !isArchived ? (
                <button
                  type="button"
                  onClick={addPlaceholderAttachment}
                  className={`tw-rounded-lg tw-border tw-border-[#CBD5E1] tw-bg-white tw-px-3 tw-py-2 tw-text-xs tw-font-bold tw-text-[#2563EB] ${appV2Tone.focus}`}
                >
                  Adicionar foto local
                </button>
              ) : null}
            </div>

            {detail.attachments.length > 0 ? (
              <ul className="tw-m-0 tw-mt-4 tw-grid tw-list-none tw-gap-3 tw-rounded-2xl tw-bg-[#F8FAFE] tw-p-4">
                {detail.attachments.map((attachment) => (
                  <li
                    key={attachment.id}
                    className="tw-rounded-xl tw-border tw-border-[#E5EAF0] tw-bg-white tw-px-4 tw-py-3"
                  >
                    <p className={`tw-m-0 tw-text-sm tw-font-bold ${appV2Tone.text}`}>
                      {attachment.label}
                    </p>
                    <p
                      className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-semibold ${appV2Tone.subtleText}`}
                    >
                      {attachment.kindLabel} - {attachment.sourceLabel}
                      {attachment.coverLabel ? ` - ${attachment.coverLabel}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`tw-m-0 tw-mt-4 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
                Nenhuma foto local neste equipamento.
              </p>
            )}

            {attachmentError ? (
              <p className="tw-m-0 tw-mt-4 tw-rounded-xl tw-border tw-border-[#FECACA] tw-bg-[#FEF2F2] tw-px-4 tw-py-3 tw-text-sm tw-font-semibold tw-text-[#991B1B]">
                {attachmentError}
              </p>
            ) : null}
          </SectionCard>

          <SectionCard labelledBy="technical-summary-title">
            <h2
              id="technical-summary-title"
              className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}
            >
              Resumo técnico
            </h2>
            <dl className="tw-mt-4 tw-grid tw-gap-0">
              <SummaryRow label="Último serviço" value={detail.lastServiceLabel} />
              <SummaryRow label="Preventiva" value={detail.nextPreventiveLabel} />
              <SummaryRow label="Observação" value={detail.note} />
            </dl>
          </SectionCard>
        </div>

        <div className="tw-grid tw-gap-4">
          <SectionCard>
            <h2 className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}>
              Cliente vinculado
            </h2>
            <dl className="tw-mt-4 tw-grid tw-gap-0">
              <SummaryRow label="Nome" value={detail.customerName} />
              {detail.customerContact ? (
                <SummaryRow label="Contato" value={detail.customerContact} />
              ) : null}
              {detail.customerAddress ? (
                <SummaryRow label="Endereço" value={detail.customerAddress} />
              ) : null}
            </dl>
            <button
              type="button"
              onClick={() => {
                if (detail.customerId) {
                  onOpenClient?.(detail.customerId);
                }
              }}
              disabled={!detail.customerId}
              className={`tw-mt-4 tw-w-full tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-white tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-[#2563EB] ${appV2Tone.focus}`}
            >
              {detail.customerActionLabel}
            </button>
          </SectionCard>

          <SectionCard>
            <h2 className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}>
              Próximas ações
            </h2>
            <dl className="tw-mt-4 tw-grid tw-gap-0">
              <SummaryRow label="Corretiva" value="Não agendada" />
              <SummaryRow label="Preventiva" value={detail.nextPreventiveLabel} />
              <SummaryRow label="Orçamento" value="Sem orçamento aberto" />
            </dl>
          </SectionCard>

          <SectionCard>
            <h2 className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}>
              Especificações
            </h2>
            <dl className="tw-mt-4 tw-grid tw-gap-0">
              <SummaryRow label="Tipo" value={detail.typeLine} />
              {detail.technicalDetails.map((item) => (
                <SummaryRow key={item.label} label={item.label} value={item.value} />
              ))}
            </dl>
            {detail.technicalDetails.length === 0 ? (
              <p className={`tw-m-0 tw-mt-4 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
                Sem especificações técnicas informadas.
              </p>
            ) : null}
          </SectionCard>
        </div>
      </div>
    </PageShell>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="tw-rounded-2xl tw-border tw-border-[#EDF2F7] tw-bg-[#F8FAFE] tw-px-4 tw-py-3">
      <dt
        className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
      >
        {label}
      </dt>
      <dd className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-bold tw-leading-5 ${appV2Tone.text}`}>
        {value}
      </dd>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="tw-grid tw-grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] tw-gap-3 tw-border-b tw-border-[#EDF2F7] tw-py-3 last:tw-border-b-0">
      <dt
        className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
      >
        {label}
      </dt>
      <dd className={`tw-m-0 tw-text-right tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
        {value}
      </dd>
    </div>
  );
}

function suggestPreventiveDate(
  today: string,
  preventiveInterval: number | undefined,
  nextPreventiveLabel: string,
): string {
  if (!isValidIsoDate(today)) {
    return '';
  }

  if (!nextPreventiveLabel.includes('Sem preventiva')) {
    return today;
  }

  const days = preventiveInterval && preventiveInterval > 0 ? preventiveInterval : 30;
  const [year, month, day] = today.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

function isValidIsoDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

async function resolveArchiveResult(
  result: EquipmentArchiveResult,
  fallback: string,
): Promise<string | null> {
  return resolveAppV2ActionResult(result, fallback);
}

async function resolveEquipmentAttachmentResult(
  result: EquipmentAttachmentResult,
): Promise<string | null> {
  return resolveAppV2ActionResult(result, 'Não foi possível adicionar a foto.');
}

async function resolvePreventiveScheduleResult(
  result: PreventiveScheduleResult,
): Promise<string | null> {
  return resolveAppV2ActionResult(result, 'Não foi possível agendar a preventiva.');
}
