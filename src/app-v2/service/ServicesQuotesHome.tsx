import { appV2Tone } from '../styles/tokens';
import { PageShell, SectionCard, StatusBadge } from '../ui/primitives';
import { ServicesSubViewNav, type ServicesSubView } from './ServicesSubViewNav';
import {
  buildServicesQuotesViewModel,
  type BuildServicesQuotesInput,
  type ServicesQuoteListItemViewModel,
} from './servicesQuotesViewModel';

interface ServicesQuotesHomeProps {
  activeView: ServicesSubView;
  input: BuildServicesQuotesInput;
  onSelectView: (view: ServicesSubView) => void;
}

export function ServicesQuotesHome({ activeView, input, onSelectView }: ServicesQuotesHomeProps) {
  const viewModel = buildServicesQuotesViewModel(input);

  return (
    <PageShell>
      <ServicesSubViewNav activeView={activeView} onSelectView={onSelectView} />

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
            Orcamentos mockados
          </span>
          <span className={`tw-mt-1 tw-block tw-text-2xl tw-font-bold ${appV2Tone.text}`}>
            {viewModel.totalItems}
          </span>
        </SectionCard>
      </header>

      <section className="tw-grid tw-gap-3 sm:tw-grid-cols-3">
        {viewModel.kpis.map((kpi) => (
          <SectionCard key={kpi.label} padding="sm">
            <span
              className={`tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
            >
              {kpi.label}
            </span>
            <span className={`tw-mt-2 tw-block tw-text-xl tw-font-bold ${appV2Tone.text}`}>
              {kpi.valueLabel ?? kpi.value}
            </span>
          </SectionCard>
        ))}
      </section>

      <SectionCard className="sm:tw-p-5" labelledBy="quotes-title" padding="sm">
        <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
          <div>
            <p
              className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
            >
              Orçamentos
            </p>
            <h2
              id="quotes-title"
              className={`tw-m-0 tw-mt-1 tw-text-lg tw-font-semibold ${appV2Tone.text}`}
            >
              Acompanhamento
            </h2>
          </div>
          <StatusBadge>{viewModel.totalItems}</StatusBadge>
        </div>

        {viewModel.items.length > 0 ? (
          <div className="tw-mt-4 tw-grid tw-gap-3">
            {viewModel.items.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} />
            ))}
          </div>
        ) : (
          <p
            className={`tw-m-0 tw-mt-4 tw-rounded-xl tw-border tw-bg-[#F8FAFC] tw-p-4 tw-text-sm tw-font-medium ${appV2Tone.border} ${appV2Tone.mutedText}`}
          >
            {viewModel.emptyState.title}. {viewModel.emptyState.description}
          </p>
        )}
      </SectionCard>
    </PageShell>
  );
}

function QuoteCard({ quote }: { quote: ServicesQuoteListItemViewModel }) {
  return (
    <article className={`tw-rounded-2xl tw-border tw-bg-white tw-p-4 ${appV2Tone.border}`}>
      <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
        <div className="tw-min-w-0">
          <p
            className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
          >
            {quote.number}
          </p>
          <h3 className={`tw-m-0 tw-mt-1 tw-text-base tw-font-bold ${appV2Tone.text}`}>
            {quote.title}
          </h3>
        </div>
        <StatusBadge tone={quote.statusTone}>{quote.statusLabel}</StatusBadge>
      </div>

      <dl className="tw-m-0 tw-mt-4 tw-grid tw-gap-3 sm:tw-grid-cols-3">
        <QuoteFact label="Cliente" value={quote.customerLine} />
        <QuoteFact label="Equipamento" value={quote.equipmentLine} />
        <QuoteFact label="Total" value={quote.totalLabel} />
      </dl>
    </article>
  );
}

function QuoteFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className={`tw-text-[0.65rem] tw-font-bold tw-uppercase tw-tracking-[0.12em] ${appV2Tone.subtleText}`}
      >
        {label}
      </dt>
      <dd className={`tw-m-0 tw-mt-1 tw-text-sm tw-font-semibold ${appV2Tone.text}`}>{value}</dd>
    </div>
  );
}
