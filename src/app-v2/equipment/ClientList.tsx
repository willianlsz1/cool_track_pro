import { useMemo } from 'react';

import {
  buildEquipmentClientsListViewModel,
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
import { ListRow, PageShell, SectionCard, StatusBadge } from '../ui/primitives';

interface ClientListProps {
  input?: BuildEquipmentViewModelInput;
  activeView: EquipmentSubView;
  onSelectView: (view: EquipmentSubView) => void;
  onOpenClient: (clientId: string) => void;
}

const defaultEquipmentInput: BuildEquipmentViewModelInput = {
  today: mockEquipmentToday,
  clientes: mockEquipmentClientes,
  equipamentos: mockEquipmentEquipamentos,
  compromissos: mockEquipmentCompromissos,
  registros: mockEquipmentRegistros,
};

export function ClientList({ input, activeView, onSelectView, onOpenClient }: ClientListProps) {
  const viewModel = useMemo<EquipmentClientsListViewModel>(
    () => buildEquipmentClientsListViewModel(input ?? defaultEquipmentInput),
    [input],
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

      <SectionCard className="tw-overflow-hidden tw-p-0" labelledBy="clients-list-title">
        <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-p-5">
          <div className="tw-min-w-0">
            <h2
              id="clients-list-title"
              className={`tw-m-0 tw-text-base tw-font-semibold ${appV2Tone.text}`}
            >
              Clientes
            </h2>
            <p className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
              Detalhe do cliente e equipamentos vinculados.
            </p>
          </div>
        </div>

        {viewModel.items.length === 0 ? (
          <ListRow>
            <p className={`tw-m-0 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
              Nenhum cliente disponivel.
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
                </div>
                <div className="tw-flex tw-shrink-0 tw-flex-col tw-items-end tw-gap-2">
                  <StatusBadge tone={item.statusTone}>{item.statusLabel}</StatusBadge>
                  <span className={`tw-text-xs tw-font-semibold ${appV2Tone.mutedText}`}>
                    {item.equipmentCountLabel}
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
