import { useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faCalendarCheck,
  faChartLine,
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faLocationDot,
  faMagnifyingGlass,
  faPhone,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

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
import { appV2Border, appV2Focus, appV2Shadow, appV2Text } from '../styles/tokens';
import { PageShell } from '../ui/primitives';

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
  { id: 'with_pending', label: 'Com pendência' },
  { id: 'critical', label: 'Críticos' },
  { id: 'without_first_service', label: 'Sem primeiro serviço' },
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
  const totalClients = viewModel.items.length;
  const criticalClients = viewModel.items.filter((item) => item.statusTone === 'danger').length;
  const operationalClients = viewModel.items.filter((item) => item.statusTone === 'success').length;
  const totalEquipments = sumCountLabels(viewModel.items.map((item) => item.equipmentCountLabel));
  const totalPending = sumCountLabels(viewModel.items.map((item) => item.pendingCountLabel));

  function saveClientDraft(draft: SaveClientDraft): string | null {
    const error = onSaveClient(draft);

    if (!error) {
      setIsCreating(false);
    }

    return error;
  }

  return (
    <PageShell className="tw-gap-6">
      <header className="tw-min-w-0">
        <p className="tw-m-0 tw-mb-3 tw-inline-flex tw-rounded-full tw-bg-[#EFF6FF] tw-px-3 tw-py-1 tw-text-[0.7rem] tw-font-semibold tw-uppercase tw-tracking-[0.05em] tw-text-[#1E4F8A]">
          Base instalada
        </p>
        <h1
          className={`tw-m-0 tw-text-[1.8rem] tw-font-bold tw-tracking-tight ${appV2Text.primary}`}
        >
          {viewModel.title}
        </h1>
        <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-semibold ${appV2Text.primary}`}>
          {viewModel.subtitle}
        </p>
        <p
          className={`tw-m-0 tw-mt-2 tw-flex tw-items-center tw-gap-2 tw-text-xs tw-font-normal ${appV2Text.subtle}`}
        >
          <FontAwesomeIcon icon={faInfoCircle} aria-hidden="true" className="tw-text-[0.7rem]" />
          Consulte clientes e os equipamentos vinculados sem sair da base instalada.
        </p>
      </header>

      <EquipmentSubViewNav activeView={activeView} onSelectView={onSelectView} />

      <div className="tw-grid tw-gap-7 xl:tw-grid-cols-[minmax(0,1fr)_320px]">
        <div className="tw-grid tw-gap-5">
          {isCreating ? (
            <ClientForm
              title="Novo cliente"
              onCancel={() => setIsCreating(false)}
              onSave={saveClientDraft}
            />
          ) : null}

          <section
            aria-labelledby="clients-list-title"
            className={`tw-rounded-[20px] tw-border tw-bg-white tw-p-5 ${appV2Border.default} ${appV2Shadow.card}`}
          >
            <h2 id="clients-list-title" className="tw-sr-only">
              Clientes
            </h2>

            {!isCreating ? (
              <>
                <label className="tw-sr-only" htmlFor="client-search">
                  Buscar cliente, documento ou equipamento
                </label>
                <div className="tw-mb-5 tw-flex tw-items-center tw-gap-2.5 tw-rounded-full tw-border tw-border-[#E2E8F0] tw-bg-[#F8FAFE] tw-px-5 tw-py-3">
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    aria-hidden="true"
                    className="tw-text-sm tw-text-[#8BA0BC]"
                  />
                  <input
                    id="client-search"
                    name="client-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar cliente, documento ou equipamento"
                    className={`tw-min-w-0 tw-flex-1 tw-border-0 tw-bg-transparent tw-text-sm tw-font-medium tw-outline-none placeholder:tw-font-normal placeholder:tw-text-[#8BA0BC] ${appV2Text.primary}`}
                  />
                </div>
              </>
            ) : null}

            <div className="tw-mb-6 tw-flex tw-flex-wrap tw-gap-2.5">
              {clientFilters.map((item) => {
                const isActive = item.id === viewModel.activeFilter;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={`tw-rounded-full tw-px-4 tw-py-2 tw-text-xs tw-font-medium ${appV2Focus} ${
                      isActive
                        ? 'tw-bg-[#1E4F8A] tw-text-white'
                        : 'tw-bg-[#F1F5F9] tw-text-[#1E4F8A]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="tw-flex tw-flex-col tw-gap-4">
              {clients.length === 0 ? (
                <EmptyClientMessage>Nenhum cliente disponível.</EmptyClientMessage>
              ) : viewModel.items.length === 0 ? (
                <EmptyClientMessage>
                  Nenhum cliente encontrado para a consulta atual.
                </EmptyClientMessage>
              ) : (
                viewModel.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenClient(item.id)}
                    className={`tw-w-full tw-rounded-[18px] tw-border tw-border-[#E2E8F0] tw-bg-white tw-px-5 tw-py-4 tw-text-left tw-transition hover:tw-bg-[#F8FAFE] ${appV2Focus}`}
                  >
                    <div className="tw-flex tw-min-w-0 tw-items-start tw-justify-between tw-gap-4">
                      <div className="tw-min-w-0">
                        <p className={`tw-m-0 tw-text-base tw-font-bold ${appV2Text.primary}`}>
                          {item.name}
                        </p>
                        <div className="tw-mt-2 tw-flex tw-flex-wrap tw-gap-x-4 tw-gap-y-1 tw-text-xs tw-font-medium tw-text-[#52677F]">
                          <span className="tw-inline-flex tw-items-center tw-gap-1.5">
                            <FontAwesomeIcon
                              icon={faLocationDot}
                              aria-hidden="true"
                              className="tw-w-3.5 tw-text-[#8BA0BC]"
                            />
                            {item.detailLine}
                          </span>
                          <span className="tw-inline-flex tw-items-center tw-gap-1.5">
                            <FontAwesomeIcon
                              icon={faPhone}
                              aria-hidden="true"
                              className="tw-w-3.5 tw-text-[#8BA0BC]"
                            />
                            {item.contactLine}
                          </span>
                        </div>
                        <p className="tw-m-0 tw-mt-2 tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-full tw-bg-[#F0FDF4] tw-px-2.5 tw-py-1 tw-text-xs tw-font-semibold tw-text-[#16A34A]">
                          <FontAwesomeIcon icon={faCalendarCheck} aria-hidden="true" />
                          {item.lastServiceLabel}
                        </p>
                      </div>
                      <div className="tw-flex tw-shrink-0 tw-flex-col tw-items-end tw-gap-1.5 tw-text-xs tw-font-semibold tw-text-[#52677F]">
                        <span className={getClientStatusClass(item.statusTone)}>
                          {item.statusLabel}
                        </span>
                        <span>{item.equipmentCountLabel}</span>
                        <span>{item.pendingCountLabel}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>

        <aside className="tw-flex tw-flex-col tw-gap-5">
          <SummaryCard
            title="Carteira técnica"
            icon={faChartLine}
            iconClass="tw-text-[#2563EB]"
            action={
              !isCreating ? (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className={`tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-xl tw-bg-[#2563EB] tw-px-3 tw-py-2 tw-text-xs tw-font-semibold tw-text-white ${appV2Focus}`}
                >
                  <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
                  Novo cliente
                </button>
              ) : null
            }
          >
            <div className={`tw-text-3xl tw-font-extrabold ${appV2Text.primary}`}>
              {totalClients}
            </div>
            <div className="tw-text-xs tw-font-medium tw-text-[#52677F]">
              {totalClients === 1 ? 'cliente ativo' : 'clientes ativos'}
            </div>
            <span className="tw-sr-only">{viewModel.totalLabel}</span>
          </SummaryCard>

          <SummaryCard
            title="Atenção crítica"
            icon={faExclamationTriangle}
            iconClass="tw-text-[#DC2626]"
            badge="urgente"
            badgeClass="tw-bg-[#EFF6FF] tw-text-[#1E4F8A]"
          >
            <SummaryRow
              label="Equipamentos"
              value={totalEquipments}
              valueClass="tw-text-[#DC2626]"
            />
            <SummaryRow label="Pendências" value={totalPending} valueClass="tw-text-[#DC2626]" />
          </SummaryCard>

          <SummaryCard
            title="Operacional"
            icon={faCheckCircle}
            iconClass="tw-text-[#16A34A]"
            badge="em dia"
            badgeClass="tw-bg-[#F0FDF4] tw-text-[#16A34A]"
          >
            <SummaryRow
              label="Equipamentos"
              value={Math.max(totalEquipments - totalPending, 0)}
              valueClass="tw-text-[#16A34A]"
            />
            <SummaryRow label="Pendências" value={0} />
          </SummaryCard>

          <SummaryCard title="Resumo operacional" icon={faBuilding} iconClass="tw-text-[#52677F]">
            <SummaryRow label="Clientes com pendência" value={totalPending > 0 ? 1 : 0} />
            <SummaryRow
              label="Equipamentos críticos"
              value={criticalClients}
              valueClass="tw-text-[#DC2626]"
            />
            <SummaryRow
              label="Sem primeiro serviço"
              value={
                viewModel.items.filter((item) => item.statusLabel === 'Sem equipamentos').length
              }
            />
            <span className="tw-sr-only">{operationalClients} clientes operacionais</span>
          </SummaryCard>
        </aside>
      </div>
    </PageShell>
  );
}

function EmptyClientMessage({ children }: { children: string }) {
  return (
    <p className="tw-m-0 tw-rounded-2xl tw-border tw-border-[#E2E8F0] tw-bg-white tw-px-5 tw-py-4 tw-text-sm tw-font-medium tw-text-[#52677F]">
      {children}
    </p>
  );
}

function SummaryCard({
  title,
  icon,
  iconClass,
  action,
  badge,
  badgeClass = '',
  children,
}: {
  title: string;
  icon: Parameters<typeof FontAwesomeIcon>[0]['icon'];
  iconClass: string;
  action?: React.ReactNode;
  badge?: string;
  badgeClass?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`tw-rounded-[20px] tw-border tw-bg-white tw-p-4 ${appV2Border.default} ${appV2Shadow.card}`}
    >
      <div className="tw-mb-3 tw-flex tw-items-center tw-justify-between tw-gap-3">
        <h2
          className={`tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-bold ${appV2Text.primary}`}
        >
          <FontAwesomeIcon icon={icon} aria-hidden="true" className={iconClass} />
          {title}
        </h2>
        {action}
        {badge ? (
          <span
            className={`tw-rounded-full tw-px-2.5 tw-py-1 tw-text-[0.65rem] tw-font-semibold ${badgeClass}`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SummaryRow({
  label,
  value,
  valueClass = appV2Text.primary,
}: {
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <div className="tw-flex tw-justify-between tw-border-b tw-border-[#EDF2F7] tw-py-2 tw-text-xs last:tw-border-b-0">
      <span className="tw-text-[#52677F]">{label}</span>
      <span className={`tw-font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}

function sumCountLabels(labels: string[]): number {
  return labels.reduce((total, label) => total + (Number.parseInt(label, 10) || 0), 0);
}

function getClientStatusClass(tone: EquipmentClientsListViewModel['items'][number]['statusTone']) {
  if (tone === 'danger') {
    return 'tw-rounded-full tw-bg-[#FEF2F2] tw-px-2.5 tw-py-1 tw-text-[#DC2626]';
  }

  if (tone === 'warning') {
    return 'tw-rounded-full tw-bg-[#FFFBEB] tw-px-2.5 tw-py-1 tw-text-[#D97706]';
  }

  return 'tw-rounded-full tw-bg-[#F0FDF4] tw-px-2.5 tw-py-1 tw-text-[#16A34A]';
}
