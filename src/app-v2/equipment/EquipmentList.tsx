import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faCirclePlus,
  faFloppyDisk,
  faInfoCircle,
  faLocationDot,
  faMagnifyingGlass,
  faPenToSquare,
  faPlus,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';

import { EquipmentCard } from './EquipmentCard';
import { EquipmentForm } from './EquipmentForm';
import { EquipmentSubViewNav, type EquipmentSubView } from './EquipmentSubViewNav';
import type { SaveEquipmentDraft, SaveEquipmentSectorDraft } from './equipmentActions';
import {
  buildEquipmentListViewModel,
  type EquipmentFilter,
  type EquipmentListViewModel,
  type BuildEquipmentViewModelInput,
} from './equipmentViewModel';
import {
  mockEquipmentClientes,
  mockEquipmentCompromissos,
  mockEquipmentEquipamentos,
  mockEquipmentRegistros,
  mockEquipmentSetores,
  mockEquipmentToday,
} from './mockEquipmentData';
import { appV2Border, appV2Focus, appV2Shadow, appV2Text, appV2Tone } from '../styles/tokens';
import { FieldGroup, FormGrid, fieldInputClass, fieldSelectClass } from '../ui/FieldGroup';
import { PageShell, SectionCard } from '../ui/primitives';

interface EquipmentListProps {
  input?: BuildEquipmentViewModelInput;
  activeView: EquipmentSubView;
  onSelectView: (view: EquipmentSubView) => void;
  onOpenEquipment: (equipmentId: string) => void;
  onSaveEquipment?: (draft: SaveEquipmentDraft) => string | null;
  onSaveSector?: (draft: SaveEquipmentSectorDraft) => string | null;
  onDeleteSector?: (sectorId: string) => string | null;
  initialClientId?: string | null;
  onInitialClientHandled?: () => void;
}

const filters: Array<{ id: EquipmentFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'attention', label: 'Atenção' },
  { id: 'critical', label: 'Críticos' },
  { id: 'without_first_service', label: 'Sem primeiro serviço' },
];

const defaultEquipmentInput: BuildEquipmentViewModelInput = {
  today: mockEquipmentToday,
  clientes: mockEquipmentClientes,
  setores: mockEquipmentSetores,
  equipamentos: mockEquipmentEquipamentos,
  compromissos: mockEquipmentCompromissos,
  registros: mockEquipmentRegistros,
};

export function EquipmentList({
  input,
  activeView,
  onSelectView,
  onOpenEquipment,
  onSaveEquipment,
  onSaveSector,
  onDeleteSector,
  initialClientId,
  onInitialClientHandled,
}: EquipmentListProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<EquipmentFilter>('all');
  const [sectorId, setSectorId] = useState('all');
  const [isCreating, setIsCreating] = useState(Boolean(initialClientId));
  const [sectorForm, setSectorForm] = useState<SaveEquipmentSectorDraft | null>(null);
  const [sectorError, setSectorError] = useState<string | null>(null);
  const [sectorPendingRemovalId, setSectorPendingRemovalId] = useState<string | null>(null);
  const equipmentInput = input ?? defaultEquipmentInput;
  const viewModel = useMemo<EquipmentListViewModel>(
    () => buildEquipmentListViewModel(equipmentInput, { query, filter, sectorId }),
    [equipmentInput, filter, query, sectorId],
  );

  useEffect(() => {
    if (initialClientId) {
      setIsCreating(true);
    }
  }, [initialClientId]);

  function closeCreateForm() {
    setIsCreating(false);
    onInitialClientHandled?.();
  }

  function openNewSectorForm() {
    setSectorError(null);
    setSectorForm({
      id: '',
      nome: '',
      clienteId: '',
      cor: '#2563EB',
      responsavel: '',
      descricao: '',
    });
  }

  function openEditSectorForm(sectorIdToEdit: string) {
    const currentSector = equipmentInput.setores?.find((setor) => setor.id === sectorIdToEdit);

    if (!currentSector) {
      return;
    }

    setSectorError(null);
    setSectorForm({
      id: currentSector.id,
      nome: currentSector.nome,
      mode: 'edit',
      clienteId: currentSector.clienteId ?? '',
      cor: currentSector.cor ?? '#2563EB',
      responsavel: currentSector.responsavel ?? '',
      descricao: currentSector.descricao ?? '',
    });
  }

  function updateSectorForm(field: keyof SaveEquipmentSectorDraft, value: string) {
    setSectorForm((current) => (current ? { ...current, [field]: value } : current));
  }

  function submitSectorForm() {
    if (!sectorForm || !onSaveSector) {
      return;
    }

    const result = onSaveSector({
      ...sectorForm,
      id: sectorForm.id || createLocalSectorId(equipmentInput.setores?.length ?? 0),
    });

    if (result) {
      setSectorError(result);
      return;
    }

    setSectorForm(null);
    setSectorError(null);
  }

  function requestSectorRemoval(sectorIdToRemove: string) {
    setSectorError(null);
    setSectorPendingRemovalId(sectorIdToRemove);
  }

  function confirmSectorRemoval(sectorIdToRemove: string) {
    if (!onDeleteSector) {
      return;
    }

    const result = onDeleteSector(sectorIdToRemove);

    if (result) {
      setSectorError(result);
      return;
    }

    setSectorPendingRemovalId(null);
    setSectorId((current) => (current === sectorIdToRemove ? 'all' : current));
  }

  return (
    <PageShell className="tw-gap-6 lg:tw-gap-7">
      <header className="tw-flex tw-flex-col tw-gap-4 sm:tw-flex-row sm:tw-items-start sm:tw-justify-between">
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
            Equipamentos em CoolTrack
          </p>
          <h1
            className={`tw-m-0 tw-mt-2 tw-text-[1.8rem] tw-font-bold tw-leading-none tw-tracking-tight sm:tw-text-[2rem] ${appV2Text.primary}`}
          >
            {viewModel.title}
          </h1>
          <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-semibold ${appV2Text.primary}`}>
            {viewModel.subtitle} · {viewModel.totalLabel}
          </p>
          <p
            className={`tw-m-0 tw-mt-1 tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-medium ${appV2Text.subtle}`}
          >
            <FontAwesomeIcon icon={faInfoCircle} className="tw-h-3.5 tw-w-3.5" aria-hidden="true" />
            Localize o equipamento e avance para a ação técnica correta.
          </p>
        </div>

        {onSaveEquipment && !isCreating ? (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className={`tw-inline-flex tw-min-h-10 tw-shrink-0 tw-items-center tw-gap-2 tw-rounded-lg tw-border-0 tw-bg-[#2563EB] tw-px-5 tw-text-sm tw-font-bold tw-text-white ${appV2Focus}`}
          >
            <FontAwesomeIcon icon={faPlus} className="tw-h-3.5 tw-w-3.5" aria-hidden="true" />
            Novo equipamento
          </button>
        ) : null}
      </header>

      {onSaveEquipment ? (
        isCreating ? (
          <EquipmentForm
            key={initialClientId ?? 'new-equipment'}
            title="Novo equipamento"
            clientes={equipmentInput.clientes}
            setores={equipmentInput.setores}
            initialClientId={initialClientId ?? undefined}
            onCancel={closeCreateForm}
            onSave={(draft) => {
              const result = onSaveEquipment(draft);

              if (!result) {
                closeCreateForm();
              }

              return result;
            }}
          />
        ) : null
      ) : null}

      <EquipmentSubViewNav activeView={activeView} onSelectView={onSelectView} />

      {onSaveSector ? (
        <SectionCard
          label="Setores"
          padding="sm"
          className={`tw-rounded-[20px] tw-px-5 tw-py-5 ${appV2Shadow.card}`}
        >
          <div className="tw-flex tw-flex-col tw-gap-3 sm:tw-flex-row sm:tw-items-start sm:tw-justify-between">
            <div className="tw-min-w-0">
              <h2 className={`tw-m-0 tw-text-lg tw-font-bold ${appV2Text.primary}`}>Setores</h2>
              <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-medium ${appV2Text.subtle}`}>
                Organize equipamentos por área operacional local.
              </p>
            </div>
            <button
              type="button"
              onClick={openNewSectorForm}
              className={`tw-inline-flex tw-min-h-8 tw-shrink-0 tw-items-center tw-gap-2 tw-rounded-full tw-border tw-bg-[#F1F5F9] tw-px-4 tw-text-xs tw-font-bold tw-text-[#1E4F8A] ${appV2Border.default} ${appV2Focus}`}
            >
              <FontAwesomeIcon icon={faCirclePlus} className="tw-h-3 tw-w-3" aria-hidden="true" />
              Novo setor
            </button>
          </div>

          {sectorForm ? (
            <form
              className="tw-mt-5 tw-rounded-[20px] tw-border tw-border-[#E2E8F0] tw-bg-white tw-p-5"
              onSubmit={(event) => {
                event.preventDefault();
                submitSectorForm();
              }}
            >
              <h3
                className={`tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-base tw-font-bold ${appV2Text.primary}`}
              >
                <FontAwesomeIcon
                  icon={faCirclePlus}
                  className="tw-h-4 tw-w-4 tw-text-[#2563EB]"
                  aria-hidden="true"
                />
                {sectorForm.mode === 'edit' ? 'Editar setor' : 'Novo setor'}
              </h3>

              <FormGrid className="tw-mt-5">
                <FieldGroup label="Nome do setor">
                  <input
                    name="equipment-sector-name"
                    value={sectorForm.nome}
                    onChange={(event) => updateSectorForm('nome', event.target.value)}
                    placeholder="Ex.: Depósito, Loja, Escritório"
                    className={fieldInputClass}
                  />
                </FieldGroup>

                <FieldGroup label="Cliente">
                  <select
                    name="equipment-sector-client"
                    value={sectorForm.clienteId ?? ''}
                    onChange={(event) => updateSectorForm('clienteId', event.target.value)}
                    className={fieldSelectClass}
                  >
                    <option value="">Selecione um cliente</option>
                    {equipmentInput.clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                  <span className={`tw-text-[0.65rem] tw-font-medium ${appV2Text.subtle}`}>
                    Sem cliente fixo pode ser usado como modelo.
                  </span>
                </FieldGroup>

                <FieldGroup label="Cor">
                  <span className="tw-flex tw-items-center tw-gap-3">
                    <span
                      className="tw-h-10 tw-w-10 tw-shrink-0 tw-rounded-xl tw-border tw-border-[#E2E8F0]"
                      style={{ backgroundColor: normalizeSectorColor(sectorForm.cor) }}
                      aria-hidden="true"
                    />
                    <input
                      name="equipment-sector-color"
                      value={sectorForm.cor ?? ''}
                      onChange={(event) => updateSectorForm('cor', event.target.value)}
                      className={`${fieldInputClass} tw-h-10 tw-w-[112px] tw-font-mono tw-font-semibold tw-text-[#2563EB]`}
                    />
                    <input
                      type="color"
                      value={normalizeSectorColor(sectorForm.cor)}
                      onChange={(event) => updateSectorForm('cor', event.target.value)}
                      aria-label="Selecionar cor do setor"
                      className={`tw-h-10 tw-w-10 tw-rounded-xl tw-border tw-border-[#E2E8F0] tw-bg-white tw-p-1 ${appV2Focus}`}
                    />
                  </span>
                </FieldGroup>

                <FieldGroup label="Responsável">
                  <input
                    name="equipment-sector-owner"
                    value={sectorForm.responsavel ?? ''}
                    onChange={(event) => updateSectorForm('responsavel', event.target.value)}
                    placeholder="Nome do responsável"
                    className={fieldInputClass}
                  />
                </FieldGroup>
              </FormGrid>

              {sectorError ? (
                <p className="tw-m-0 tw-rounded-xl tw-border tw-border-[#FECACA] tw-bg-[#FEF2F2] tw-px-4 tw-py-3 tw-text-sm tw-font-semibold tw-text-[#991B1B] sm:tw-col-span-2">
                  {sectorError}
                </p>
              ) : null}

              <div className="tw-mt-5 tw-flex tw-flex-col tw-gap-3 tw-border-t tw-border-[#EDF2F7] tw-pt-5 sm:tw-flex-row sm:tw-justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSectorForm(null);
                    setSectorError(null);
                  }}
                  className={`tw-min-h-9 tw-rounded-lg tw-border tw-border-[#CBD5E1] tw-bg-transparent tw-px-5 tw-text-xs tw-font-bold ${appV2Text.muted} ${appV2Focus}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`tw-inline-flex tw-min-h-9 tw-items-center tw-justify-center tw-gap-2 tw-rounded-lg tw-border-0 tw-bg-[#2563EB] tw-px-5 tw-text-xs tw-font-bold tw-text-white ${appV2Focus}`}
                >
                  <FontAwesomeIcon
                    icon={faFloppyDisk}
                    className="tw-h-3 tw-w-3"
                    aria-hidden="true"
                  />
                  Salvar setor
                </button>
              </div>
            </form>
          ) : null}

          <div className="tw-mt-5 tw-rounded-[20px] tw-border tw-border-[#E2E8F0] tw-bg-white tw-px-5 tw-py-2">
            {equipmentInput.setores?.map((setor) => (
              <div
                key={setor.id}
                className="tw-flex tw-flex-col tw-gap-3 tw-border-b tw-border-[#EDF2F7] tw-py-3 last:tw-border-b-0 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between"
              >
                <div className="tw-flex tw-min-w-0 tw-items-center tw-gap-3">
                  <span
                    className="tw-h-3 tw-w-3 tw-shrink-0 tw-rounded-full"
                    style={{ backgroundColor: setor.cor ?? '#2563EB' }}
                    aria-hidden="true"
                  />
                  <span className="tw-min-w-0">
                    <span
                      className={`tw-block tw-truncate tw-text-sm tw-font-bold ${appV2Text.primary}`}
                    >
                      {setor.nome}
                    </span>
                    <span
                      className={`tw-mt-0.5 tw-block tw-truncate tw-text-xs tw-font-medium ${appV2Text.muted}`}
                    >
                      {formatSectorClientName(setor.clienteId, equipmentInput.clientes)}
                    </span>
                  </span>
                </div>
                <div className="tw-flex tw-flex-wrap tw-gap-4 sm:tw-justify-end">
                  <button
                    type="button"
                    onClick={() => openEditSectorForm(setor.id)}
                    aria-label={`Editar setor ${setor.nome}`}
                    className={`tw-inline-flex tw-items-center tw-gap-1 tw-border-0 tw-bg-transparent tw-p-0 tw-text-xs tw-font-semibold tw-text-[#2563EB] ${appV2Focus}`}
                  >
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="tw-h-3 tw-w-3"
                      aria-hidden="true"
                    />
                    Editar setor<span className="tw-sr-only"> {setor.nome}</span>
                  </button>
                  {onDeleteSector ? (
                    sectorPendingRemovalId === setor.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => confirmSectorRemoval(setor.id)}
                          aria-label={`Confirmar remover setor ${setor.nome}`}
                          className={`tw-rounded-lg tw-bg-[#B91C1C] tw-px-3 tw-py-2 tw-text-xs tw-font-bold tw-text-white ${appV2Focus}`}
                        >
                          Confirmar<span className="tw-sr-only"> remover setor {setor.nome}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSectorPendingRemovalId(null)}
                          className={`tw-rounded-lg tw-border tw-bg-white tw-px-3 tw-py-2 tw-text-xs tw-font-bold ${appV2Border.default} ${appV2Text.muted} ${appV2Focus}`}
                        >
                          Cancelar remoção
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => requestSectorRemoval(setor.id)}
                        aria-label={`Remover setor ${setor.nome}`}
                        className={`tw-inline-flex tw-items-center tw-gap-1 tw-border-0 tw-bg-transparent tw-p-0 tw-text-xs tw-font-semibold tw-text-[#DC2626] ${appV2Focus}`}
                      >
                        <FontAwesomeIcon
                          icon={faTrashCan}
                          className="tw-h-3 tw-w-3"
                          aria-hidden="true"
                        />
                        Remover setor<span className="tw-sr-only"> {setor.nome}</span>
                      </button>
                    )
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard
        className={`tw-overflow-hidden tw-rounded-[20px] tw-px-5 tw-py-4 ${appV2Shadow.card}`}
        label="Controles da lista de equipamentos"
        padding="sm"
      >
        <label
          className={`tw-text-sm tw-font-semibold ${appV2Tone.text}`}
          htmlFor="equipment-search"
        >
          Buscar
        </label>
        <div
          className={`tw-mt-2 tw-flex tw-min-h-11 tw-items-center tw-gap-3 tw-rounded-full tw-border tw-bg-[#F8FAFE] tw-px-4 ${appV2Border.default}`}
        >
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="tw-h-3.5 tw-w-3.5 tw-text-[#8BA0BC]"
            aria-hidden="true"
          />
          <input
            id="equipment-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome, cliente, local ou tag"
            className={`tw-min-h-10 tw-min-w-0 tw-flex-1 tw-border-0 tw-bg-transparent tw-p-0 tw-text-sm tw-font-medium tw-text-[#061635] placeholder:tw-text-[#697A99] focus:tw-outline-none`}
          />
        </div>

        <div
          className="tw-mt-4 tw-flex tw-w-full tw-min-w-0 tw-flex-wrap tw-gap-2 tw-pb-1"
          aria-label="Filtros"
        >
          {filters.map((item) => {
            const isActive = item.id === filter;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`tw-shrink-0 tw-rounded-xl tw-border tw-px-3 tw-py-2 tw-text-sm tw-font-semibold ${appV2Tone.focus} ${
                  isActive
                    ? 'tw-border-[#1E4F8A] tw-bg-[#1E4F8A] tw-text-white'
                    : `tw-border-transparent tw-bg-[#F1F5F9] tw-text-[#1E4F8A]`
                }`}
                aria-pressed={isActive}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <label
          className={`tw-mt-4 tw-block tw-text-sm tw-font-semibold ${appV2Text.primary}`}
          htmlFor="equipment-sector-filter"
        >
          Setor
        </label>
        <div
          className={`tw-mt-2 tw-inline-flex tw-w-full tw-items-center tw-gap-2 tw-rounded-full tw-border tw-bg-[#F8FAFE] tw-px-4 sm:tw-w-auto ${appV2Border.default}`}
        >
          <FontAwesomeIcon
            icon={faLocationDot}
            className="tw-h-3.5 tw-w-3.5 tw-text-[#1E4F8A]"
            aria-hidden="true"
          />
          <select
            id="equipment-sector-filter"
            name="equipment-sector-filter"
            value={sectorId}
            onChange={(event) => setSectorId(event.target.value)}
            className={`tw-min-h-9 tw-min-w-0 tw-flex-1 tw-appearance-none tw-border-0 tw-bg-transparent tw-pr-6 tw-text-sm tw-font-semibold tw-text-[#071A33] focus:tw-outline-none sm:tw-flex-none`}
          >
            <option value="all">Todos os setores</option>
            <option value="__sem_setor__">Sem setor</option>
            {equipmentInput.setores?.map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </select>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="tw-h-3 tw-w-3 tw-text-[#1E4F8A]"
            aria-hidden="true"
          />
        </div>
      </SectionCard>

      <section className="tw-grid tw-gap-5 xl:tw-grid-cols-2" aria-label="Lista de equipamentos">
        {viewModel.items.length === 0 ? (
          <SectionCard
            className={`tw-text-sm tw-font-medium tw-leading-6 xl:tw-col-span-2 ${appV2Tone.mutedText}`}
          >
            Nenhum equipamento encontrado para a busca atual.
          </SectionCard>
        ) : (
          viewModel.items.map((item) => (
            <EquipmentCard key={item.id} item={item} onOpen={onOpenEquipment} />
          ))
        )}
      </section>
    </PageShell>
  );
}

function createLocalSectorId(seed: number): string {
  return `setor-shell-${seed + 1}`;
}

function formatSectorClientName(
  clienteId: string | undefined,
  clientes: BuildEquipmentViewModelInput['clientes'],
): string {
  const cliente = clientes.find((item) => item.id === clienteId);
  return cliente ? cliente.nome : 'Sem cliente fixo';
}

function normalizeSectorColor(color: string | undefined): string {
  return /^#[0-9A-Fa-f]{6}$/.test(color ?? '') ? (color as string) : '#2563EB';
}
