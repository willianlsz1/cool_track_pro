import { Utils } from '../../../core/utils.js';
import {
  CLIENTES_ACTIONS,
  CLIENTES_PUBLIC_IDS,
  CLIENTES_SORT_OPTIONS,
  CLIENTES_STATUS_OPTIONS,
} from '../../viewModels/clientesContracts.js';
import { ICON_FILTER, ICON_SEARCH } from './constants.js';

export function renderFilters({ cities, searchTerm, statusFilter, cityFilter, sortBy }) {
  const cityOptions = ['todas', ...Array.from(new Set(cities)).filter(Boolean).sort()];
  return `
    <div class="cli-filters">
      <label class="cli-search">
        <span class="cli-search__icon" aria-hidden="true">${ICON_SEARCH}</span>
        <input type="search" class="cli-search__input" id="${CLIENTES_PUBLIC_IDS.searchInput}"
          placeholder="Buscar por nome, CNPJ, endereço..."
          aria-label="Buscar cliente"
          value="${Utils.escapeAttr(searchTerm)}" />
      </label>
      <label class="cli-select">
        <span class="cli-select__label">Status</span>
        <select id="${CLIENTES_PUBLIC_IDS.statusFilter}" class="cli-select__input" aria-label="Filtrar por status">
          ${CLIENTES_STATUS_OPTIONS.map(
            (option) =>
              `<option value="${Utils.escapeAttr(option.id)}" ${statusFilter === option.id ? 'selected' : ''}>${Utils.escapeHtml(option.label)}</option>`,
          ).join('')}
        </select>
      </label>
      <label class="cli-select">
        <span class="cli-select__label">Cidade</span>
        <select id="${CLIENTES_PUBLIC_IDS.cityFilter}" class="cli-select__input" aria-label="Filtrar por cidade">
          ${cityOptions
            .map((c) => {
              const label = c === 'todas' ? 'Todas' : c;
              return `<option value="${Utils.escapeAttr(c)}" ${cityFilter === c ? 'selected' : ''}>${Utils.escapeHtml(label)}</option>`;
            })
            .join('')}
        </select>
      </label>
      <label class="cli-select">
        <span class="cli-select__label">Ordenar por</span>
        <select id="${CLIENTES_PUBLIC_IDS.sort}" class="cli-select__input" aria-label="Ordenar lista">
          ${CLIENTES_SORT_OPTIONS.map(
            (option) =>
              `<option value="${Utils.escapeAttr(option.id)}" ${sortBy === option.id ? 'selected' : ''}>${Utils.escapeHtml(option.label)}</option>`,
          ).join('')}
        </select>
      </label>
      <button type="button" class="cli-filters__reset" data-cli-action="${CLIENTES_ACTIONS.clearFilters}"
        aria-label="Limpar filtros" title="Limpar filtros">${ICON_FILTER}</button>
    </div>`;
}
