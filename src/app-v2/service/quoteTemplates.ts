import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBoxesStacked,
  faCalendarCheck,
  faPen,
  faSnowflake,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

import type { QuoteEditItemDraft } from './quoteDraftTypes';

export interface QuoteTemplate {
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

export const defaultTemplateId = 'instalacao-split';

const defaultInstallationItems: QuoteEditItemDraft[] = [
  { description: 'Equipamento split (especificar modelo)', quantity: '1', unitValue: '0,00' },
  { description: 'Tubulação de cobre 1/4" + 3/8"', quantity: '1', unitValue: '0,00' },
  { description: 'Cabo PP 4mm² para alimentação', quantity: '1', unitValue: '0,00' },
  { description: 'Suporte para condensadora', quantity: '1', unitValue: '0,00' },
];

export const quoteTemplates: QuoteTemplate[] = [
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
