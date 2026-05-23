import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar, faPlus } from '@fortawesome/free-solid-svg-icons';

import type { Equipamento } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import { FieldGroup, fieldSelectClass } from '../ui/FieldGroup';
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
  onSaveQuote?: (draft: QuoteEditDraft) => string | null | Promise<string | null>;
  onCreatePreServiceQuote?: (
    draft: PreServiceQuoteCreateDraft,
  ) => string | null | Promise<string | null>;
}

export interface PreServiceQuoteCreateDraft {
  id: string;
  equipmentId: string;
  templateId: string;
}

export function ServicesQuotesHome({
  activeView,
  input,
  onSelectView,
  onSaveQuote,
  onCreatePreServiceQuote,
}: ServicesQuotesHomeProps) {
  const viewModel = buildServicesQuotesViewModel(input);
  const firstAvailableEquipment = input.equipamentos.find((equipment) => !equipment.archivedAt);
  const [editingQuote, setEditingQuote] = useState<QuoteEditDraft | null>(null);
  const [editingSummary, setEditingSummary] = useState<ServicesQuoteListItemViewModel | null>(null);
  const [isCreatingPreServiceQuote, setIsCreatingPreServiceQuote] = useState(false);
  const [createdQuoteId, setCreatedQuoteId] = useState<string | null>(null);
  const [createDraft, setCreateDraft] = useState<PreServiceQuoteCreateDraft>({
    id: createLocalQuoteId(viewModel.totalItems),
    equipmentId: firstAvailableEquipment?.id ?? '',
    templateId: quoteTemplates[0]?.id ?? '',
  });
  const [itemDraft, setItemDraft] = useState<QuoteEditItemDraft>({
    description: '',
    quantity: '1',
    unitValue: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!createdQuoteId) {
      return;
    }

    const createdQuote = viewModel.items.find((quote) => quote.id === createdQuoteId);

    if (createdQuote?.canEdit) {
      setCreatedQuoteId(null);
      setIsCreatingPreServiceQuote(false);
      startEditingQuote(createdQuote);
    }
  }, [createdQuoteId, viewModel.items]);

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

  async function saveEditingQuote() {
    if (!editingQuote) {
      return;
    }

    const nextSubtotal = getEditingSubtotal(editingQuote);
    const error = await resolveQuoteActionResult(
      onSaveQuote?.({
        ...editingQuote,
        total: formatNumberInput(nextSubtotal),
      }) ?? null,
      'Não foi possível salvar o orçamento.',
    );

    if (error) {
      setErrorMessage(error);
      return;
    }

    cancelEditingQuote();
  }

  function startCreatingPreServiceQuote() {
    setErrorMessage(null);
    setIsCreatingPreServiceQuote(true);
    setCreateDraft({
      id: createLocalQuoteId(viewModel.totalItems),
      equipmentId: firstAvailableEquipment?.id ?? '',
      templateId: quoteTemplates[0]?.id ?? '',
    });
  }

  function cancelCreatingPreServiceQuote() {
    setErrorMessage(null);
    setIsCreatingPreServiceQuote(false);
  }

  async function savePreServiceQuoteDraft() {
    if (!onCreatePreServiceQuote) {
      return;
    }

    const error = await resolveQuoteActionResult(
      onCreatePreServiceQuote(createDraft),
      'Não foi possível criar o orçamento.',
    );

    if (error) {
      setErrorMessage(error);
      return;
    }

    setCreatedQuoteId(createDraft.id);
    setErrorMessage(null);
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

  if (isCreatingPreServiceQuote) {
    return (
      <PreServiceQuoteCreatePanel
        draft={createDraft}
        equipments={input.equipamentos}
        errorMessage={errorMessage}
        onCancel={cancelCreatingPreServiceQuote}
        onChange={setCreateDraft}
        onSave={savePreServiceQuoteDraft}
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

        {onCreatePreServiceQuote ? (
          <button
            type="button"
            onClick={startCreatingPreServiceQuote}
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

function PreServiceQuoteCreatePanel({
  draft,
  equipments,
  errorMessage,
  onCancel,
  onChange,
  onSave,
}: {
  draft: PreServiceQuoteCreateDraft;
  equipments: Equipamento[];
  errorMessage: string | null;
  onCancel: () => void;
  onChange: (draft: PreServiceQuoteCreateDraft) => void;
  onSave: () => void;
}) {
  const availableEquipments = equipments.filter((equipment) => !equipment.archivedAt);

  return (
    <PageShell>
      <header className="tw-min-w-0">
        <SectionEyebrow>Orçamento pré-serviço</SectionEyebrow>
        <h1
          className={`tw-m-0 tw-mt-3 tw-text-[1.8rem] tw-font-extrabold tw-leading-tight tw-tracking-[-0.02em] ${appV2Tone.text}`}
        >
          Novo orçamento pré-serviço
        </h1>
        <p className={`tw-m-0 tw-mt-1.5 tw-text-[0.85rem] ${appV2Tone.mutedText}`}>
          Crie um rascunho local antes da execução. Aprovação, envio e integrações ficam para etapas
          futuras.
        </p>
      </header>

      <SectionCard padding="md">
        <div className="tw-grid tw-gap-4 md:tw-grid-cols-2">
          <FieldGroup label="Equipamento">
            <select
              name="quote-create-equipment"
              value={draft.equipmentId}
              onChange={(event) => onChange({ ...draft, equipmentId: event.target.value })}
              className={fieldSelectClass}
            >
              <option value="">Selecione um equipamento</option>
              {availableEquipments.map((equipment) => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.nome} - {equipment.local}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="Modelo">
            <select
              name="quote-create-template"
              value={draft.templateId}
              onChange={(event) => onChange({ ...draft, templateId: event.target.value })}
              className={fieldSelectClass}
            >
              {quoteTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
          </FieldGroup>
        </div>

        {errorMessage ? (
          <p className="tw-m-0 tw-mt-4 tw-text-sm tw-font-semibold tw-text-[#DC2626]">
            {errorMessage}
          </p>
        ) : null}

        <div className="tw-mt-6 tw-flex tw-flex-wrap tw-justify-end tw-gap-3 tw-border-t tw-border-[#EDF2F7] tw-pt-4">
          <button
            type="button"
            onClick={onCancel}
            className={`tw-inline-flex tw-min-h-10 tw-items-center tw-justify-center tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-white tw-px-4 tw-text-xs tw-font-medium tw-text-[#1E4F8A] ${appV2Tone.focus}`}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className={`tw-inline-flex tw-min-h-10 tw-items-center tw-justify-center tw-gap-2 tw-rounded-xl tw-border-0 tw-bg-[#2563EB] tw-px-4 tw-text-xs tw-font-semibold tw-text-white ${appV2Tone.focus}`}
          >
            <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
            Criar rascunho
          </button>
        </div>
      </SectionCard>
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

function createLocalQuoteId(seed: number): string {
  return `orcamento-pre-servico-${seed + 1}`;
}

async function resolveQuoteActionResult(
  result: string | null | Promise<string | null>,
  fallbackMessage: string,
): Promise<string | null> {
  try {
    return await result;
  } catch (error) {
    return error instanceof Error ? error.message : fallbackMessage;
  }
}
