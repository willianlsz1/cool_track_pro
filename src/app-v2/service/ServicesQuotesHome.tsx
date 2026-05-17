import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar, faPlus } from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { PageShell, SectionCard, SectionEyebrow } from '../ui/primitives';
import { QuoteCard } from './QuoteCard';
import { QuoteEditor } from './QuoteEditor';
import { QuoteTemplatePanel } from './QuoteTemplatePanel';
import { ServicesSubViewNav, type ServicesSubView } from './ServicesSubViewNav';
import type { QuoteEditDraft, QuoteEditItemDraft } from './quoteDraftTypes';
import {
  cloneQuoteItems,
  formatCurrency,
  formatNumberInput,
  getEditingSubtotal,
} from './quoteDraftUtils';
import { quoteTemplates } from './quoteTemplates';
import {
  buildServicesQuotesViewModel,
  type BuildServicesQuotesInput,
  type ServicesQuoteListItemViewModel,
} from './servicesQuotesViewModel';

export type { QuoteEditDraft } from './quoteDraftTypes';

interface ServicesQuotesHomeProps {
  activeView: ServicesSubView;
  input: BuildServicesQuotesInput;
  onSelectView: (view: ServicesSubView) => void;
  onSaveQuote?: (draft: QuoteEditDraft) => string | null;
}

export function ServicesQuotesHome({
  activeView,
  input,
  onSelectView,
  onSaveQuote,
}: ServicesQuotesHomeProps) {
  const viewModel = buildServicesQuotesViewModel(input);
  const firstEditableQuote = viewModel.items.find((quote) => quote.canEdit);
  const [editingQuote, setEditingQuote] = useState<QuoteEditDraft | null>(null);
  const [editingSummary, setEditingSummary] = useState<ServicesQuoteListItemViewModel | null>(null);
  const [itemDraft, setItemDraft] = useState<QuoteEditItemDraft>({
    description: '',
    quantity: '1',
    unitValue: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function startEditingQuote(quote: ServicesQuoteListItemViewModel) {
    const template =
      quoteTemplates.find((item) => item.id === quote.templateId) ?? quoteTemplates[0];
    const existingItems = quote.items.map((item) => ({
      description: item.description,
      quantity: item.quantity || '1',
      unitValue: item.unitValue,
    }));

    setErrorMessage(null);
    setItemDraft({ description: '', quantity: '1', unitValue: '' });
    setEditingSummary(quote);
    setEditingQuote({
      id: quote.id,
      templateId: quote.templateId ?? template.id,
      title: quote.title,
      description: quote.description ?? '',
      total: quote.totalLabel.replace('R$', '').trim(),
      discount: quote.discountValue > 0 ? formatNumberInput(quote.discountValue) : '',
      validityDays: quote.validityDays ? String(quote.validityDays) : '',
      paymentTerms: quote.paymentTerms,
      notes: quote.notes,
      status: quote.status,
      items: existingItems.length > 0 ? existingItems : cloneQuoteItems(template.items),
    });
  }

  function addEditingItem() {
    const description = itemDraft.description.trim();
    const quantity = itemDraft.quantity.trim() || '1';

    if (!description) {
      setErrorMessage('Informe a descrição do item do orçamento.');
      return;
    }

    setEditingQuote((current) =>
      current
        ? {
            ...current,
            items: [...current.items, { ...itemDraft, description, quantity }],
          }
        : current,
    );
    setItemDraft({ description: '', quantity: '1', unitValue: '' });
    setErrorMessage(null);
  }

  function cancelEditingQuote() {
    setErrorMessage(null);
    setEditingQuote(null);
    setEditingSummary(null);
  }

  function saveEditingQuote() {
    if (!editingQuote) {
      return;
    }

    const nextSubtotal = getEditingSubtotal(editingQuote);
    const error =
      onSaveQuote?.({
        ...editingQuote,
        total: formatNumberInput(nextSubtotal),
      }) ?? null;

    if (error) {
      setErrorMessage(error);
      return;
    }

    cancelEditingQuote();
  }

  if (editingQuote && editingSummary) {
    return (
      <QuoteEditor
        draft={editingQuote}
        itemDraft={itemDraft}
        quote={editingSummary}
        errorMessage={errorMessage}
        onAddItem={addEditingItem}
        onCancel={cancelEditingQuote}
        onChangeDraft={setEditingQuote}
        onChangeItemDraft={setItemDraft}
        onSave={saveEditingQuote}
      />
    );
  }

  return (
    <PageShell>
      <ServicesSubViewNav activeView={activeView} onSelectView={onSelectView} />

      <header className="tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-4">
        <div className="tw-min-w-0">
          <SectionEyebrow>{viewModel.subtitle}</SectionEyebrow>
          <h1
            className={`tw-m-0 tw-mt-3 tw-text-[1.8rem] tw-font-extrabold tw-leading-tight tw-tracking-[-0.02em] ${appV2Tone.text}`}
          >
            {viewModel.title}
          </h1>
          <p
            className={`tw-m-0 tw-mt-1.5 tw-max-w-3xl tw-text-[0.85rem] tw-font-normal ${appV2Tone.mutedText}`}
          >
            Crie rascunhos a partir de modelos pre-preenchidos e ajuste os itens antes de enviar em
            uma etapa futura.
          </p>
        </div>

        {firstEditableQuote && onSaveQuote ? (
          <button
            type="button"
            onClick={() => startEditingQuote(firstEditableQuote)}
            className={`tw-inline-flex tw-min-h-10 tw-items-center tw-gap-2 tw-rounded-xl tw-border-0 tw-bg-[#2563EB] tw-px-4 tw-text-sm tw-font-semibold tw-text-white tw-shadow-sm ${appV2Tone.focus}`}
          >
            <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
            Novo orçamento local
          </button>
        ) : null}
      </header>

      <SectionCard>
        <div className="tw-grid tw-gap-4 md:tw-grid-cols-3">
          {viewModel.kpis.map((kpi) => (
            <KpiCard key={kpi.label} label={kpi.label} value={kpi.valueLabel ?? kpi.value} />
          ))}
        </div>
      </SectionCard>

      <div className="tw-grid tw-gap-6 lg:tw-grid-cols-[360px_minmax(0,1fr)]">
        <QuoteTemplatePanel />

        <SectionCard className="sm:tw-p-5" labelledBy="quotes-title" padding="md">
          <h2
            id="quotes-title"
            className={`tw-m-0 tw-text-[0.8rem] tw-font-semibold tw-uppercase ${appV2Tone.text}`}
          >
            Orçamentos · Acompanhamento
          </h2>

          {viewModel.items.length > 0 ? (
            <div className="tw-mt-6 tw-grid tw-gap-4">
              {viewModel.items.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onEdit={quote.canEdit && onSaveQuote ? () => startEditingQuote(quote) : undefined}
                />
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
      </div>
    </PageShell>
  );
}

function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="tw-rounded-xl tw-border tw-border-[#E2E8F0] tw-bg-white tw-p-4 tw-text-center tw-shadow-sm">
      <p
        className={`tw-m-0 tw-font-extrabold tw-leading-tight ${
          typeof value === 'string' && value.startsWith('R$')
            ? 'tw-text-[1.4rem]'
            : 'tw-text-[1.8rem]'
        } ${appV2Tone.text}`}
      >
        {value}
      </p>
      <p className="tw-m-0 tw-mt-1 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-wide tw-text-[#1E4F8A]">
        {label}
      </p>
    </div>
  );
}
