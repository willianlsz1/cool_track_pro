import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faEdit, faMicrochip } from '@fortawesome/free-solid-svg-icons';

import type { QuoteStatus } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard } from '../ui/primitives';
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
  const [itemDraft, setItemDraft] = useState<QuoteEditItemDraft>({
    description: '',
    quantity: '1',
    unitValue: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function startEditingQuote(quote: ServicesQuoteListItemViewModel) {
    setErrorMessage(null);
    setItemDraft({ description: '', quantity: '1', unitValue: '' });
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

  function saveEditingQuote() {
    if (!editingQuote) {
      return;
    }

    const error = onSaveQuote?.(editingQuote) ?? null;

    if (error) {
      setErrorMessage(error);
      return;
    }

    setErrorMessage(null);
    setEditingQuote(null);
  }

  return (
    <PageShell>
      <ServicesSubViewNav activeView={activeView} onSelectView={onSelectView} />

      <header className="tw-min-w-0">
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-inline-flex tw-rounded-full tw-bg-[#EFF6FF] tw-px-3 tw-py-1 tw-text-[0.7rem] tw-font-bold tw-uppercase tw-tracking-[0.04em] tw-text-[#1E4F8A]">
            {viewModel.subtitle}
          </p>
          <h1
            className={`tw-m-0 tw-mt-3 tw-text-[1.8rem] tw-font-bold tw-leading-tight tw-tracking-[-0.01em] ${appV2Tone.text}`}
          >
            {viewModel.title}
          </h1>
          <p className={`tw-m-0 tw-mt-1.5 tw-text-[0.85rem] tw-font-normal ${appV2Tone.mutedText}`}>
            {viewModel.description}
          </p>
        </div>
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

      {editingQuote ? (
        <SectionCard labelledBy="quote-edit-title">
          <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
            <div>
              <p
                className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
              >
                Edição local
              </p>
              <h2
                id="quote-edit-title"
                className={`tw-m-0 tw-mt-1 tw-text-lg tw-font-semibold ${appV2Tone.text}`}
              >
                Editar orçamento
              </h2>
            </div>
            <ActionButton variant="secondary" onClick={() => setEditingQuote(null)}>
              Cancelar
            </ActionButton>
          </div>

          <div className="tw-mt-4 tw-grid tw-gap-3 md:tw-grid-cols-[minmax(0,1fr)_160px_190px]">
            <label className="tw-block">
              <span className="tw-text-sm tw-font-semibold tw-text-[#334155]">Título</span>
              <input
                name="quote-title"
                value={editingQuote.title}
                onChange={(event) =>
                  setEditingQuote((current) =>
                    current ? { ...current, title: event.target.value } : current,
                  )
                }
                className={`tw-mt-2 tw-min-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
              />
            </label>
            <label className="tw-block">
              <span className="tw-text-sm tw-font-semibold tw-text-[#334155]">Total</span>
              <input
                name="quote-total"
                value={editingQuote.total}
                onChange={(event) =>
                  setEditingQuote((current) =>
                    current ? { ...current, total: event.target.value } : current,
                  )
                }
                className={`tw-mt-2 tw-min-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
              />
            </label>
            <label className="tw-block">
              <span className="tw-text-sm tw-font-semibold tw-text-[#334155]">Status</span>
              <select
                name="quote-status"
                value={editingQuote.status}
                onChange={(event) =>
                  setEditingQuote((current) =>
                    current ? { ...current, status: event.target.value as QuoteStatus } : current,
                  )
                }
                className={`tw-mt-2 tw-min-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
              >
                <option value="rascunho">Rascunho</option>
                <option value="enviado">Enviado</option>
              </select>
            </label>
          </div>

          <div className="tw-mt-5 tw-rounded-xl tw-border tw-border-dashed tw-border-[#CBD5E1] tw-bg-[#F8FAFC] tw-p-3">
            <p
              className={`tw-m-0 tw-text-[0.68rem] tw-font-bold tw-uppercase tw-tracking-[0.14em] ${appV2Tone.subtleText}`}
            >
              Itens locais
            </p>
            <div className="tw-mt-3 tw-grid tw-gap-3 md:tw-grid-cols-[minmax(0,1fr)_120px_160px_auto] md:tw-items-end">
              <label className="tw-block">
                <span className="tw-text-sm tw-font-semibold tw-text-[#334155]">Descrição</span>
                <input
                  name="quote-item-description"
                  value={itemDraft.description}
                  onChange={(event) =>
                    setItemDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className={`tw-mt-2 tw-min-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
                />
              </label>
              <label className="tw-block">
                <span className="tw-text-sm tw-font-semibold tw-text-[#334155]">Qtd.</span>
                <input
                  name="quote-item-quantity"
                  value={itemDraft.quantity}
                  onChange={(event) =>
                    setItemDraft((current) => ({
                      ...current,
                      quantity: event.target.value,
                    }))
                  }
                  className={`tw-mt-2 tw-min-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
                />
              </label>
              <label className="tw-block">
                <span className="tw-text-sm tw-font-semibold tw-text-[#334155]">Valor unit.</span>
                <input
                  name="quote-item-unit-value"
                  value={itemDraft.unitValue}
                  onChange={(event) =>
                    setItemDraft((current) => ({
                      ...current,
                      unitValue: event.target.value,
                    }))
                  }
                  className={`tw-mt-2 tw-min-h-11 tw-w-full tw-rounded-xl tw-border tw-bg-white tw-px-3 tw-text-sm tw-font-semibold ${appV2Tone.border} ${appV2Tone.text} ${appV2Tone.focus}`}
                />
              </label>
              <ActionButton variant="secondary" onClick={addEditingItem}>
                Adicionar item
              </ActionButton>
            </div>

            {editingQuote.items.length > 0 ? (
              <ul className="tw-m-0 tw-mt-3 tw-grid tw-list-none tw-gap-2 tw-p-0">
                {editingQuote.items.map((item, index) => (
                  <li
                    key={`${item.description}-${index}`}
                    className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-rounded-lg tw-bg-white tw-px-3 tw-py-2 tw-text-sm tw-font-semibold tw-text-[#334155]"
                  >
                    <span>{item.description}</span>
                    <span>{formatCurrency(parseCurrencyValue(item.unitValue))}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-medium ${appV2Tone.mutedText}`}>
                Nenhum item local adicionado.
              </p>
            )}
          </div>

          {errorMessage ? (
            <p className="tw-m-0 tw-mt-3 tw-text-sm tw-font-semibold tw-text-[#DC2626]">
              {errorMessage}
            </p>
          ) : null}

          <div className="tw-mt-4 tw-flex tw-justify-end">
            <ActionButton onClick={saveEditingQuote}>Salvar orçamento</ActionButton>
          </div>
        </SectionCard>
      ) : null}
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
        <div className="tw-min-w-0">
          <p className="tw-m-0 tw-inline-flex tw-rounded-full tw-bg-[#EFF6FF] tw-px-2.5 tw-py-1 tw-text-[0.85rem] tw-font-bold tw-text-[#1E4F8A]">
            {quote.number}
          </p>
        </div>
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
            <FontAwesomeIcon icon={faEdit} className="tw-text-[0.7rem]" />
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

function parseCurrencyValue(value: string): number {
  const normalized = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number): string {
  return value
    .toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    .replace(/\u00a0/g, ' ');
}

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
