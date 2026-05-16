import { useMemo, useState } from 'react';

import { EquipmentCard } from './EquipmentCard';
import { EquipmentSubViewNav, type EquipmentSubView } from './EquipmentSubViewNav';
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
  mockEquipmentToday,
} from './mockEquipmentData';
import { appV2Tone } from '../styles/tokens';
import { PageShell, SectionCard } from '../ui/primitives';

interface EquipmentListProps {
  input?: BuildEquipmentViewModelInput;
  activeView: EquipmentSubView;
  onSelectView: (view: EquipmentSubView) => void;
  onOpenEquipment: (equipmentId: string) => void;
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
  equipamentos: mockEquipmentEquipamentos,
  compromissos: mockEquipmentCompromissos,
  registros: mockEquipmentRegistros,
};

export function EquipmentList({
  input,
  activeView,
  onSelectView,
  onOpenEquipment,
}: EquipmentListProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<EquipmentFilter>('all');
  const viewModel = useMemo<EquipmentListViewModel>(
    () => buildEquipmentListViewModel(input ?? defaultEquipmentInput, { query, filter }),
    [filter, input, query],
  );

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
          className="tw-mt-4 tw-flex tw-w-full tw-min-w-0 tw-gap-2 tw-overflow-x-auto tw-pb-1"
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
