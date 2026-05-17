import type { QuoteEditDraft, QuoteEditItemDraft } from './quoteDraftTypes';
import { quoteTemplates } from './quoteTemplates';

export function parseCurrencyValue(value: string): number {
  const normalized = value
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sanitizePositiveIntegerInput(value: string): string {
  return value.replace(/\D/g, '');
}

export function sanitizeCurrencyInput(value: string): string {
  const digitsAndComma = value.replace(/\./g, ',').replace(/[^\d,]/g, '');
  const [integerPart = '', ...decimalParts] = digitsAndComma.split(',');
  const normalizedInteger = integerPart.replace(/^0+(?=\d)/, '') || (integerPart ? '0' : '');
  const decimalPart = decimalParts.join('').slice(0, 2);

  if (!digitsAndComma.includes(',')) {
    return normalizedInteger;
  }

  return `${normalizedInteger || '0'},${decimalPart}`;
}

export function sanitizeQuoteItemPatch(
  patch: Partial<QuoteEditItemDraft>,
): Partial<QuoteEditItemDraft> {
  const sanitized: Partial<QuoteEditItemDraft> = { ...patch };

  if (patch.quantity !== undefined) {
    sanitized.quantity = sanitizePositiveIntegerInput(patch.quantity);
  }

  if (patch.unitValue !== undefined) {
    sanitized.unitValue = sanitizeCurrencyInput(patch.unitValue);
  }

  return sanitized;
}

export function getItemTotal(item: QuoteEditItemDraft): number {
  return parseCurrencyValue(item.quantity || '1') * parseCurrencyValue(item.unitValue);
}

export function getEditingSubtotal(draft: QuoteEditDraft): number {
  if (draft.items.length > 0) {
    return draft.items.reduce((sum, item) => sum + getItemTotal(item), 0);
  }

  return parseCurrencyValue(draft.total);
}

export function getEditingDiscount(draft: QuoteEditDraft): number {
  return parseCurrencyValue(draft.discount);
}

export function getEditingTotal(draft: QuoteEditDraft): number {
  return Math.max(0, getEditingSubtotal(draft) - getEditingDiscount(draft));
}

export function cloneQuoteItems(items: QuoteEditItemDraft[]): QuoteEditItemDraft[] {
  return items.map((item) => ({ ...item }));
}

export function getTemplateTitle(templateId: string | undefined): string {
  return quoteTemplates.find((template) => template.id === templateId)?.title ?? 'Personalizado';
}

export function formatCurrency(value: number): string {
  return value
    .toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
    .replace(/\u00a0/g, ' ');
}

export function formatNumberInput(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export function formatItemsStatus(count: number): string {
  if (count === 0) {
    return 'Sem itens locais';
  }

  return `${count} ${count === 1 ? 'item local' : 'itens locais'}`;
}
