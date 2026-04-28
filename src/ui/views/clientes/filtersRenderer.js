import { Utils } from '../../../core/utils.js';
import { ICON_FILTER, ICON_SEARCH } from './constants.js';

export function renderFilters({ cities, searchTerm, statusFilter, cityFilter, sortBy }) {
  const cityOptions = ['todas', ...Array.from(new Set(cities)).filter(Boolean).sort()];
  return `
    <div class="cli-filters">
      <label class="cli-search">
        <span class="cli-search__icon" aria-hidden="true">${ICON_SEARCH}</span>
        <input type="search" class="cli-search__input" id="cli-search-input"
          placeholder="Buscar por nome, CNPJ, endereço..."
          aria-label="Buscar cliente"
          value="${Utils.escapeAttr(searchTerm)}" />
      </label>
      <label class="cli-select">
        <span class="cli-select__label">Status</span>
        <select id="cli-status-filter" class="cli-select__input" aria-label="Filtrar por status">
          <option value="todos" ${statusFilter === 'todos' ? 'selected' : ''}>Todos</option>
          <option value="ativo" ${statusFilter === 'ativo' ? 'selected' : ''}>Ativos</option>
          <option value="sem_manutencao" ${statusFilter === 'sem_manutencao' ? 'selected' : ''}>Sem manutenção</option>
          <option value="precisa_atencao" ${statusFilter === 'precisa_atencao' ? 'selected' : ''}>Precisa atenção</option>
        </select>
      </label>
      <label class="cli-select">
        <span class="cli-select__label">Cidade</span>
        <select id="cli-city-filter" class="cli-select__input" aria-label="Filtrar por cidade">
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
        <select id="cli-sort" class="cli-select__input" aria-label="Ordenar lista">
          <option value="mais_ativos" ${sortBy === 'mais_ativos' ? 'selected' : ''}>Mais ativos</option>
          <option value="recente" ${sortBy === 'recente' ? 'selected' : ''}>Manutenção recente</option>
          <option value="antigo" ${sortBy === 'antigo' ? 'selected' : ''}>Manutenção antiga</option>
          <option value="nome" ${sortBy === 'nome' ? 'selected' : ''}>Nome (A-Z)</option>
          <option value="equips" ${sortBy === 'equips' ? 'selected' : ''}>Mais equipamentos</option>
        </select>
      </label>
      <button type="button" class="cli-filters__reset" data-cli-action="clear-filters"
        aria-label="Limpar filtros" title="Limpar filtros">${ICON_FILTER}</button>
    </div>`;
}
