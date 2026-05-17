import { useState } from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen,
  faBoxesStacked,
  faBuilding,
  faCalendarCheck,
  faDownload,
  faFileInvoiceDollar,
  faFilePen,
  faFloppyDisk,
  faLayerGroup,
  faListUl,
  faMicrochip,
  faPaperPlane,
  faPen,
  faPlus,
  faSnowflake,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

import type { QuoteStatus } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import {
  FieldGroup,
  FormRow,
  FormStack,
  fieldInputClass,
  fieldSelectClass,
  fieldTextareaClass,
} from '../ui/FieldGroup';
import { PageShell, SectionCard, SectionEyebrow } from '../ui/primitives';
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
  onSaveQuote?: (draft: QuoteEditDraft) => string | null;
}

export interface QuoteEditDraft {
  id: string;
  templateId?: string;
  title: string;
  description: string;
  total: string;
  discount: string;
  validityDays: string;
  paymentTerms: string;
  notes: string;
  status: QuoteStatus;
  items: QuoteEditItemDraft[];
}

export interface QuoteEditItemDraft {
  description: string;
  quantity: string;
  unitValue: string;
}

interface QuoteTemplate {
  id: string;
  title: string;
  description: string;
  quoteTitle: string;
  quoteDescription: string;
  validityDays: string;
  paymentTerms: string;
  notes: string;
  items: QuoteEditItemDraft[];
  icon: IconDefinition;
}

const defaultTemplateId = 'instalacao-split';

const defaultInstallationItems: QuoteEditItemDraft[] = [
  { description: 'Equipamento split (especificar modelo)', quantity: '1', unitValue: '0,00' },
  { description: 'Tubulação de cobre 1/4" + 3/8"', quantity: '1', unitValue: '0,00' },
  { description: 'Cabo PP 4mm² para alimentação', quantity: '1', unitValue: '0,00' },
  { description: 'Suporte para condensadora', quantity: '1', unitValue: '0,00' },
];

const quoteTemplates: QuoteTemplate[] = [
  {
    id: defaultTemplateId,
    title: 'Instalação split',
    description: 'Equipamento, tubulação, cabo, suporte, isolamento e mão de obra.',
    quoteTitle: 'Instalação de ar-condicionado split',
    quoteDescription: 'Descreva o serviço de instalação, materiais previstos e testes finais.',
    validityDays: '',
    paymentTerms: '',
    notes: '',
    items: defaultInstallationItems,
    icon: faSnowflake,
  },
  {
    id: 'manutencao-corretiva',
    title: 'Manutenção corretiva',
    description: 'Peças, diagnóstico, mão de obra e observações de reparo.',
    quoteTitle: 'Manutenção corretiva',
    quoteDescription: 'Diagnóstico técnico, reparo corretivo, peças necessárias e mão de obra.',
    validityDays: '',
    paymentTerms: '',
    notes: '',
    items: [
      { description: 'Diagnóstico técnico', quantity: '1', unitValue: '0,00' },
      { description: 'Mão de obra corretiva', quantity: '1', unitValue: '0,00' },
      { description: 'Peças de reposição', quantity: '1', unitValue: '0,00' },
    ],
    icon: faTriangleExclamation,
  },
  {
    id: 'preventiva',
    title: 'Preventiva',
    description: 'Limpeza, inspeção, consumíveis e próxima manutenção sugerida.',
    quoteTitle: 'Manutenção preventiva',
    quoteDescription: 'Descreva a preventiva, itens inspecionados e resultado esperado.',
    validityDays: '',
    paymentTerms: '',
    notes: '',
    items: [
      { description: 'Limpeza preventiva', quantity: '1', unitValue: '0,00' },
      { description: 'Inspeção operacional', quantity: '1', unitValue: '0,00' },
      { description: 'Consumíveis', quantity: '1', unitValue: '0,00' },
    ],
    icon: faCalendarCheck,
  },
  {
    id: 'pecas-mao-obra',
    title: 'Peças e mão de obra',
    description: 'Modelo simples para troca avulsa ou complemento de serviço.',
    quoteTitle: 'Peças e mão de obra',
    quoteDescription: 'Descreva as peças, materiais e mão de obra técnica.',
    validityDays: '',
    paymentTerms: '',
    notes: '',
    items: [
      { description: 'Peça ou material', quantity: '1', unitValue: '0,00' },
      { description: 'Mão de obra', quantity: '1', unitValue: '0,00' },
    ],
    icon: faBoxesStacked,
  },
  {
    id: 'personalizado',
    title: 'Personalizado',
    description: 'Começa limpo quando nenhum modelo fizer sentido.',
    quoteTitle: '',
    quoteDescription: '',
    validityDays: '',
    paymentTerms: '',
    notes: '',
    items: [],
    icon: faPen,
  },
];

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

function QuoteEditor({
  draft,
  itemDraft,
  quote,
  errorMessage,
  onAddItem,
  onCancel,
  onChangeDraft,
  onChangeItemDraft,
  onSave,
}: {
  draft: QuoteEditDraft;
  itemDraft: QuoteEditItemDraft;
  quote: ServicesQuoteListItemViewModel;
  errorMessage: string | null;
  onAddItem: () => void;
  onCancel: () => void;
  onChangeDraft: (draft: QuoteEditDraft) => void;
  onChangeItemDraft: (draft: QuoteEditItemDraft) => void;
  onSave: () => void;
}) {
  const subtotal = getEditingSubtotal(draft);
  const discount = getEditingDiscount(draft);
  const total = getEditingTotal(draft);

  function applyTemplate(template: QuoteTemplate) {
    onChangeDraft({
      ...draft,
      templateId: template.id,
      title: template.quoteTitle || draft.title,
      description: template.quoteDescription,
      discount: '',
      validityDays: template.validityDays,
      paymentTerms: template.paymentTerms,
      notes: template.notes,
      items: cloneQuoteItems(template.items),
    });
  }

  function updateItem(index: number, patch: Partial<QuoteEditItemDraft>) {
    const nextPatch = sanitizeQuoteItemPatch(patch);

    onChangeDraft({
      ...draft,
      items: draft.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...nextPatch } : item,
      ),
    });
  }

  function removeItem(index: number) {
    onChangeDraft({
      ...draft,
      items: draft.items.filter((_, itemIndex) => itemIndex !== index),
    });
  }

  return (
    <PageShell>
      <header className="tw-min-w-0">
        <h1
          className={`tw-m-0 tw-text-[1.8rem] tw-font-extrabold tw-leading-tight tw-tracking-[-0.02em] ${appV2Tone.text}`}
        >
          Orçamentos · Acompanhamento
        </h1>
        <p className={`tw-m-0 tw-mt-1 tw-text-[0.85rem] ${appV2Tone.mutedText}`}>
          Edição local · Controle de itens e valores
        </p>
      </header>

      <SectionCard padding="md">
        <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-4">
          <div className="tw-min-w-0">
            <h2 className={`tw-m-0 tw-text-base tw-font-bold ${appV2Tone.text}`}>{quote.number}</h2>
            <dl className={`tw-m-0 tw-mt-2 tw-grid tw-gap-1 tw-text-xs ${appV2Tone.mutedText}`}>
              <QuoteFact icon={faBuilding} label="Cliente" value={quote.customerLine} />
              <QuoteFact icon={faMicrochip} label="Equipamento" value={quote.equipmentLine} />
            </dl>
            <div className="tw-mt-2">
              <span className="tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-full tw-bg-[#FFFBEB] tw-px-3 tw-py-1 tw-text-[0.7rem] tw-font-semibold tw-text-[#D97706]">
                <FontAwesomeIcon icon={faFilePen} aria-hidden="true" />
                {statusLabelByValue[draft.status]} - {formatItemsStatus(draft.items.length)}
              </span>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="tw-grid tw-gap-6 lg:tw-grid-cols-[360px_minmax(0,1fr)]">
        <QuoteTemplatePanel activeTemplateId={draft.templateId} onApplyTemplate={applyTemplate} />

        <SectionCard labelledBy="quote-edit-title" padding="md">
          <div className="tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3 tw-border-b tw-border-[#EDF2F7] tw-pb-4">
            <div>
              <p className="tw-m-0 tw-text-xs tw-font-bold tw-uppercase tw-text-[#1E4F8A]">
                {quote.number}
              </p>
              <h2
                id="quote-edit-title"
                className={`tw-m-0 tw-mt-1 tw-text-lg tw-font-bold ${appV2Tone.text}`}
              >
                Novo orçamento
              </h2>
              <p className={`tw-m-0 tw-mt-1 tw-text-xs ${appV2Tone.mutedText}`}>
                Modelo aplicado: {getTemplateTitle(draft.templateId)} · {quote.customerLine} ·{' '}
                {quote.equipmentLine}
              </p>
            </div>
            <span className="tw-inline-flex tw-rounded-full tw-bg-[#FFFBEB] tw-px-3 tw-py-1 tw-text-xs tw-font-bold tw-text-[#D97706]">
              Rascunho local
            </span>
          </div>

          <FormStack className="tw-mt-5">
            <FormRow>
              <FieldGroup label="Título">
                <input
                  name="quote-title"
                  value={draft.title}
                  onChange={(event) => onChangeDraft({ ...draft, title: event.target.value })}
                  className={fieldInputClass}
                />
              </FieldGroup>

              <FieldGroup label="Status">
                <select
                  name="quote-status"
                  value={draft.status}
                  onChange={(event) =>
                    onChangeDraft({ ...draft, status: event.target.value as QuoteStatus })
                  }
                  className={fieldSelectClass}
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="enviado">Enviado</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="recusado">Rejeitado</option>
                </select>
              </FieldGroup>
            </FormRow>

            <FieldGroup label="Descrição do serviço">
              <textarea
                name="quote-description"
                value={draft.description}
                onChange={(event) => onChangeDraft({ ...draft, description: event.target.value })}
                className={fieldTextareaClass}
                rows={3}
              />
            </FieldGroup>
          </FormStack>

          <div className="tw-mt-5">
            <span className="tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-full tw-bg-[#EFF6FF] tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold tw-text-[#1E4F8A]">
              <FontAwesomeIcon icon={faListUl} aria-hidden="true" />
              Itens do orçamento
            </span>
          </div>

          <QuoteItemsTable
            items={draft.items}
            onChangeItem={updateItem}
            onRemoveItem={removeItem}
          />

          <FormRow columns="quoteItems" className="tw-mt-4">
            <FieldGroup label="Descrição">
              <input
                name="quote-item-description"
                placeholder="Ex: Controlador digital"
                value={itemDraft.description}
                onChange={(event) =>
                  onChangeItemDraft({ ...itemDraft, description: event.target.value })
                }
                className={fieldInputClass}
              />
            </FieldGroup>
            <FieldGroup label="Qtd.">
              <input
                name="quote-item-quantity"
                placeholder="1"
                value={itemDraft.quantity}
                onChange={(event) =>
                  onChangeItemDraft({
                    ...itemDraft,
                    quantity: sanitizePositiveIntegerInput(event.target.value),
                  })
                }
                className={fieldInputClass}
              />
            </FieldGroup>
            <FieldGroup label="Valor unit.">
              <input
                name="quote-item-unit-value"
                placeholder="R$ 0,00"
                value={itemDraft.unitValue}
                onChange={(event) =>
                  onChangeItemDraft({
                    ...itemDraft,
                    unitValue: sanitizeCurrencyInput(event.target.value),
                  })
                }
                className={fieldInputClass}
              />
            </FieldGroup>
            <button
              type="button"
              onClick={onAddItem}
              className={`tw-inline-flex tw-min-h-11 tw-items-center tw-justify-center tw-gap-1.5 tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-transparent tw-px-4 tw-text-xs tw-font-medium tw-text-[#1E4F8A] ${appV2Tone.focus}`}
            >
              <FontAwesomeIcon icon={faPlus} aria-hidden="true" />
              Adicionar
            </button>
          </FormRow>

          <div className="tw-mt-5 tw-rounded-xl tw-bg-[#F8FAFE] tw-p-4">
            <div className="tw-flex tw-justify-between tw-text-sm">
              <span className={appV2Tone.mutedText}>Subtotal</span>
              <span className="tw-font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="tw-mt-3 tw-grid tw-gap-2 sm:tw-grid-cols-[1fr_220px] sm:tw-items-center">
              <span className={`tw-text-sm ${appV2Tone.mutedText}`}>Desconto</span>
              <input
                name="quote-discount"
                value={draft.discount}
                onChange={(event) =>
                  onChangeDraft({ ...draft, discount: sanitizeCurrencyInput(event.target.value) })
                }
                className={fieldInputClass}
                placeholder="R$ 0,00"
                aria-label={`Desconto atual ${formatCurrency(discount)}`}
              />
            </div>
            <div className="tw-mt-2 tw-flex tw-justify-between tw-border-t tw-border-[#E2E8F0] tw-pt-3 tw-text-base tw-font-bold">
              <span>Total</span>
              <span className="tw-text-[#2563EB]">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="tw-mt-5">
            <span className="tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-full tw-bg-[#EFF6FF] tw-px-2.5 tw-py-1 tw-text-xs tw-font-bold tw-text-[#1E4F8A]">
              <FontAwesomeIcon icon={faFileInvoiceDollar} aria-hidden="true" />
              Condições
            </span>
          </div>
          <div className="tw-mt-3 tw-grid tw-gap-4 md:tw-grid-cols-2">
            <FieldGroup label="Validade">
              <input
                name="quote-validity-days"
                value={draft.validityDays}
                onChange={(event) =>
                  onChangeDraft({
                    ...draft,
                    validityDays: sanitizePositiveIntegerInput(event.target.value),
                  })
                }
                className={fieldInputClass}
                placeholder="7 dias"
              />
            </FieldGroup>
            <FieldGroup label="Forma de pagamento">
              <input
                name="quote-payment-terms"
                value={draft.paymentTerms}
                onChange={(event) => onChangeDraft({ ...draft, paymentTerms: event.target.value })}
                className={fieldInputClass}
                placeholder="Ex: 50% entrada, 50% na conclusão"
              />
            </FieldGroup>
            <FieldGroup label="Observacoes" className="md:tw-col-span-2">
              <textarea
                name="quote-notes"
                value={draft.notes}
                onChange={(event) => onChangeDraft({ ...draft, notes: event.target.value })}
                className={fieldTextareaClass}
                rows={3}
              />
            </FieldGroup>
          </div>

          {errorMessage ? (
            <p className="tw-m-0 tw-mt-3 tw-text-sm tw-font-semibold tw-text-[#DC2626]">
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
              className={`tw-inline-flex tw-min-h-10 tw-items-center tw-justify-center tw-gap-1.5 tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-white tw-px-4 tw-text-xs tw-font-medium tw-text-[#1E4F8A] ${appV2Tone.focus}`}
            >
              <FontAwesomeIcon icon={faFloppyDisk} aria-hidden="true" />
              Salvar rascunho
            </button>
            <button
              type="button"
              disabled
              className="tw-inline-flex tw-min-h-10 tw-cursor-not-allowed tw-items-center tw-justify-center tw-gap-1.5 tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-white tw-px-4 tw-text-xs tw-font-medium tw-text-[#8BA0BC]"
            >
              <FontAwesomeIcon icon={faDownload} aria-hidden="true" />
              Exportacao futura
            </button>
            <button
              type="button"
              disabled
              className="tw-inline-flex tw-min-h-10 tw-cursor-not-allowed tw-items-center tw-justify-center tw-gap-1.5 tw-rounded-xl tw-border-0 tw-bg-[#DBEAFE] tw-px-4 tw-text-xs tw-font-semibold tw-text-[#52677F]"
            >
              <FontAwesomeIcon icon={faPaperPlane} aria-hidden="true" />
              Envio futuro
            </button>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}

function QuoteTemplatePanel({
  activeTemplateId = defaultTemplateId,
  onApplyTemplate,
}: {
  activeTemplateId?: string;
  onApplyTemplate?: (template: QuoteTemplate) => void;
}) {
  return (
    <SectionCard padding="md">
      <div className="tw-flex tw-items-center tw-gap-2">
        <FontAwesomeIcon icon={faLayerGroup} className="tw-text-[#2563EB]" aria-hidden="true" />
        <h2 className={`tw-m-0 tw-text-base tw-font-bold ${appV2Tone.text}`}>
          Modelos de orçamento
        </h2>
      </div>
      <p className={`tw-m-0 tw-mt-2 tw-text-xs ${appV2Tone.mutedText}`}>
        O modelo preenche o rascunho inicial. O técnico pode editar título, itens, valores e
        condições.
      </p>

      <div className="tw-mt-4 tw-grid tw-gap-2">
        {quoteTemplates.map((template) => {
          const isActive = template.id === activeTemplateId;

          return (
            <button
              type="button"
              key={template.id}
              onClick={() => onApplyTemplate?.(template)}
              className={`tw-w-full tw-rounded-xl tw-border tw-p-3 tw-text-left ${
                isActive ? 'tw-border-[#2563EB] tw-bg-[#EFF6FF]' : 'tw-border-[#E2E8F0] tw-bg-white'
              } ${onApplyTemplate ? appV2Tone.focus : ''}`}
            >
              <div className="tw-flex tw-gap-3">
                <div
                  className={`tw-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl ${
                    isActive ? 'tw-bg-white tw-text-[#2563EB]' : 'tw-bg-[#F8FAFE] tw-text-[#1E4F8A]'
                  }`}
                >
                  <FontAwesomeIcon icon={template.icon} aria-hidden="true" />
                </div>
                <div className="tw-min-w-0 tw-flex-1">
                  <h3 className={`tw-m-0 tw-text-sm tw-font-bold ${appV2Tone.text}`}>
                    {template.title}
                  </h3>
                  <p className={`tw-m-0 tw-mt-1 tw-text-xs ${appV2Tone.mutedText}`}>
                    {template.description}
                  </p>
                </div>
                {isActive ? (
                  <span className="tw-h-fit tw-rounded-full tw-bg-[#F0FDF4] tw-px-2 tw-py-0.5 tw-text-xs tw-font-bold tw-text-[#16A34A]">
                    Aplicado
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function QuoteItemsTable({
  items,
  onChangeItem,
  onRemoveItem,
}: {
  items: QuoteEditItemDraft[];
  onChangeItem: (index: number, patch: Partial<QuoteEditItemDraft>) => void;
  onRemoveItem: (index: number) => void;
}) {
  if (items.length === 0) {
    return (
      <div
        className={`tw-mt-3 tw-rounded-2xl tw-border tw-border-dashed tw-border-[#CBD5E1] tw-bg-[#F8FAFE] tw-p-4 tw-text-center tw-text-xs ${appV2Tone.mutedText}`}
      >
        <FontAwesomeIcon icon={faBoxOpen} className="tw-mr-1.5" aria-hidden="true" />
        Nenhum item local adicionado.
      </div>
    );
  }

  return (
    <div className="tw-mt-3 tw-overflow-x-auto">
      <table className="tw-w-full tw-text-sm">
        <thead className="tw-border-b tw-border-[#EDF2F7] tw-text-[0.65rem] tw-font-bold tw-uppercase tw-text-[#1E4F8A]">
          <tr>
            <th className="tw-py-2 tw-text-left">Descrição</th>
            <th className="tw-py-2 tw-text-left">Qtd.</th>
            <th className="tw-py-2 tw-text-left">Valor unit.</th>
            <th className="tw-py-2 tw-text-right">Total</th>
            <th className="tw-py-2 tw-text-right">Ação</th>
          </tr>
        </thead>
        <tbody className="tw-divide-y tw-divide-[#EDF2F7]">
          {items.map((item, index) => (
            <tr key={`${item.description}-${index}`}>
              <td className="tw-min-w-[240px] tw-py-2 tw-pr-3">
                <input
                  name={`quote-item-${index}-description`}
                  value={item.description}
                  onChange={(event) => onChangeItem(index, { description: event.target.value })}
                  className={fieldInputClass}
                />
              </td>
              <td className="tw-w-28 tw-py-2 tw-pr-3">
                <input
                  name={`quote-item-${index}-quantity`}
                  value={item.quantity || '1'}
                  onChange={(event) => onChangeItem(index, { quantity: event.target.value })}
                  className={fieldInputClass}
                />
              </td>
              <td className="tw-w-40 tw-py-2 tw-pr-3">
                <input
                  name={`quote-item-${index}-unit-value`}
                  value={item.unitValue}
                  onChange={(event) => onChangeItem(index, { unitValue: event.target.value })}
                  className={fieldInputClass}
                />
              </td>
              <td className="tw-py-2 tw-text-right tw-font-semibold">
                {formatCurrency(getItemTotal(item))}
              </td>
              <td className="tw-py-2 tw-pl-3 tw-text-right">
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  className={`tw-rounded-lg tw-border tw-border-[#FECACA] tw-bg-white tw-px-3 tw-py-2 tw-text-xs tw-font-semibold tw-text-[#DC2626] ${appV2Tone.focus}`}
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuoteCard({
  quote,
  onEdit,
}: {
  quote: ServicesQuoteListItemViewModel;
  onEdit?: () => void;
}) {
  return (
    <article className="tw-rounded-2xl tw-border tw-border-[#EDF2F7] tw-bg-white tw-p-4">
      <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
        <p className="tw-m-0 tw-inline-flex tw-rounded-full tw-bg-[#EFF6FF] tw-px-2.5 tw-py-1 tw-text-[0.85rem] tw-font-bold tw-text-[#1E4F8A]">
          {quote.number}
        </p>
        <span className="tw-text-[0.9rem] tw-font-bold tw-text-[#16A34A]">
          Total: {quote.totalLabel}
        </span>
      </div>

      <h3 className={`tw-m-0 tw-mt-2 tw-text-[0.9rem] tw-font-semibold ${appV2Tone.text}`}>
        {quote.title}
      </h3>

      <dl className={`tw-m-0 tw-mt-3 tw-grid tw-gap-1 tw-text-[0.7rem] ${appV2Tone.mutedText}`}>
        <QuoteFact icon={faBuilding} label="Cliente" value={quote.customerLine} />
        <QuoteFact icon={faMicrochip} label="Equipamento" value={quote.equipmentLine} />
      </dl>
      <p className={`tw-m-0 tw-mt-3 tw-text-[0.7rem] tw-font-medium ${appV2Tone.mutedText}`}>
        {quote.statusLabel} · {quote.itemsLabel}
      </p>
      {onEdit ? (
        <div className="tw-mt-4 tw-flex">
          <button
            type="button"
            className={`tw-inline-flex tw-w-fit tw-items-center tw-gap-1.5 tw-rounded-lg tw-border tw-border-[#CBD5E1] tw-bg-transparent tw-px-3 tw-py-1.5 tw-text-[0.65rem] tw-font-semibold tw-text-[#1E4F8A] ${appV2Tone.focus}`}
            onClick={onEdit}
          >
            <FontAwesomeIcon icon={faFilePen} className="tw-text-[0.7rem]" aria-hidden="true" />
            Editar orçamento
          </button>
        </div>
      ) : null}
    </article>
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

function parseCurrencyValue(value: string): number {
  const normalized = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizePositiveIntegerInput(value: string): string {
  return value.replace(/\D/g, '');
}

function sanitizeCurrencyInput(value: string): string {
  const digitsAndComma = value.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const [integerPart = '', ...decimalParts] = digitsAndComma.split(',');
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '') || (integerPart ? '0' : '');
  const decimalPart = decimalParts.join('').slice(0, 2);

  if (!digitsAndComma.includes(',')) {
    return normalizedInteger;
  }

  return `${normalizedInteger || '0'},${decimalPart}`;
}

function sanitizeQuoteItemPatch(patch: Partial<QuoteEditItemDraft>): Partial<QuoteEditItemDraft> {
  const sanitized: Partial<QuoteEditItemDraft> = { ...patch };

  if (patch.quantity !== undefined) {
    sanitized.quantity = sanitizePositiveIntegerInput(patch.quantity);
  }

  if (patch.unitValue !== undefined) {
    sanitized.unitValue = sanitizeCurrencyInput(patch.unitValue);
  }

  return sanitized;
}

function getItemTotal(item: QuoteEditItemDraft): number {
  return parseCurrencyValue(item.quantity || '1') * parseCurrencyValue(item.unitValue);
}

function getEditingSubtotal(draft: QuoteEditDraft): number {
  if (draft.items.length > 0) {
    return draft.items.reduce((sum, item) => sum + getItemTotal(item), 0);
  }

  return parseCurrencyValue(draft.total);
}

function getEditingDiscount(draft: QuoteEditDraft): number {
  return parseCurrencyValue(draft.discount);
}

function getEditingTotal(draft: QuoteEditDraft): number {
  return Math.max(0, getEditingSubtotal(draft) - getEditingDiscount(draft));
}

function cloneQuoteItems(items: QuoteEditItemDraft[]): QuoteEditItemDraft[] {
  return items.map((item) => ({ ...item }));
}

function getTemplateTitle(templateId: string | undefined): string {
  return quoteTemplates.find((template) => template.id === templateId)?.title ?? 'Personalizado';
}

function formatCurrency(value: number): string {
  return value
    .toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    .replace(/\u00a0/g, ' ');
}

function formatNumberInput(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function formatItemsStatus(count: number): string {
  if (count === 0) {
    return 'Sem itens locais';
  }

  return `${count} ${count === 1 ? 'item local' : 'itens locais'}`;
}

const statusLabelByValue: Record<QuoteStatus, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviado',
  aguardando_assinatura: 'Aguardando assinatura',
  aprovado: 'Aprovado',
  recusado: 'Rejeitado',
  expirado: 'Expirado',
};

function QuoteFact({ icon, label, value }: { icon: IconDefinition; label: string; value: string }) {
  return (
    <div className="tw-flex tw-items-start tw-gap-2">
      <dt className="tw-min-w-[112px] tw-font-semibold tw-uppercase tw-text-[#52677F]">
        <FontAwesomeIcon icon={icon} className="tw-mr-1.5 tw-w-4 tw-text-[#8BA0BC]" />
        {label}:
      </dt>
      <dd className={`tw-m-0 tw-font-medium ${appV2Tone.mutedText}`}>{value}</dd>
    </div>
  );
}
