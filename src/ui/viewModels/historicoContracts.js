export const HISTORICO_PUBLIC_IDS = Object.freeze({
  view: 'view-historico',
  stickyHeader: 'hist-sticky-header',
  count: 'hist-count',
  searchInput: 'hist-busca',
  filtersTrigger: 'hist-filters-trigger',
  filtersCount: 'hist-filters-count',
  setorSelect: 'hist-setor',
  equipSelect: 'hist-equip',
  quickfiltersSlot: 'hist-quickfilters-slot',
  activeChipsSlot: 'hist-active-chips-slot',
  chronoLabel: 'hist-chrono-label',
  timeline: 'timeline',
  summaryContent: 'hist-summary-content',
});

export const HISTORICO_ACTIONS = Object.freeze({
  openFiltersSheet: 'open-filters-sheet',
  filterPeriod: 'hist-filter-period',
  filterTipo: 'hist-filter-tipo',
  clearPeriod: 'hist-clear-period',
  clearTipo: 'hist-clear-tipo',
  clearSetor: 'hist-clear-setor',
  clearEquip: 'hist-clear-equip',
  clearBusca: 'hist-clear-busca',
  clearClienteFilter: 'clear-cliente-filter',
  clearAll: 'hist-clear-all',
  filterEquip: 'hist-filter-equip',
  openPhoto: 'hist-open-photo',
  viewSignature: 'hist-view-signature',
  toggleCardMenu: 'toggle-card-menu',
  toggleSummary: 'toggle-summary',
  pricingLink: 'hist-pricing-link',
  editReg: 'edit-reg',
  deleteReg: 'delete-reg',
});

export const HISTORICO_NAV_TARGETS = Object.freeze({
  registro: 'registro',
  relatorio: 'relatorio',
  equipamentos: 'equipamentos',
});

export const HISTORICO_DATA_ATTRIBUTES = Object.freeze([
  'data-hist-action',
  'data-action',
  'data-nav',
  'data-id',
  'data-reg-id',
  'data-equip-id',
  'data-photo-url',
  'data-period',
  'data-tipo-id',
]);

export const HISTORICO_PUBLIC_CLASSES = Object.freeze([
  'servicos-toggle',
  'hist-sticky-header',
  'hist-title',
  'hist-count',
  'hist-search-row',
  'hist-input',
  'hist-filters-trigger',
  'hist-select',
  'hist-quickfilters',
  'hist-quickfilter',
  'hist-active-chips',
  'hist-active-chip',
  'hist-chrono-label',
  'hist-op-summary',
  'hist-attention',
  'hist-day-group',
  'timeline',
  'timeline__item',
  'timeline__item--latest',
  'timeline__dot',
  'timeline__item__service',
  'timeline__item__equipment',
  'timeline__item__photos',
  'hist-signature-preview',
  'hist-item-actions',
  'empty-state',
]);

export const HISTORICO_PERIOD_OPTIONS = Object.freeze([
  Object.freeze({ id: 'hoje', label: 'Hoje', days: 0 }),
  Object.freeze({ id: '7d', label: '7 dias', days: 7 }),
  Object.freeze({ id: '30d', label: '30 dias', days: 30 }),
  Object.freeze({ id: 'tudo', label: 'Tudo', days: null }),
]);

export const HISTORICO_TIPO_OPTIONS = Object.freeze([
  Object.freeze({ id: 'preventiva', label: 'Preventiva', match: ['preventiva'], color: 'cyan' }),
  Object.freeze({ id: 'corretiva', label: 'Corretiva', match: ['corretiva'], color: 'amber' }),
  Object.freeze({ id: 'limpeza', label: 'Limpeza', match: ['limpeza'], color: 'teal' }),
  Object.freeze({
    id: 'recarga',
    label: 'Recarga',
    match: ['recarga', 'gás', 'gas'],
    color: 'violet',
  }),
  Object.freeze({
    id: 'inspecao',
    label: 'Inspeção',
    match: ['inspeção', 'inspecao', 'verificação', 'verificacao'],
    color: 'teal',
  }),
]);
