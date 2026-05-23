import type { QuoteStatus } from '../domain/types';

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
