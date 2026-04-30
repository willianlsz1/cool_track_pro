export const CLIENTES_PUBLIC_IDS = Object.freeze({
  view: 'view-clientes',
  root: 'clientes-root',
  searchInput: 'cli-search-input',
  statusFilter: 'cli-status-filter',
  cityFilter: 'cli-city-filter',
  sort: 'cli-sort',
  pageSize: 'cli-page-size',
});

export const CLIENTES_ACTIONS = Object.freeze({
  openModal: 'open-cliente-modal',
  editLegacy: 'edit-cliente',
  deleteLegacy: 'delete-cliente',
  cardMenuLegacy: 'cliente-card-menu',
  gotoPage: 'goto-page',
  prevPage: 'prev-page',
  nextPage: 'next-page',
  clearFilters: 'clear-filters',
  toggleSummary: 'toggle-summary',
  filterPending: 'filter-pending',
  edit: 'edit',
  alert: 'alert',
  delete: 'delete',
  cardMenu: 'card-menu',
  verEquipamentos: 'ver-equipamentos',
  verServicos: 'ver-servi\u00e7os',
  pmocFocus: 'pmoc-focus',
  openPmocPanel: 'open-pmoc-panel',
});

export const CLIENTES_DEFAULT_FILTERS = Object.freeze({
  searchTerm: '',
  statusFilter: 'todos',
  cityFilter: 'todas',
  sortBy: 'mais_ativos',
  currentPage: 1,
  pageSize: 6,
});

export const CLIENTES_STATUS_OPTIONS = Object.freeze([
  Object.freeze({ id: 'todos', label: 'Todos' }),
  Object.freeze({ id: 'ativo', label: 'Ativos' }),
  Object.freeze({ id: 'sem_manutencao', label: 'Sem manuten\u00e7\u00e3o' }),
  Object.freeze({ id: 'precisa_atencao', label: 'Precisa aten\u00e7\u00e3o' }),
]);

export const CLIENTES_SORT_OPTIONS = Object.freeze([
  Object.freeze({ id: 'mais_ativos', label: 'Mais ativos' }),
  Object.freeze({ id: 'recente', label: 'Manuten\u00e7\u00e3o recente' }),
  Object.freeze({ id: 'antigo', label: 'Manuten\u00e7\u00e3o antiga' }),
  Object.freeze({ id: 'nome', label: 'Nome (A-Z)' }),
  Object.freeze({ id: 'equips', label: 'Mais equipamentos' }),
]);

export const CLIENTES_PAGE_SIZE_OPTIONS = Object.freeze([6, 12, 24]);
