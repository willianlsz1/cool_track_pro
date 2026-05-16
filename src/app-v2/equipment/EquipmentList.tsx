import { useEffect, useMemo, useState } from 'react';

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
import { appV2Tone } from '../styles/tokens';
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
    <PageShell>
      <header className="tw-grid tw-gap-5 lg:tw-grid-cols-[minmax(0,1fr)_minmax(420px,0.72fr)] lg:tw-items-end">
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
            Equipamentos em CoolTrack
          </p>
          <h1
            className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-none sm:tw-text-[2rem] ${appV2Tone.text}`}
          >
            {viewModel.title}
          </h1>
          <p className={`tw-m-0 tw-mt-5 tw-text-base tw-font-semibold ${appV2Tone.text}`}>
            {viewModel.subtitle}
          </p>
          <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
            Localize o equipamento e avance para a ação técnica correta.
          </p>
        </div>

        <SectionCard padding="sm">
          <span className={`tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>Parque técnico</span>
          <span className={`tw-mt-1 tw-block tw-text-2xl tw-font-bold ${appV2Tone.text}`}>
            {viewModel.totalLabel}
          </span>
        </SectionCard>
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
        ) : (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className={`tw-self-start tw-rounded-xl tw-border tw-bg-white tw-px-4 tw-py-3 tw-text-sm tw-font-bold tw-text-[#2563EB] ${appV2Tone.border} ${appV2Tone.focus}`}
          >
            Novo equipamento
          </button>
        )
      ) : null}

      {onSaveSector ? (
        <SectionCard label="Setores mockados" padding="sm">
          <div className="tw-flex tw-flex-col tw-gap-3 sm:tw-flex-row sm:tw-items-start sm:tw-justify-between">
            <div className="tw-min-w-0">
              <h2 className={`tw-m-0 tw-text-base tw-font-bold ${appV2Tone.text}`}>Setores</h2>
              <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
                Organize equipamentos por area operacional local.
              </p>
            </div>
            <button
              type="button"
              onClick={openNewSectorForm}
              className={`tw-shrink-0 tw-rounded-xl tw-border tw-bg-white tw-px-4 tw-py-3 tw-text-sm tw-font-bold tw-text-[#2563EB] ${appV2Tone.border} ${appV2Tone.focus}`}
            >
              Novo setor
            </button>
          </div>

          {sectorForm ? (
            <form
              className="tw-mt-4 tw-grid tw-gap-3 sm:tw-grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitSectorForm();
              }}
            >
              <label className={`tw-grid tw-gap-2 tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
                Nome do setor
                <input
                  name="equipment-sector-name"
                  value={sectorForm.nome}
                  onChange={(event) => updateSectorForm('nome', event.target.value)}
                  className={`tw-min-h-12 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-px-4 tw-text-base tw-font-medium tw-text-[#061635] ${appV2Tone.border} ${appV2Tone.focus}`}
                />
              </label>

              <label className={`tw-grid tw-gap-2 tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
                Cliente
                <select
                  name="equipment-sector-client"
                  value={sectorForm.clienteId ?? ''}
                  onChange={(event) => updateSectorForm('clienteId', event.target.value)}
                  className={`tw-min-h-12 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-px-4 tw-text-base tw-font-medium tw-text-[#061635] ${appV2Tone.border} ${appV2Tone.focus}`}
                >
                  <option value="">Sem cliente fixo</option>
                  {equipmentInput.clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className={`tw-grid tw-gap-2 tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
                Cor
                <input
                  name="equipment-sector-color"
                  value={sectorForm.cor ?? ''}
                  onChange={(event) => updateSectorForm('cor', event.target.value)}
                  className={`tw-min-h-12 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-px-4 tw-text-base tw-font-medium tw-text-[#061635] ${appV2Tone.border} ${appV2Tone.focus}`}
                />
              </label>

              <label className={`tw-grid tw-gap-2 tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
                Responsavel
                <input
                  name="equipment-sector-owner"
                  value={sectorForm.responsavel ?? ''}
                  onChange={(event) => updateSectorForm('responsavel', event.target.value)}
                  className={`tw-min-h-12 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-px-4 tw-text-base tw-font-medium tw-text-[#061635] ${appV2Tone.border} ${appV2Tone.focus}`}
                />
              </label>

              {sectorError ? (
                <p className="tw-m-0 tw-rounded-xl tw-border tw-border-[#FECACA] tw-bg-[#FEF2F2] tw-px-4 tw-py-3 tw-text-sm tw-font-semibold tw-text-[#991B1B] sm:tw-col-span-2">
                  {sectorError}
                </p>
              ) : null}

              <div className="tw-flex tw-gap-2 sm:tw-col-span-2">
                <button
                  type="submit"
                  className={`tw-rounded-xl tw-bg-[#2563EB] tw-px-4 tw-py-3 tw-text-sm tw-font-bold tw-text-white ${appV2Tone.focus}`}
                >
                  Salvar setor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSectorForm(null);
                    setSectorError(null);
                  }}
                  className={`tw-rounded-xl tw-border tw-bg-white tw-px-4 tw-py-3 tw-text-sm tw-font-bold ${appV2Tone.border} ${appV2Tone.mutedText} ${appV2Tone.focus}`}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : null}

          <div className="tw-mt-4 tw-grid tw-gap-2 md:tw-grid-cols-2">
            {equipmentInput.setores?.map((setor) => (
              <div
                key={setor.id}
                className={`tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-p-3 ${appV2Tone.border}`}
              >
                <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
                  <div className="tw-min-w-0">
                    <p className={`tw-m-0 tw-text-sm tw-font-bold ${appV2Tone.text}`}>
                      {setor.nome}
                    </p>
                    <p
                      className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-semibold ${appV2Tone.mutedText}`}
                    >
                      {formatSectorClientName(setor.clienteId, equipmentInput.clientes)}
                    </p>
                  </div>
                  <span
                    className="tw-h-5 tw-w-5 tw-shrink-0 tw-rounded-full tw-border tw-border-white tw-shadow-sm"
                    style={{ backgroundColor: setor.cor ?? '#2563EB' }}
                    aria-hidden="true"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => openEditSectorForm(setor.id)}
                  className={`tw-mt-3 tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-py-2 tw-text-xs tw-font-bold tw-text-[#2563EB] ${appV2Tone.border} ${appV2Tone.focus}`}
                >
                  Editar setor {setor.nome}
                </button>
                {onDeleteSector ? (
                  sectorPendingRemovalId === setor.id ? (
                    <div className="tw-mt-3 tw-flex tw-flex-wrap tw-gap-2">
                      <button
                        type="button"
                        onClick={() => confirmSectorRemoval(setor.id)}
                        className={`tw-rounded-xl tw-bg-[#B91C1C] tw-px-3 tw-py-2 tw-text-xs tw-font-bold tw-text-white ${appV2Tone.focus}`}
                      >
                        Confirmar remover setor {setor.nome}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSectorPendingRemovalId(null)}
                        className={`tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-py-2 tw-text-xs tw-font-bold ${appV2Tone.border} ${appV2Tone.mutedText} ${appV2Tone.focus}`}
                      >
                        Cancelar remocao
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => requestSectorRemoval(setor.id)}
                      className={`tw-mt-3 tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-py-2 tw-text-xs tw-font-bold tw-text-[#B91C1C] ${appV2Tone.border} ${appV2Tone.focus}`}
                    >
                      Remover setor {setor.nome}
                    </button>
                  )
                ) : null}
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <EquipmentSubViewNav activeView={activeView} onSelectView={onSelectView} />

      <SectionCard
        className="tw-overflow-hidden sm:tw-p-5"
        label="Controles da lista de equipamentos"
        padding="sm"
      >
        <label
          className={`tw-text-sm tw-font-semibold ${appV2Tone.text}`}
          htmlFor="equipment-search"
        >
          Buscar
        </label>
        <input
          id="equipment-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nome, cliente, local ou tag"
          className={`tw-mt-2 tw-min-h-12 tw-w-full tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-px-4 tw-text-base tw-font-medium tw-text-[#061635] placeholder:tw-text-[#697A99] ${appV2Tone.border} ${appV2Tone.focus}`}
        />

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
                    ? 'tw-border-[#2563EB] tw-bg-[#EFF6FF] tw-text-[#2563EB]'
                    : `tw-bg-white ${appV2Tone.border} ${appV2Tone.mutedText}`
                }`}
                aria-pressed={isActive}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <label
          className={`tw-mt-4 tw-block tw-text-sm tw-font-semibold ${appV2Tone.text}`}
          htmlFor="equipment-sector-filter"
        >
          Setor
        </label>
        <select
          id="equipment-sector-filter"
          name="equipment-sector-filter"
          value={sectorId}
          onChange={(event) => setSectorId(event.target.value)}
          className={`tw-mt-2 tw-min-h-12 tw-w-full tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-px-4 tw-text-base tw-font-medium tw-text-[#061635] ${appV2Tone.border} ${appV2Tone.focus}`}
        >
          <option value="all">Todos os setores</option>
          <option value="__sem_setor__">Sem setor</option>
          {equipmentInput.setores?.map((setor) => (
            <option key={setor.id} value={setor.id}>
              {setor.nome}
            </option>
          ))}
        </select>
      </SectionCard>

      <section className="tw-grid tw-gap-3 xl:tw-grid-cols-2" aria-label="Lista de equipamentos">
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
