import { useState } from 'react';

import type { QuoteStatus } from '../domain/types';
import { appV2Tone } from '../styles/tokens';
import { ActionButton, PageShell, SectionCard, StatusBadge } from '../ui/primitives';
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
      setErrorMessage('Informe a descricao do item do orcamento.');
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
                Edicao local
              </p>
              <h2
                id="quote-edit-title"
                className={`tw-m-0 tw-mt-1 tw-text-lg tw-font-semibold ${appV2Tone.text}`}
              >
                Editar orcamento
              </h2>
            </div>
            <ActionButton variant="secondary" onClick={() => setEditingQuote(null)}>
              Cancelar
            </ActionButton>
          </div>

          <div className="tw-mt-4 tw-grid tw-gap-3 md:tw-grid-cols-[minmax(0,1fr)_160px_190px]">
            <label className="tw-block">
              <span className="tw-text-sm tw-font-semibold tw-text-[#334155]">Titulo</span>
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
                <span className="tw-text-sm tw-font-semibold tw-text-[#334155]">Descricao</span>
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
            <ActionButton onClick={saveEditingQuote}>Salvar orcamento</ActionButton>
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
      <p className={`tw-m-0 tw-mt-3 tw-text-sm tw-font-semibold ${appV2Tone.mutedText}`}>
        {quote.itemsLabel}
      </p>
      {onEdit ? (
        <div className="tw-mt-4 tw-flex tw-justify-end">
          <ActionButton variant="secondary" onClick={onEdit}>
            Editar orcamento
          </ActionButton>
        </div>
      ) : null}
    </article>
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
