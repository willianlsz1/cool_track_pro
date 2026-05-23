import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faDownload,
  faFileInvoiceDollar,
  faFilePen,
  faFloppyDisk,
  faListUl,
  faMicrochip,
  faPaperPlane,
  faPlus,
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
import { PageShell, SectionCard } from '../ui/primitives';
import { QuoteFact } from './QuoteFact';
import { QuoteItemsTable } from './QuoteItemsTable';
import { QuoteTemplatePanel } from './QuoteTemplatePanel';
import type { QuoteEditDraft, QuoteEditItemDraft } from './quoteDraftTypes';
import {
  cloneQuoteItems,
  formatCurrency,
  formatItemsStatus,
  getEditingDiscount,
  getEditingSubtotal,
  getEditingTotal,
  getTemplateTitle,
  sanitizeCurrencyInput,
  sanitizePositiveIntegerInput,
  sanitizeQuoteItemPatch,
} from './quoteDraftUtils';
import type { QuoteTemplate } from './quoteTemplates';
import type { ServicesQuoteListItemViewModel } from './servicesQuotesViewModel';

const statusLabelByValue: Record<QuoteStatus, string> = {
  rascunho: 'Rascunho',
  enviado: 'Enviado',
  aprovado: 'Aprovado',
  recusado: 'Rejeitado',
  expirado: 'Expirado',
};

export function QuoteEditor({
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
            <FieldGroup label="Observações" className="md:tw-col-span-2">
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
              Exportação futura
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
