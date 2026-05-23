import { useState, type ReactNode } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faCalendarAlt,
  faCalendarWeek,
  faChartSimple,
  faCheckCircle,
  faClipboardList,
  faFileInvoiceDollar,
  faMicrochip,
  faPlay,
  faTag,
} from '@fortawesome/free-solid-svg-icons';

import { appV2Border, appV2Focus, appV2Text, appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard, SectionEyebrow } from '../ui/primitives';
import { RecentServiceCard } from './RecentServiceCard';
import { ServiceInProgressCard } from './ServiceInProgressCard';
import {
  ServicesQuotesHome,
  type PreServiceQuoteCreateDraft,
  type QuoteEditDraft,
} from './ServicesQuotesHome';
import { ServiceReportsHome } from './ServiceReportsHome';
import type { ServiceDraft } from './serviceFlowViewModel';
import {
  buildServicesHomeViewModel,
  type BuildServicesHomeFilters,
  type BuildServicesHomeInput,
  type RecentServiceViewModel,
} from './servicesHomeViewModel';
import { ServicesSubViewNav, type ServicesSubView } from './ServicesSubViewNav';

interface ServicesHomeProps {
  draft: ServiceDraft | null;
  initialView?: ServicesSubView;
  input: BuildServicesHomeInput;
  onResumeService: () => void;
  onStartService: () => void;
  onEditService?: (serviceId: string) => void;
  onSaveQuote?: (draft: QuoteEditDraft) => string | null | Promise<string | null>;
  onCreatePreServiceQuote?: (
    draft: PreServiceQuoteCreateDraft,
  ) => string | null | Promise<string | null>;
}

export function ServicesHome({
  draft,
  initialView = 'registros',
  input,
  onResumeService,
  onStartService,
  onEditService,
  onSaveQuote,
  onCreatePreServiceQuote,
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

  function runDominantCta() {
    if (viewModel.dominantCta.kind === 'resume_service') {
      onResumeService();
      return;
    }

    if (viewModel.dominantCta.kind === 'start_service') {
      onStartService();
      return;
    }

    setActiveView(viewModel.dominantCta.targetView);
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
        onCreatePreServiceQuote={onCreatePreServiceQuote}
        onSaveQuote={onSaveQuote}
        onSelectView={setActiveView}
      />
    );
  }

  return (
    <PageShell className="tw-gap-6">
      <header className="tw-min-w-0">
        <SectionEyebrow>{viewModel.subtitle}</SectionEyebrow>
        <h1
          className={`tw-m-0 tw-mt-3 tw-text-[1.8rem] tw-font-bold tw-leading-tight tw-tracking-[-0.3px] ${appV2Tone.text}`}
        >
          Registros &middot; Relatórios &middot; Orçamentos
        </h1>
        <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
          {viewModel.description}
        </p>
        <div className="tw-mt-4">
          <ServicesSubViewNav activeView={activeView} onSelectView={setActiveView} />
        </div>
      </header>

      <div className="tw-grid tw-gap-7 xl:tw-grid-cols-[minmax(0,1fr)_320px]">
        <div className="tw-grid tw-min-w-0 tw-gap-6">
          {viewModel.inProgress ? (
            <ServiceInProgressCard
              service={viewModel.inProgress}
              onResumeService={onResumeService}
            />
          ) : (
            <EmptyServicesCard
              title={viewModel.emptyState.title}
              description={viewModel.emptyState.description}
              actionLabel={viewModel.emptyState.actionLabel}
              onStartService={onStartService}
            />
          )}

          <DominantActionCard cta={viewModel.dominantCta} onAction={runDominantCta} />

          <SectionCard className="sm:tw-p-5" labelledBy="recent-services-title" padding="sm">
            <h2
              id="recent-services-title"
              className={`tw-m-0 tw-text-base tw-font-bold tw-uppercase ${appV2Tone.text}`}
            >
              Registros recentes
            </h2>

            <label className="tw-sr-only">
              <span className="tw-sr-only">Buscar registros</span>
              <input
                aria-label="Buscar registros"
                value={viewModel.activeFilters.query}
                onChange={(event) => updateServiceFilter('query', event.target.value)}
                placeholder="Buscar equipamento, cliente, técnico ou registro"
                className="tw-sr-only"
              />
            </label>

            <div className="tw-mt-4 tw-flex tw-flex-wrap tw-gap-3">
              <FilterSelect
                label="Período"
                icon={faCalendarAlt}
                name="service-period-filter"
                value={viewModel.activeFilters.period}
                onChange={(value) =>
                  updateServiceFilter('period', value as BuildServicesHomeFilters['period'])
                }
                options={[
                  { value: 'all', label: 'Todo período' },
                  { value: 'last_7_days', label: 'Últimos 7 dias' },
                  { value: 'current_month', label: 'Mês atual' },
                ]}
              />
              <FilterSelect
                label="Cliente"
                icon={faBuilding}
                name="service-client-filter"
                value={viewModel.activeFilters.clientId}
                onChange={(value) => updateServiceFilter('clientId', value)}
                options={[
                  { value: 'all', label: 'Todos os clientes' },
                  ...viewModel.filterOptions.clients.map((client) => ({
                    value: client.id,
                    label: client.label,
                  })),
                ]}
              />
              <FilterSelect
                label="Equipamento"
                icon={faMicrochip}
                name="service-equipment-filter"
                value={viewModel.activeFilters.equipmentId}
                onChange={(value) => updateServiceFilter('equipmentId', value)}
                options={[
                  { value: 'all', label: 'Todos os equipamentos' },
                  ...viewModel.filterOptions.equipments.map((equipment) => ({
                    value: equipment.id,
                    label: equipment.label,
                  })),
                ]}
              />
              <FilterSelect
                label="Tipo"
                icon={faTag}
                name="service-kind-filter"
                value={viewModel.activeFilters.kind}
                onChange={(value) =>
                  updateServiceFilter('kind', value as BuildServicesHomeFilters['kind'])
                }
                options={[
                  { value: 'all', label: 'Todos os tipos' },
                  { value: 'preventiva', label: 'Preventiva' },
                  { value: 'corretiva', label: 'Corretiva' },
                  { value: 'instalacao', label: 'Instalação' },
                  { value: 'visita', label: 'Visita' },
                  { value: 'outro', label: 'Outro' },
                ]}
              />
              <FilterSelect
                label="Status"
                icon={faChartSimple}
                name="service-status-filter"
                value={viewModel.activeFilters.status}
                onChange={(value) =>
                  updateServiceFilter('status', value as BuildServicesHomeFilters['status'])
                }
                options={[
                  { value: 'all', label: 'Todos os status' },
                  { value: 'ok', label: 'Operacional' },
                  { value: 'warn', label: 'Atenção' },
                  { value: 'danger', label: 'Crítico' },
                ]}
              />
            </div>

            {viewModel.recentServices.length > 0 ? (
              <div data-testid="service-record-results" className="tw-mt-4 tw-grid tw-gap-4">
                {viewModel.recentServices.map((service) => (
                  <RecentServiceCard
                    key={service.id}
                    service={service}
                    onEditService={onEditService}
                  />
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
        </div>

        <ServicesAside recentServices={viewModel.recentServices} />
      </div>
    </PageShell>
  );
}

function DominantActionCard({
  cta,
  onAction,
}: {
  cta: ReturnType<typeof buildServicesHomeViewModel>['dominantCta'];
  onAction: () => void;
}) {
  return (
    <SectionCard
      className="tw-flex tw-flex-col tw-gap-4 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between"
      labelledBy="services-dominant-cta-title"
      padding="sm"
    >
      <span className="tw-min-w-0">
        <span
          id="services-dominant-cta-title"
          className={`tw-block tw-text-sm tw-font-bold ${appV2Tone.text}`}
        >
          {cta.title}
        </span>
        <span className={`tw-mt-1 tw-block tw-text-xs tw-font-medium ${appV2Tone.mutedText}`}>
          {cta.detail}
        </span>
      </span>
      <ActionButton onClick={onAction} className="tw-min-h-10 tw-gap-2 tw-px-4 tw-py-2">
        <FontAwesomeIcon icon={faPlay} className="tw-h-3.5 tw-w-3.5" aria-hidden="true" />
        {cta.label}
      </ActionButton>
    </SectionCard>
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
  icon,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  icon: IconDefinition;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="tw-block">
      <span className="tw-sr-only">{label}</span>
      <span
        className={`tw-inline-flex tw-min-h-9 tw-items-center tw-gap-2 tw-rounded-full tw-border tw-bg-[#F8FAFD] tw-px-4 tw-text-[0.7rem] tw-font-semibold ${appV2Text.action} ${appV2Border.default} ${appV2Focus}`}
      >
        <FontAwesomeIcon icon={icon} className="tw-text-[#8BA0BC]" aria-hidden="true" />
        <select
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="tw-border-0 tw-bg-transparent tw-p-0 tw-text-[0.7rem] tw-font-semibold tw-text-[#1E4F8A] focus:tw-outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
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
    <SectionCard className="tw-text-center sm:tw-p-8">
      <div className="tw-mx-auto tw-mb-4 tw-flex tw-h-12 tw-w-12 tw-items-center tw-justify-center tw-text-[2.5rem] tw-text-[#CBD5E1]">
        <FontAwesomeIcon icon={faClipboardList} aria-hidden="true" />
      </div>
      <h2 className={`tw-m-0 tw-text-sm tw-font-bold tw-uppercase ${appV2Tone.text}`}>
        Sem andamento
      </h2>
      <p className={`tw-m-0 tw-mt-2 tw-text-sm tw-font-semibold ${appV2Tone.mutedText}`}>{title}</p>
      <p className={`tw-m-0 tw-mt-2 tw-text-xs tw-font-medium tw-leading-5 ${appV2Tone.mutedText}`}>
        {description}
      </p>
      <ActionButton onClick={onStartService} className="tw-mt-5 tw-min-h-10 tw-px-5 tw-py-2">
        <FontAwesomeIcon icon={faPlay} aria-hidden="true" />
        <span className="tw-ml-2">{actionLabel}</span>
      </ActionButton>
    </SectionCard>
  );
}

function ServicesAside({ recentServices }: { recentServices: RecentServiceViewModel[] }) {
  const { quoteSuggestion, nextCommitment, operational } = pickAsideItems(recentServices);

  return (
    <aside className="tw-grid tw-h-fit tw-gap-5">
      <AsideCard
        icon={faFileInvoiceDollar}
        title="Orçamento sugerido"
        iconClass="tw-text-[#2563EB]"
      >
        {quoteSuggestion ? (
          <AsideServiceItem service={quoteSuggestion} detail={quoteSuggestion.summary} />
        ) : (
          <AsideEmpty>Nenhum orçamento sugerido.</AsideEmpty>
        )}
      </AsideCard>

      <AsideCard icon={faCalendarWeek} title="Próximo compromisso" iconClass="tw-text-[#2563EB]">
        {nextCommitment ? (
          <AsideServiceItem
            service={nextCommitment}
            detail={nextCommitment.summary}
            nextLabel={nextCommitment.nextMaintenanceLabel}
          />
        ) : (
          <AsideEmpty>Nenhum compromisso sugerido.</AsideEmpty>
        )}
      </AsideCard>

      <AsideCard icon={faCheckCircle} title="Operacional" iconClass="tw-text-[#16A34A]">
        {operational ? (
          <AsideServiceItem
            service={operational}
            detail={`${operational.kindLabel} em ${operational.dateLabel}`}
            nextLabel="em dia"
          />
        ) : (
          <AsideEmpty>Nenhum registro operacional recente.</AsideEmpty>
        )}
      </AsideCard>
    </aside>
  );
}

function pickAsideItems(recentServices: RecentServiceViewModel[]) {
  return {
    quoteSuggestion:
      recentServices.find((service) => service.outputStatus === 'orcamento_sugerido') ?? null,
    nextCommitment:
      recentServices.find((service) => service.nextMaintenanceLabel) ??
      recentServices.find((service) => service.outputStatus === 'proximo_compromisso_sugerido') ??
      null,
    operational: recentServices.find((service) => service.statusTone === 'success') ?? null,
  };
}

function AsideCard({
  icon,
  iconClass,
  title,
  children,
}: {
  icon: IconDefinition;
  iconClass: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <SectionCard padding="sm">
      <h2
        className={`tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-bold ${appV2Tone.text}`}
      >
        <FontAwesomeIcon icon={icon} className={iconClass} aria-hidden="true" />
        {title}
      </h2>
      <div className="tw-mt-3">{children}</div>
    </SectionCard>
  );
}

function AsideServiceItem({
  service,
  detail,
  nextLabel,
}: {
  service: RecentServiceViewModel;
  detail: string;
  nextLabel?: string | null;
}) {
  return (
    <div className="tw-border-t tw-border-[#EDF2F7] tw-pt-3 first:tw-border-t-0 first:tw-pt-0">
      <p className="tw-m-0 tw-text-xs tw-font-bold tw-text-[#2563EB]">
        {service.kindLabel} - {service.dateLabel}
      </p>
      <h3 className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-bold ${appV2Tone.text}`}>
        {service.equipmentName}
      </h3>
      <p className={`tw-m-0 tw-mt-1 tw-text-xs tw-font-medium ${appV2Tone.mutedText}`}>
        {service.customerLine}
      </p>
      <p
        className={`tw-m-0 tw-mt-2 tw-text-xs tw-font-medium tw-leading-5 ${appV2Tone.subtleText}`}
      >
        {detail || 'Sem resumo técnico informado.'}
      </p>
      {nextLabel ? (
        <span className="tw-mt-2 tw-inline-flex tw-rounded-full tw-bg-[#F0FDF4] tw-px-2 tw-py-1 tw-text-[0.65rem] tw-font-semibold tw-text-[#16A34A]">
          {nextLabel === 'em dia' ? 'Status: em dia' : `Próxima manutenção: ${nextLabel}`}
        </span>
      ) : null}
    </div>
  );
}

function AsideEmpty({ children }: { children: ReactNode }) {
  return (
    <p
      className={`tw-m-0 tw-rounded-xl tw-bg-[#F8FAFE] tw-p-3 tw-text-xs tw-font-medium ${appV2Tone.mutedText}`}
    >
      {children}
    </p>
  );
}
