import { buildClienteIndex, filterAndSortClientes } from '../views/clientes/dataModel.js';
import {
  CLIENTES_DEFAULT_FILTERS,
  CLIENTES_PAGE_SIZE_OPTIONS,
  CLIENTES_SORT_OPTIONS,
  CLIENTES_STATUS_OPTIONS,
} from './clientesContracts.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safePositiveInteger(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  const integer = Math.floor(number);
  return integer > 0 ? integer : fallback;
}

function optionIds(options) {
  return new Set(options.map((option) => option.id));
}

const STATUS_IDS = optionIds(CLIENTES_STATUS_OPTIONS);
const SORT_IDS = optionIds(CLIENTES_SORT_OPTIONS);
const PAGE_SIZES = new Set(CLIENTES_PAGE_SIZE_OPTIONS);

export function normalizeClientesFilters(filters = {}) {
  const searchTerm = safeString(filters.searchTerm).trim();
  const statusFilter = safeString(filters.statusFilter, CLIENTES_DEFAULT_FILTERS.statusFilter);
  const cityFilter = safeString(filters.cityFilter, CLIENTES_DEFAULT_FILTERS.cityFilter);
  const sortBy = safeString(filters.sortBy, CLIENTES_DEFAULT_FILTERS.sortBy);
  const currentPage = safePositiveInteger(
    filters.currentPage,
    CLIENTES_DEFAULT_FILTERS.currentPage,
  );
  const pageSize = safePositiveInteger(filters.pageSize, CLIENTES_DEFAULT_FILTERS.pageSize);

  return {
    searchTerm,
    statusFilter: STATUS_IDS.has(statusFilter)
      ? statusFilter
      : CLIENTES_DEFAULT_FILTERS.statusFilter,
    cityFilter: cityFilter || CLIENTES_DEFAULT_FILTERS.cityFilter,
    sortBy: SORT_IDS.has(sortBy) ? sortBy : CLIENTES_DEFAULT_FILTERS.sortBy,
    currentPage,
    pageSize: PAGE_SIZES.has(pageSize) ? pageSize : CLIENTES_DEFAULT_FILTERS.pageSize,
  };
}

function buildCities(clientes, indexed) {
  return Array.from(
    new Set(
      clientes
        .map((cliente) => indexed.get(cliente.id)?.displayCity)
        .filter(Boolean)
        .sort((a, b) => String(a).localeCompare(String(b), 'pt-BR')),
    ),
  );
}

function buildPagination(filteredCount, { currentPage, pageSize }) {
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const clampedCurrentPage = Math.min(currentPage, totalPages);
  const start = (clampedCurrentPage - 1) * pageSize;
  const to = Math.min(filteredCount, clampedCurrentPage * pageSize);

  return {
    currentPage: clampedCurrentPage,
    pageSize,
    totalPages,
    filteredCount,
    from: filteredCount ? start + 1 : 0,
    to,
  };
}

export function buildClientesViewModel({
  clientes,
  equipamentos,
  registros,
  searchTerm,
  statusFilter,
  cityFilter,
  sortBy,
  currentPage,
  pageSize,
  summaryCollapsed = true,
  nowMs = Date.now(),
} = {}) {
  const safeClientes = asArray(clientes);
  const safeEquipamentos = asArray(equipamentos);
  const safeRegistros = asArray(registros);
  const filters = normalizeClientesFilters({
    searchTerm,
    statusFilter,
    cityFilter,
    sortBy,
    currentPage,
    pageSize,
  });
  const indexed = buildClienteIndex({
    clientes: safeClientes,
    equipamentos: safeEquipamentos,
    registros: safeRegistros,
    nowMs,
  });
  const filtered = filterAndSortClientes(safeClientes, indexed, filters);
  const pagination = buildPagination(filtered.length, filters);
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const pageItems = filtered.slice(start, start + pagination.pageSize);
  const normalizedFilters = {
    ...filters,
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
  };
  const isEmpty = safeClientes.length === 0;

  return {
    clientes: safeClientes,
    equipamentos: safeEquipamentos,
    registros: safeRegistros,
    indexed,
    filtered,
    pageItems,
    cities: buildCities(safeClientes, indexed),
    filters: normalizedFilters,
    pagination,
    summaryCollapsed,
    isEmpty,
    isFilterEmpty: !isEmpty && filtered.length === 0,
  };
}
