import { useMemo, useState } from 'react';

import { ClientForm } from './ClientForm';
import type { SaveClientDraft } from './clientActions';
import {
  buildEquipmentClientsListViewModel,
  type ClientFilter,
  type EquipmentClientsListViewModel,
} from './equipmentClientsViewModel';
import { EquipmentSubViewNav, type EquipmentSubView } from './EquipmentSubViewNav';
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

interface ClientListProps {
  input?: BuildEquipmentViewModelInput;
  activeView: EquipmentSubView;
  onSelectView: (view: EquipmentSubView) => void;
  onOpenClient: (clientId: string) => void;
  onSaveClient: (draft: SaveClientDraft) => string | null;
}

const defaultEquipmentInput: BuildEquipmentViewModelInput = {
  today: mockEquipmentToday,
  clientes: mockEquipmentClientes,
  equipamentos: mockEquipmentEquipamentos,
  compromissos: mockEquipmentCompromissos,
  registros: mockEquipmentRegistros,
};

const clientFilters: Array<{ id: ClientFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'with_pending', label: 'Com pendencia' },
  { id: 'critical', label: 'Criticos' },
  { id: 'without_first_service', label: 'Sem primeiro servico' },
];

export function ClientList({
  input,
  activeView,
  onSelectView,
  onOpenClient,
  onSaveClient,
}: ClientListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ClientFilter>('all');
  const viewModel = useMemo<EquipmentClientsListViewModel>(
    () => buildEquipmentClientsListViewModel(input ?? defaultEquipmentInput, { query, filter }),
    [filter, input, query],
  );
  const clients = input?.clientes ?? defaultEquipmentInput.clientes;

  function saveClientDraft(draft: SaveClientDraft): string | null {
    const error = onSaveClient(draft);

    if (!error) {
      setIsCreating(false);
    }

    return error;
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
            Consulte clientes e os equipamentos vinculados sem sair da base instalada.
          </p>
        </div>

        <SectionCard padding="sm">
          <span className={`tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
            Carteira tecnica
          </span>
          <span className={`tw-mt-1 tw-block tw-text-2xl tw-font-bold ${appV2Tone.text}`}>
            {viewModel.totalLabel}
          </span>
        </SectionCard>
      </header>

      <EquipmentSubViewNav activeView={activeView} onSelectView={onSelectView} />

      {isCreating ? (
        <ClientForm
          title="Novo cliente"
          onCancel={() => setIsCreating(false)}
          onSave={saveClientDraft}
        />
      ) : null}

      <SectionCard className="tw-overflow-hidden tw-p-0" labelledBy="clients-list-title">
        <div className="tw-flex tw-flex-col tw-gap-4 tw-p-5">
          <div className="tw-flex tw-items-center tw-justify-between tw-gap-4">
            <div className="tw-min-w-0">
              <h2
                id="clients-list-title"
                className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}
              >
                Clientes
              </h2>
              <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
                Detalhe do cliente, equipamentos vinculados e resumo operacional local.
              </p>
            </div>
            <ActionButton onClick={() => setIsCreating(true)}>Novo cliente</ActionButton>
          </div>

          <div className="tw-min-w-0">
            <label
              htmlFor="client-search"
              className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
            >
              Consulta
            </label>
            <input
              id="client-search"
              name="client-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar cliente, documento ou equipamento"
              className={`tw-mt-2 tw-w-full tw-rounded-lg tw-border tw-border-[#D7DEE8] tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-medium ${appV2Tone.text} ${appV2Tone.focus}`}
            />
          </div>

          <div className="tw-flex tw-flex-wrap tw-gap-2">
            {clientFilters.map((item) => {
              const isActive = item.id === viewModel.activeFilter;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`tw-rounded-full tw-border tw-px-3 tw-py-2 tw-text-xs tw-font-bold ${appV2Tone.focus} ${
                    isActive
                      ? 'tw-border-[#2563EB] tw-bg-[#2563EB] tw-text-white'
                      : 'tw-border-[#D7DEE8] tw-bg-white tw-text-[#41536B]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {clients.length === 0 ? (
          <ListRow>
            <p className={`tw-m-0 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
              Nenhum cliente disponivel.
            </p>
          </ListRow>
        ) : viewModel.items.length === 0 ? (
          <ListRow>
            <p className={`tw-m-0 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
              Nenhum cliente encontrado para a consulta atual.
            </p>
          </ListRow>
        ) : (
          viewModel.items.map((item) => (
            <ListRow key={item.id} interactive onClick={() => onOpenClient(item.id)}>
              <div className="tw-flex tw-min-w-0 tw-items-start tw-justify-between tw-gap-4">
                <div className="tw-min-w-0">
                  <p className={`tw-m-0 tw-text-sm tw-font-semibold ${appV2Tone.text}`}>
                    {item.name}
                  </p>
                  <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
                    {item.detailLine}
                  </p>
                  <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-medium ${appV2Tone.subtleText}`}>
                    {item.contactLine}
                  </p>
                  <p
                    className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-semibold ${appV2Tone.subtleText}`}
                  >
                    {item.lastServiceLabel}
                  </p>
                </div>
                <div className="tw-flex tw-shrink-0 tw-flex-col tw-items-end tw-gap-2">
                  <StatusBadge tone={item.statusTone}>{item.statusLabel}</StatusBadge>
                  <span className={`tw-text-xs tw-font-semibold ${appV2Tone.mutedText}`}>
                    {item.equipmentCountLabel}
                  </span>
                  <span className={`tw-text-xs tw-font-semibold ${appV2Tone.mutedText}`}>
                    {item.pendingCountLabel}
                  </span>
                </div>
              </div>
            </ListRow>
          ))
        )}
      </SectionCard>
    </PageShell>
  );
}
