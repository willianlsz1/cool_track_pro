import { useState } from 'react';

import { appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard, StatusBadge } from '../ui/primitives';
import { RecentServiceCard } from './RecentServiceCard';
import { ServiceInProgressCard } from './ServiceInProgressCard';
import { ServicesQuotesHome, type QuoteEditDraft } from './ServicesQuotesHome';
import { ServiceReportsHome } from './ServiceReportsHome';
import type { ServiceDraft } from './serviceFlowViewModel';
import {
  buildServicesHomeViewModel,
  type BuildServicesHomeFilters,
  type BuildServicesHomeInput,
} from './servicesHomeViewModel';
import { ServicesSubViewNav, type ServicesSubView } from './ServicesSubViewNav';

interface ServicesHomeProps {
  draft: ServiceDraft | null;
  initialView?: ServicesSubView;
  input: BuildServicesHomeInput;
  onResumeService: () => void;
  onStartService: () => void;
  onEditService?: (serviceId: string) => void;
  onSaveQuote?: (draft: QuoteEditDraft) => string | null;
}

export function ServicesHome({
  draft,
  initialView = 'registros',
  input,
  onResumeService,
  onStartService,
  onEditService,
  onSaveQuote,
}: ServicesHomeProps) {
  const [activeView, setActiveView] = useState<ServicesSubView>(initialView);
  const [serviceFilters, setServiceFilters] = useState<BuildServicesHomeFilters>({});
  const viewModel = buildServicesHomeViewModel(input, draft, serviceFilters);

  function updateServiceFilter<Key extends keyof BuildServicesHomeFilters>(
    key: Key,
    value: BuildServicesHomeFilters[Key],
  ) {
    setServiceFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  if (activeView === 'relatorios') {
    return (
      <ServiceReportsHome
        activeView={activeView}
        input={input}
        onPrintReport={() => window.print()}
        onSelectView={setActiveView}
      />
    );
  }

  if (activeView === 'orcamentos') {
    return (
      <ServicesQuotesHome
        activeView={activeView}
        input={input}
        onSaveQuote={onSaveQuote}
        onSelectView={setActiveView}
      />
    );
  }

  return (
    <PageShell>
      <ServicesSubViewNav activeView={activeView} onSelectView={setActiveView} />

      <header className="tw-grid tw-gap-5 lg:tw-grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] lg:tw-items-end">
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.18em] tw-text-[#2563EB]">
            {viewModel.subtitle}
          </p>
          <h1
            className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-none sm:tw-text-[2rem] ${appV2Tone.text}`}
          >
            {viewModel.title}
          </h1>
          <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-normal ${appV2Tone.mutedText}`}>
            {viewModel.description}
          </p>
        </div>
        <SectionCard padding="sm">
          <span className={`tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
            Registros recentes
          </span>
          <span className={`tw-mt-1 tw-block tw-text-2xl tw-font-bold ${appV2Tone.text}`}>
            {viewModel.recentServices.length}
          </span>
        </SectionCard>
      </header>

      {viewModel.inProgress ? (
        <ServiceInProgressCard service={viewModel.inProgress} onResumeService={onResumeService} />
      ) : (
        <EmptyServicesCard
          title={viewModel.emptyState.title}
          description={viewModel.emptyState.description}
          actionLabel={viewModel.emptyState.actionLabel}
          onStartService={onStartService}
        />
      )}

      <SectionCard className="sm:tw-p-5" labelledBy="recent-services-title" padding="sm">
        <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
          <div>
            <p
              className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
            >
              Registros
            </p>
            <h2
              id="recent-services-title"
              className={`tw-m-0 tw-mt-1 tw-text-lg tw-font-semibold ${appV2Tone.text}`}
            >
              Recentes
            </h2>
          </div>
          <StatusBadge>{viewModel.recentServices.length}</StatusBadge>
        </div>

        <label className="tw-mt-4 tw-block">
          <span className="tw-sr-only">Buscar registros</span>
          <input
            aria-label="Buscar registros"
            value={viewModel.activeFilters.query}
            onChange={(event) => updateServiceFilter('query', event.target.value)}
            placeholder="Buscar equipamento, cliente, tecnico ou registro"
            className={`tw-min-h-12 tw-w-full tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-px-4 tw-text-sm tw-font-medium ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
          />
        </label>

        <div className="tw-mt-4 tw-grid tw-gap-3 sm:tw-grid-cols-2 lg:tw-grid-cols-5">
          <FilterSelect
            label="Periodo"
            name="service-period-filter"
            value={viewModel.activeFilters.period}
            onChange={(value) =>
              updateServiceFilter('period', value as BuildServicesHomeFilters['period'])
            }
            options={[
              { value: 'all', label: 'Todo periodo' },
              { value: 'last_7_days', label: 'Ultimos 7 dias' },
              { value: 'current_month', label: 'Mes atual' },
            ]}
          />
          <FilterSelect
            label="Cliente"
            name="service-client-filter"
            value={viewModel.activeFilters.clientId}
            onChange={(value) => updateServiceFilter('clientId', value)}
            options={[
              { value: 'all', label: 'Todos clientes' },
              ...viewModel.filterOptions.clients.map((client) => ({
                value: client.id,
                label: client.label,
              })),
            ]}
          />
          <FilterSelect
            label="Equipamento"
            name="service-equipment-filter"
            value={viewModel.activeFilters.equipmentId}
            onChange={(value) => updateServiceFilter('equipmentId', value)}
            options={[
              { value: 'all', label: 'Todos equipamentos' },
              ...viewModel.filterOptions.equipments.map((equipment) => ({
                value: equipment.id,
                label: equipment.label,
              })),
            ]}
          />
          <FilterSelect
            label="Tipo"
            name="service-kind-filter"
            value={viewModel.activeFilters.kind}
            onChange={(value) =>
              updateServiceFilter('kind', value as BuildServicesHomeFilters['kind'])
            }
            options={[
              { value: 'all', label: 'Todos tipos' },
              { value: 'preventiva', label: 'Preventiva' },
              { value: 'corretiva', label: 'Corretiva' },
              { value: 'instalacao', label: 'Instalacao' },
              { value: 'visita', label: 'Visita' },
              { value: 'outro', label: 'Outro' },
            ]}
          />
          <FilterSelect
            label="Status"
            name="service-status-filter"
            value={viewModel.activeFilters.status}
            onChange={(value) =>
              updateServiceFilter('status', value as BuildServicesHomeFilters['status'])
            }
            options={[
              { value: 'all', label: 'Todos status' },
              { value: 'ok', label: 'Operacional' },
              { value: 'warn', label: 'Atencao' },
              { value: 'danger', label: 'Critico' },
            ]}
          />
        </div>

        {viewModel.recentServices.length > 0 ? (
          <div data-testid="service-record-results" className="tw-mt-4 tw-grid tw-gap-3">
            {viewModel.recentServices.map((service) => (
              <RecentServiceCard key={service.id} service={service} onEditService={onEditService} />
            ))}
          </div>
        ) : hasActiveServiceFilters(viewModel.activeFilters) ? (
          <p
            data-testid="service-record-results"
            className={`tw-m-0 tw-mt-4 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium ${appV2Tone.border} ${appV2Tone.mutedText}`}
          >
            Nenhum registro encontrado.
          </p>
        ) : (
          <p
            data-testid="service-record-results"
            className={`tw-m-0 tw-mt-4 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium ${appV2Tone.border} ${appV2Tone.mutedText}`}
          >
            Registros recentes aparecerão aqui depois do primeiro atendimento.
          </p>
        )}
      </SectionCard>
    </PageShell>
  );
}

function hasActiveServiceFilters(filters: Required<BuildServicesHomeFilters>): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.period !== 'all' ||
    filters.clientId !== 'all' ||
    filters.equipmentId !== 'all' ||
    filters.kind !== 'all' ||
    filters.status !== 'all'
  );
}

function FilterSelect({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="tw-block">
      <span
        className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
      >
        {label}
      </span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`tw-mt-2 tw-min-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-px-3 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyServicesCard({
  title,
  description,
  actionLabel,
  onStartService,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onStartService: () => void;
}) {
  return (
    <SectionCard>
      <p
        className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
      >
        Sem andamento
      </p>
      <h2 className={`tw-m-0 tw-mt-2 tw-text-2xl tw-font-bold tw-leading-tight ${appV2Tone.text}`}>
        {title}
      </h2>
      <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-normal tw-leading-6 ${appV2Tone.mutedText}`}>
        {description}
      </p>
      <ActionButton onClick={onStartService} className="tw-mt-5 tw-w-full sm:tw-w-auto">
        {actionLabel}
      </ActionButton>
    </SectionCard>
  );
}
