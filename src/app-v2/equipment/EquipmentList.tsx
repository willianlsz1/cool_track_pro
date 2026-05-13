import { useMemo, useState } from 'react';

import { EquipmentCard } from './EquipmentCard';
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

interface EquipmentListProps {
  input?: BuildEquipmentViewModelInput;
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

export function EquipmentList({ input, onOpenEquipment }: EquipmentListProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<EquipmentFilter>('all');
  const viewModel = useMemo<EquipmentListViewModel>(
    () => buildEquipmentListViewModel(input ?? defaultEquipmentInput, { query, filter }),
    [filter, input, query],
  );

  return (
    <main className="tw-mx-auto tw-flex tw-min-h-screen tw-w-full tw-max-w-[520px] tw-flex-col tw-px-4 tw-pb-36 tw-pt-5">
      <header className="tw-mb-4">
        <p className={`tw-text-xs tw-font-bold tw-uppercase ${appV2Tone.subtleText}`}>
          {viewModel.subtitle}
        </p>
        <div className="tw-mt-1 tw-flex tw-items-end tw-justify-between tw-gap-3">
          <h1 className={`tw-text-3xl tw-font-black tw-leading-tight ${appV2Tone.text}`}>
            {viewModel.title}
          </h1>
          <span className={`tw-pb-1 tw-text-sm tw-font-bold ${appV2Tone.mutedText}`}>
            {viewModel.totalLabel}
          </span>
        </div>
      </header>

      <label className={`tw-text-sm tw-font-bold ${appV2Tone.text}`} htmlFor="equipment-search">
        Buscar
      </label>
      <input
        id="equipment-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Nome, cliente, local ou tag"
        className={`tw-mt-2 tw-min-h-12 tw-rounded-lg tw-border tw-bg-white tw-px-4 tw-text-base tw-font-semibold tw-text-[#0A1328] placeholder:tw-text-[#64748B] ${appV2Tone.border} ${appV2Tone.focus}`}
      />

      <div className="tw-mt-4 tw-flex tw-gap-2 tw-overflow-x-auto tw-pb-1" aria-label="Filtros">
        {filters.map((item) => {
          const isActive = item.id === filter;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`tw-shrink-0 tw-rounded-lg tw-border tw-px-3 tw-py-2 tw-text-sm tw-font-extrabold ${appV2Tone.focus} ${
                isActive
                  ? 'tw-border-[#1D4ED8] tw-bg-[#E6F0FF] tw-text-[#1D4ED8]'
                  : `tw-bg-white ${appV2Tone.border} ${appV2Tone.mutedText}`
              }`}
              aria-pressed={isActive}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="tw-mt-5 tw-flex tw-flex-col tw-gap-3">
        {viewModel.items.length === 0 ? (
          <div
            className={`tw-rounded-lg tw-border tw-bg-white tw-p-5 tw-text-sm tw-font-semibold tw-leading-6 ${appV2Tone.border} ${appV2Tone.mutedText}`}
          >
            Nenhum equipamento encontrado para a busca atual.
          </div>
        ) : (
          viewModel.items.map((item) => (
            <EquipmentCard key={item.id} item={item} onOpen={onOpenEquipment} />
          ))
        )}
      </div>
    </main>
  );
}
