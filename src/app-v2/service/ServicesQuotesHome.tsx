import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen,
  faBuilding,
  faEdit,
  faFilePen,
  faFloppyDisk,
  faMicrochip,
  faPenNib,
  faPenRuler,
  faPlus,
  faStore,
} from '@fortawesome/free-solid-svg-icons';

import type { QuoteStatus } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import {
  FieldGroup,
  FormRow,
  FormStack,
  fieldInputClass,
  fieldSelectClass,
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
  title: string;
  total: string;
  status: QuoteStatus;
  items: QuoteEditItemDraft[];
}

export interface QuoteEditItemDraft {
  description: string;
  quantity: string;
  unitValue: string;
}

export function ServicesQuotesHome({
  activeView,
  input,
  onSelectView,
  onSaveQuote,
}: ServicesQuotesHomeProps) {
  const viewModel = buildServicesQuotesViewModel(input);
  const [editingQuote, setEditingQuote] = useState<QuoteEditDraft | null>(null);
  const [editingSummary, setEditingSummary] = useState<ServicesQuoteListItemViewModel | null>(null);
  const [itemDraft, setItemDraft] = useState<QuoteEditItemDraft>({
    description: '',
    quantity: '1',
    unitValue: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function startEditingQuote(quote: ServicesQuoteListItemViewModel) {
    setErrorMessage(null);
    setItemDraft({ description: '', quantity: '1', unitValue: '' });
    setEditingSummary(quote);
    setEditingQuote({
      id: quote.id,
      title: quote.title,
      total: quote.totalLabel.replace('R$', '').trim(),
      status: quote.status,
      items: quote.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitValue: item.unitValue,
      })),
    });
  }

  function addEditingItem() {
    const description = itemDraft.description.trim();

    if (!description) {
      setErrorMessage('Informe a descrição do item do orçamento.');
      return;
    }

    setEditingQuote((current) =>
      current
        ? {
            ...current,
            items: [...current.items, { ...itemDraft, description }],
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

    const nextTotal = getEditingTotal(editingQuote);
    const error =
      onSaveQuote?.({
        ...editingQuote,
        total: formatNumberInput(nextTotal),
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
        approvedCount={viewModel.kpis.find((kpi) => kpi.label === 'Aprovados')?.value ?? 0}
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

      <header className="tw-min-w-0">
        <SectionEyebrow>{viewModel.subtitle}</SectionEyebrow>
        <h1
          className={`tw-m-0 tw-mt-3 tw-text-[1.8rem] tw-font-bold tw-leading-tight tw-tracking-[-0.01em] ${appV2Tone.text}`}
        >
          {viewModel.title}
        </h1>
        <p className={`tw-m-0 tw-mt-1.5 tw-text-[0.85rem] tw-font-normal ${appV2Tone.mutedText}`}>
          {viewModel.description}
        </p>
      </header>

      <SectionCard>
        <div className="tw-flex tw-flex-wrap tw-gap-4">
          {viewModel.kpis.map((kpi) => (
            <KpiCard key={kpi.label} label={kpi.label} value={kpi.valueLabel ?? kpi.value} />
          ))}
        </div>
      </SectionCard>

      <SectionCard className="sm:tw-p-5" labelledBy="quotes-title" padding="sm">
        <h2
          id="quotes-title"
          className={`tw-m-0 tw-text-[0.8rem] tw-font-semibold tw-uppercase ${appV2Tone.text}`}
        >
          Orçamentos · Acompanhamento
        </h2>

        {viewModel.items.length > 0 ? (
          <div className="tw-mt-4 tw-grid tw-gap-4">
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
    </PageShell>
  );
}

function QuoteEditor({
  draft,
  itemDraft,
  quote,
  approvedCount,
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
  approvedCount: number;
  errorMessage: string | null;
  onAddItem: () => void;
  onCancel: () => void;
  onChangeDraft: (draft: QuoteEditDraft) => void;
  onChangeItemDraft: (draft: QuoteEditItemDraft) => void;
  onSave: () => void;
}) {
  const total = getEditingTotal(draft);

  return (
    <PageShell>
      <header className="tw-min-w-0">
        <h1
          className={`tw-m-0 tw-text-[1.8rem] tw-font-bold tw-leading-tight tw-tracking-[-0.01em] ${appV2Tone.text}`}
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
              <QuoteFact icon={faStore} label="Cliente" value={quote.customerLine} />
              <QuoteFact icon={faMicrochip} label="Equipamento" value={quote.equipmentLine} />
            </dl>
            <div className="tw-mt-2">
              <span className="tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-full tw-bg-[#FFFBEB] tw-px-3 tw-py-1 tw-text-[0.7rem] tw-font-semibold tw-text-[#D97706]">
                <FontAwesomeIcon icon={faPenRuler} aria-hidden="true" />
                {statusLabelByValue[draft.status]} - {formatItemsStatus(draft.items.length)}
              </span>
            </div>
          </div>
          <span className="tw-inline-flex tw-items-center tw-gap-1.5 tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-transparent tw-px-3.5 tw-py-2 tw-text-[0.7rem] tw-font-medium tw-text-[#1E4F8A]">
            <FontAwesomeIcon icon={faEdit} aria-hidden="true" />
            Editar orçamento
          </span>
        </div>
      </SectionCard>

      <SectionCard labelledBy="quote-edit-title" padding="md">
        <h2
          id="quote-edit-title"
          className={`tw-m-0 tw-flex tw-items-center tw-gap-2 tw-text-sm tw-font-bold ${appV2Tone.text}`}
        >
          <FontAwesomeIcon icon={faPenNib} className="tw-text-[#2563EB]" aria-hidden="true" />
          Edição local · Editar orçamento
        </h2>

        <FormStack className="tw-mt-5">
          <FieldGroup label="Título">
            <input
              name="quote-title"
              value={draft.title}
              onChange={(event) => onChangeDraft({ ...draft, title: event.target.value })}
              className={fieldInputClass}
            />
          </FieldGroup>

          <FieldGroup label="Itens locais · Descrição">
            {draft.items.length === 0 ? (
              <div
                className={`tw-rounded-2xl tw-border tw-border-dashed tw-border-[#CBD5E1] tw-bg-[#F8FAFE] tw-p-4 tw-text-center tw-text-xs ${appV2Tone.mutedText}`}
              >
                <FontAwesomeIcon icon={faBoxOpen} className="tw-mr-1.5" aria-hidden="true" />
                Nenhum item local adicionado.
              </div>
            ) : (
              <ul className="tw-m-0 tw-mt-2 tw-grid tw-list-none tw-gap-2 tw-p-0">
                {draft.items.map((item, index) => (
                  <li
                    key={`${item.description}-${index}`}
                    className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-rounded-xl tw-bg-[#F8FAFE] tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-[#334155]"
                  >
                    <span className="tw-min-w-0 tw-break-words">{item.description}</span>
                    <span className="tw-shrink-0">{formatCurrency(getItemTotal(item))}</span>
                  </li>
                ))}
              </ul>
            )}
          </FieldGroup>

          <FormRow columns="quoteItems">
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
                  onChangeItemDraft({ ...itemDraft, quantity: event.target.value })
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
                  onChangeItemDraft({ ...itemDraft, unitValue: event.target.value })
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
        </FormStack>

        <div className="tw-mt-5 tw-grid tw-gap-4 tw-border-t tw-border-[#EDF2F7] tw-pt-5 sm:tw-grid-cols-2 xl:tw-grid-cols-4">
          <InfoBlock label="Aprovados" value={approvedCount} />
          <InfoBlock label="Total" value={formatCurrency(total)} />
          <div className="tw-rounded-2xl tw-bg-[#F8FAFE] tw-p-3">
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
          </div>
          <InfoBlock label="Qtd. itens" value={draft.items.length} />
        </div>

        {errorMessage ? (
          <p className="tw-m-0 tw-mt-3 tw-text-sm tw-font-semibold tw-text-[#DC2626]">
            {errorMessage}
          </p>
        ) : null}

        <div className="tw-mt-6 tw-flex tw-justify-end tw-gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`tw-inline-flex tw-min-h-10 tw-items-center tw-justify-center tw-rounded-xl tw-border tw-border-[#CBD5E1] tw-bg-transparent tw-px-4 tw-text-xs tw-font-medium tw-text-[#52677F] ${appV2Tone.focus}`}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className={`tw-inline-flex tw-min-h-10 tw-items-center tw-justify-center tw-gap-1.5 tw-rounded-xl tw-border-0 tw-bg-[#2563EB] tw-px-5 tw-text-xs tw-font-semibold tw-text-white ${appV2Tone.focus}`}
          >
            <FontAwesomeIcon icon={faFloppyDisk} aria-hidden="true" />
            Salvar orçamento
          </button>
        </div>
      </SectionCard>
    </PageShell>
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
    <div className="tw-min-w-[120px] tw-flex-1 tw-rounded-2xl tw-bg-[#F8FAFE] tw-p-3 tw-text-center">
      <p
        className={`tw-m-0 tw-font-extrabold tw-leading-tight ${
          typeof value === 'string' && value.startsWith('R$')
            ? 'tw-text-[1.4rem]'
            : 'tw-text-[1.8rem]'
        } ${appV2Tone.text}`}
      >
        {value}
      </p>
      <p
        className={`tw-m-0 tw-mt-1 tw-text-[0.7rem] tw-font-medium tw-uppercase ${appV2Tone.mutedText}`}
      >
        {label}
      </p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="tw-rounded-2xl tw-bg-[#F8FAFE] tw-p-3">
      <div className="tw-text-[0.65rem] tw-font-semibold tw-uppercase tw-text-[#1E4F8A]">
        {label}
      </div>
      <div className={`tw-mt-1 tw-text-xl tw-font-bold ${appV2Tone.text}`}>{value}</div>
    </div>
  );
}

function parseCurrencyValue(value: string): number {
  const normalized = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getItemTotal(item: QuoteEditItemDraft): number {
  return parseCurrencyValue(item.quantity) * parseCurrencyValue(item.unitValue);
}

function getEditingTotal(draft: QuoteEditDraft): number {
  if (draft.items.length > 0) {
    return draft.items.reduce((sum, item) => sum + getItemTotal(item), 0);
  }

  return parseCurrencyValue(draft.total);
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

function QuoteFact({
  icon,
  label,
  value,
}: {
  icon: typeof faBuilding;
  label: string;
  value: string;
}) {
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
