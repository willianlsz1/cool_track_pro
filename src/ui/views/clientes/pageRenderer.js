import { Utils } from '../../../core/utils.js';
import { formatCnpjOrCpf } from '../../../core/clientes.js';
import {
  CLIENTES_ACTIONS,
  CLIENTES_PAGE_SIZE_OPTIONS,
  CLIENTES_PUBLIC_IDS,
  CLIENTES_SORT_OPTIONS,
  CLIENTES_STATUS_OPTIONS,
} from '../../viewModels/clientesContracts.js';
import {
  ICON_ALERT,
  ICON_BELL_SM,
  ICON_CALENDAR,
  ICON_CHEV_DOWN,
  ICON_CHEV_L,
  ICON_CHEV_R,
  ICON_CLOCK_SM,
  ICON_FILE,
  ICON_KEBAB,
  ICON_MONITOR,
  ICON_MONITOR_SM,
  ICON_PEN,
  ICON_PIN,
  ICON_PLUS,
  ICON_SEARCH,
  ICON_USERS,
  ICON_WRENCH,
  INDUSTRY_SVG,
  resolveIndustry,
} from './constants.js';
import { formatRelativeDate, lastServiceClass, pmocStatusClass } from './helpers.js';

function statusPill(status) {
  if (status === 'ativo') return `<span class="cli-card__pill cli-card__pill--ok">Ativo</span>`;
  if (status === 'sem_manutencao')
    return `<span class="cli-card__pill cli-card__pill--warn">Sem manutenção</span>`;
  return `<span class="cli-card__pill cli-card__pill--danger">Precisa atenção</span>`;
}

export function renderCard(cliente, data, { getClienteAlert, daysUntilAlert }) {
  const safeData = data || {};
  const safeId = Utils.escapeAttr(cliente.id);
  const nome = Utils.escapeHtml(cliente.nome || 'Cliente');
  const ariaNome = Utils.escapeAttr(String(cliente.nome || 'Cliente').replace(/[<>]/g, ' '));
  const razao = cliente.razaoSocial ? Utils.escapeHtml(cliente.razaoSocial) : '';
  const cnpj = cliente.cnpj ? Utils.escapeHtml(formatCnpjOrCpf(cliente.cnpj)) : '';
  const subline = [razao, cnpj].filter(Boolean).join(' · ');

  const industry = resolveIndustry(cliente);
  const enderecoStr = cliente.endereco
    ? Utils.escapeHtml(cliente.endereco)
    : 'Endereço não informado';
  const cityStr = safeData.displayCity ? `<br>${Utils.escapeHtml(safeData.displayCity)}` : '';

  const equipsLabel = Number(safeData.equipsCount || 0);
  const servicesLabel = Number(safeData.servicesCount || 0);
  const lastLabel = formatRelativeDate(safeData.lastServiceTs);
  const lastClass = lastServiceClass(safeData.sinceLast);
  const pmoc = safeData.pmocSummary || {};
  const pmocBlock =
    safeData.pmocOverdueCount > 0
      ? (() => {
          const label = `${safeData.pmocOverdueCount} manutenção${safeData.pmocOverdueCount !== 1 ? 'es' : ''} atrasada${safeData.pmocOverdueCount !== 1 ? 's' : ''}`;
          return `<div class="cli-pmoc" data-cli-action="${CLIENTES_ACTIONS.pmocFocus}" data-id="${safeId}"
           role="button" tabindex="0" aria-label="Abrir equipamentos com filtro PMOC do cliente ${nome}">
           <span class="cli-pmoc__label">PMOC</span>
           <span class="cli-pmoc__status">⚠️ ${label}</span>
         </div>`;
        })()
      : '';

  const alert = getClienteAlert(cliente.id);
  const alertDays = alert ? daysUntilAlert(cliente.id) : null;
  let alertBadgeHtml = '';
  if (alert && alertDays !== null) {
    const overdue = alertDays < 0;
    const soon = alertDays >= 0 && alertDays <= 7;
    const tone = overdue ? 'danger' : soon ? 'warn' : 'info';
    const label = overdue
      ? `${Math.abs(alertDays)} dia${Math.abs(alertDays) !== 1 ? 's' : ''} em atraso`
      : alertDays === 0
        ? 'Alerta hoje'
        : `Alerta em ${alertDays} dia${alertDays !== 1 ? 's' : ''}`;
    alertBadgeHtml = `
      <div class="cli-card__alert cli-card__alert--${tone}">
        <span aria-hidden="true">${ICON_BELL_SM}</span>
        <span>${label}</span>
      </div>`;
  }

  return `
    <article class="cli-card" data-id="${safeId}" role="listitem"
      tabindex="0" aria-label="Cliente ${ariaNome}">
      <header class="cli-card__head">
        <span class="cli-card__icon cli-card__icon--${industry.tint}" aria-hidden="true">
          ${INDUSTRY_SVG[industry.name]}
        </span>
        <div class="cli-card__title-wrap">
          <h3 class="cli-card__name">${nome}</h3>
          ${subline ? `<div class="cli-card__sub">${subline}</div>` : ''}
        </div>
        ${statusPill(safeData.status)}
        <div class="cli-card__menu" id="cli-card-menu-${safeId}" role="menu" hidden>
          <button type="button" class="cli-card__menu-item"
            data-cli-action="${CLIENTES_ACTIONS.alert}" data-id="${safeId}" role="menuitem">
            ${ICON_BELL_SM}
            <span>${alert ? 'Alterar alerta' : 'Definir alerta'}</span>
          </button>
          <button type="button" class="cli-card__menu-item"
            data-cli-action="${CLIENTES_ACTIONS.edit}" data-id="${safeId}" role="menuitem">
            ${ICON_PEN}
            <span>Editar cliente</span>
          </button>
          <button type="button" class="cli-card__menu-item cli-card__menu-item--danger"
            data-cli-action="${CLIENTES_ACTIONS.delete}" data-id="${safeId}" role="menuitem">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 6h18"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <path d="m6 6 1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/>
            </svg>
            <span>Apagar cliente</span>
          </button>
        </div>
      </header>
      ${alertBadgeHtml}

      <div class="cli-card__address">
        <span class="cli-card__address-icon" aria-hidden="true">${ICON_PIN}</span>
        <span>${enderecoStr}${cityStr}</span>
      </div>

      <div class="cli-card__stats">
        <div class="cli-stat">
          <div class="cli-stat__value">${equipsLabel}</div>
          <div class="cli-stat__label">Equipamentos</div>
        </div>
        <div class="cli-stat">
          <div class="cli-stat__value">${servicesLabel}</div>
          <div class="cli-stat__label">Serviços</div>
        </div>
        <div class="cli-stat">
          <div class="cli-stat__value ${lastClass}">${lastLabel}</div>
          <div class="cli-stat__label">Última manutenção</div>
        </div>
      </div>
      ${pmocBlock}

      <section class="cli-pmoc" aria-label="Resumo PMOC" role="button" tabindex="0" data-cli-action="${CLIENTES_ACTIONS.openPmocPanel}" data-id="${safeId}">
        <div class="cli-pmoc__head">
          <strong>${Utils.escapeHtml(pmoc.activeLabel || 'PMOC inativo')}</strong>
          <span class="cli-pmoc__chip ${pmocStatusClass(pmoc.status)}">
            ${Utils.escapeHtml(pmoc.statusLabel || 'Sem cronograma')}
          </span>
        </div>
        <div class="cli-pmoc__meta">
          <span>Última atualização: ${Utils.escapeHtml(pmoc.lastUpdateLabel || 'Sem atualização')}</span>
          <span>${Number(pmoc.doneCount || 0)} de ${Number(pmoc.plannedCount || 0)} manutenções realizadas</span>
          <span>Próxima manutenção: ${Utils.escapeHtml(pmoc.nextMaintenanceLabel || 'Sem manutenção prevista')}</span>
          <span>${Utils.escapeHtml(pmoc.statusHelp || 'Sem cronograma ativo para este cliente.')}</span>
        </div>
      </section>

      <footer class="cli-card__actions">
        <button type="button" class="cli-card__action cli-card__action--primary"
          data-cli-action="${CLIENTES_ACTIONS.verEquipamentos}" data-id="${safeId}">
          ${ICON_MONITOR_SM}<span>Ver equipamentos</span>
        </button>
        <button type="button" class="cli-card__action cli-card__action--secondary"
          data-cli-action="${CLIENTES_ACTIONS.verServicos}" data-id="${safeId}">
          ${ICON_CLOCK_SM}<span>Ver serviços</span>
        </button>
        <button type="button" class="cli-card__action cli-card__action--secondary"
          data-cli-action="${CLIENTES_ACTIONS.openPmocPanel}" data-id="${safeId}">
          ${ICON_FILE}<span>PMOC</span>
        </button>
        <button type="button" class="cli-card__action cli-card__action--secondary"
          data-cli-action="${CLIENTES_ACTIONS.novoServico}" data-id="${safeId}">
          ${ICON_CLOCK_SM}<span>Novo serviço</span>
        </button>
        <button type="button" class="cli-card__action cli-card__action--ghost cli-card__action--options"
          data-cli-action="${CLIENTES_ACTIONS.cardMenu}" data-id="${safeId}"
          aria-label="Mais opções para ${ariaNome}" title="Opções"
          aria-haspopup="menu" aria-expanded="false">
          ${ICON_KEBAB}<span class="cli-card__options-label">Opções</span>
        </button>
      </footer>
    </article>`;
}

export function renderKpis({ clientes, equipamentos, registros, indexed, nowMs = Date.now() }) {
  const totalClientes = clientes.length;
  const ativos = Array.from(indexed.values()).filter((d) => d.status === 'ativo').length;
  const ativosPercent = totalClientes ? Math.round((ativos / totalClientes) * 100) : 0;
  const totalEquips = equipamentos.filter((e) => Boolean(e.clienteId)).length;

  const startMonth = new Date(nowMs);
  startMonth.setDate(1);
  startMonth.setHours(0, 0, 0, 0);
  const equipsClientes = equipamentos.filter((e) => Boolean(e.clienteId));
  const equipsThisMonth = equipsClientes.filter((e) => {
    const ts = e.criadoEm || e.createdAt || 0;
    return new Date(ts).getTime() >= startMonth.getTime();
  }).length;

  const equipIdsComCliente = new Set(equipsClientes.map((e) => e.id));
  const servicosMes = registros.filter((r) => {
    if (!r.equipId || !equipIdsComCliente.has(r.equipId)) return false;
    const ts = r.data ? new Date(r.data).getTime() : 0;
    return ts >= startMonth.getTime();
  }).length;

  const startPrevMonth = new Date(startMonth);
  startPrevMonth.setMonth(startPrevMonth.getMonth() - 1);
  const servicosPrevMonth = registros.filter((r) => {
    if (!r.equipId || !equipIdsComCliente.has(r.equipId)) return false;
    const ts = r.data ? new Date(r.data).getTime() : 0;
    return ts >= startPrevMonth.getTime() && ts < startMonth.getTime();
  }).length;

  let trendLabel = '—';
  let trendTone = 'neutral';
  if (servicosPrevMonth === 0 && servicosMes > 0) {
    trendLabel = 'novo este mês';
    trendTone = 'up';
  } else if (servicosPrevMonth > 0) {
    const delta = Math.round(((servicosMes - servicosPrevMonth) / servicosPrevMonth) * 100);
    trendLabel = `${delta >= 0 ? '+' : ''}${delta}% vs mês anterior`;
    trendTone = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';
  }

  const pendentes = Array.from(indexed.values()).filter((d) => d.status !== 'ativo').length;

  return `
    <div class="cli-kpis">
      <article class="cli-kpi cli-kpi--users">
        <span class="cli-kpi__icon" aria-hidden="true">${ICON_USERS}</span>
        <div class="cli-kpi__body">
          <div class="cli-kpi__label">Clientes ativos</div>
          <div class="cli-kpi__value">${ativos}</div>
          <div class="cli-kpi__sub cli-kpi__sub--ok">${ativosPercent}% ativos</div>
        </div>
      </article>
      <article class="cli-kpi cli-kpi--equips">
        <span class="cli-kpi__icon" aria-hidden="true">${ICON_MONITOR}</span>
        <div class="cli-kpi__body">
          <div class="cli-kpi__label">Equipamentos</div>
          <div class="cli-kpi__value">${totalEquips}</div>
          <div class="cli-kpi__sub">${equipsThisMonth > 0 ? `+${equipsThisMonth} este mês` : 'sem novos este mês'}</div>
        </div>
      </article>
      <article class="cli-kpi cli-kpi--services">
        <span class="cli-kpi__icon" aria-hidden="true">${ICON_WRENCH}</span>
        <div class="cli-kpi__body">
          <div class="cli-kpi__label">Serviços este mês</div>
          <div class="cli-kpi__value">${servicosMes}</div>
          <div class="cli-kpi__sub cli-kpi__sub--${trendTone}">${trendLabel}</div>
        </div>
      </article>
      <article class="cli-kpi cli-kpi--pending">
        <span class="cli-kpi__icon" aria-hidden="true">${ICON_CALENDAR}</span>
        <div class="cli-kpi__body">
          <div class="cli-kpi__label">Manutenções pendentes</div>
          <div class="cli-kpi__value">${pendentes}</div>
          <div class="cli-kpi__sub cli-kpi__sub--${pendentes > 0 ? 'warn' : 'ok'}">${pendentes > 0 ? 'Requerem atenção' : 'Tudo em dia'}</div>
        </div>
      </article>
    </div>`;
}

export function renderSummary({
  clientes,
  equipamentos,
  registros,
  indexed,
  summaryCollapsed,
  windowObj,
  nowMs = Date.now(),
}) {
  const safeWindow = windowObj ?? (typeof window !== 'undefined' ? window : undefined);
  const mobileCollapsed = safeWindow?.matchMedia
    ? safeWindow.matchMedia('(max-width: 720px)').matches
    : false;
  const collapsed = mobileCollapsed ? summaryCollapsed : false;
  return `
    <section class="cli-summary ${collapsed ? 'is-collapsed' : ''}" aria-label="Resumo da carteira">
      <button type="button" class="cli-summary__toggle" data-cli-action="${CLIENTES_ACTIONS.toggleSummary}"
        aria-expanded="${collapsed ? 'false' : 'true'}">
        <span class="cli-summary__title">Resumo</span>
        <span class="cli-summary__hint">KPIs da carteira</span>
        <span class="cli-summary__chev" aria-hidden="true">${ICON_CHEV_DOWN}</span>
      </button>
      <div class="cli-summary__content">
        ${renderKpis({ clientes, equipamentos, registros, indexed, nowMs })}
      </div>
    </section>`;
}

export function renderActiveContext({ searchTerm, statusFilter, cityFilter }) {
  const chips = [];
  if (searchTerm.trim()) {
    chips.push(
      `<span class="cli-context__chip">Busca: <b>${Utils.escapeHtml(searchTerm.trim())}</b></span>`,
    );
  }
  if (statusFilter !== 'todos') {
    chips.push(
      `<span class="cli-context__chip">Status: <b>${Utils.escapeHtml(statusFilter.replaceAll('_', ' '))}</b></span>`,
    );
  }
  if (cityFilter !== 'todas') {
    chips.push(
      `<span class="cli-context__chip">Cidade: <b>${Utils.escapeHtml(cityFilter)}</b></span>`,
    );
  }
  if (!chips.length) return '';
  return `
    <div class="cli-context" role="status" aria-label="Filtros ativos">
      <span class="cli-context__label">Contexto ativo</span>
      <div class="cli-context__chips">${chips.join('')}</div>
      <button type="button" class="cli-context__clear" data-cli-action="${CLIENTES_ACTIONS.clearFilters}">Limpar</button>
    </div>`;
}

export function renderAlertStrip({ indexed }) {
  const stale = Array.from(indexed.values()).filter(
    (d) => d.lastServiceTs > 0 && (d.status === 'sem_manutencao' || d.status === 'precisa_atencao'),
  ).length;
  if (!stale) return '';
  return `
    <div class="cli-alert" role="status">
      <span class="cli-alert__icon" aria-hidden="true">${ICON_ALERT}</span>
      <div class="cli-alert__body">
        <div class="cli-alert__title">${stale} cliente${stale !== 1 ? 's' : ''} sem manutenção há mais de 60 dias</div>
        <div class="cli-alert__desc">Mantenha a regularidade e evite falhas nos equipamentos.</div>
      </div>
      <button type="button" class="cli-alert__cta" data-cli-action="${CLIENTES_ACTIONS.filterPending}">
        Ver clientes
        <span aria-hidden="true">${ICON_CHEV_R}</span>
      </button>
    </div>`;
}

function renderHeader() {
  return `
    <header class="cli-page__header">
      <div>
        <h1 class="cli-page__title">Meus clientes</h1>
        <p class="cli-page__sub">
          Cadastre clientes, acompanhe equipamentos vinculados e mantenha o histórico organizado.
        </p>
      </div>
      <button type="button" class="cli-page__cta"
        data-action="${CLIENTES_ACTIONS.openModal}" data-mode="create">
        ${ICON_PLUS}<span>Novo cliente</span>
      </button>
    </header>`;
}

function renderGrid(viewModel, clienteHelpers) {
  if (viewModel.isEmpty) return renderEmptyState();
  if (viewModel.isFilterEmpty) return renderEmptyFilter(viewModel.filters.searchTerm);

  return `
    <div class="cli-grid" role="list">
      ${viewModel.pageItems
        .map((cliente) => renderCard(cliente, viewModel.indexed.get(cliente.id), clienteHelpers))
        .join('')}
    </div>`;
}

function renderEmptyState() {
  return `
    <section class="cli-empty" aria-label="Nenhum cliente">
      <div class="cli-empty__art" aria-hidden="true">${ICON_USERS}</div>
      <h3 class="cli-empty__title">Nenhum cliente cadastrado</h3>
      <p class="cli-empty__sub">
        Cadastre o primeiro cliente para vincular equipamentos, registrar serviços
        e manter o histórico organizado.
      </p>
      <button type="button" class="cli-empty__cta"
        data-action="${CLIENTES_ACTIONS.openModal}" data-mode="create">
        ${ICON_PLUS}<span>Cadastrar primeiro cliente</span>
      </button>
    </section>`;
}

function renderEmptyFilter(searchTerm) {
  const term = Utils.escapeHtml(searchTerm || '');
  const hint = term ? `para "${term}"` : 'com os filtros atuais';
  return `
    <div class="cli-empty cli-empty--filter">
      <p class="cli-empty__sub">Nenhum cliente encontrado ${hint}.</p>
      <button type="button" class="cli-empty__cta cli-empty__cta--ghost"
        data-cli-action="${CLIENTES_ACTIONS.clearFilters}">Limpar filtros</button>
    </div>`;
}

function renderFilters({ cities, searchTerm, statusFilter, cityFilter, sortBy }) {
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
    </div>`;
}

function renderPagination(filteredCount, { currentPage, pageSize }) {
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  if (filteredCount === 0) return '';
  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(filteredCount, currentPage * pageSize);

  const pageBtns = [];
  for (let p = 1; p <= totalPages; p++) {
    const active = p === currentPage ? ' is-active' : '';
    pageBtns.push(
      `<button type="button" class="cli-pag__page${active}" data-cli-action="${CLIENTES_ACTIONS.gotoPage}" data-page="${p}" aria-label="Página ${p}" aria-current="${p === currentPage ? 'page' : 'false'}">${p}</button>`,
    );
  }

  const prevDisabled = currentPage <= 1 ? 'disabled' : '';
  const nextDisabled = currentPage >= totalPages ? 'disabled' : '';

  return `
    <div class="cli-pag" role="navigation" aria-label="Paginação">
      <div class="cli-pag__info">Mostrando ${from}-${to} de ${filteredCount}</div>
      <div class="cli-pag__controls">
        <button type="button" class="cli-pag__btn" data-cli-action="${CLIENTES_ACTIONS.prevPage}"
          aria-label="Página anterior" ${prevDisabled}>${ICON_CHEV_L}</button>
        <div class="cli-pag__pages">${pageBtns.join('')}</div>
        <button type="button" class="cli-pag__btn" data-cli-action="${CLIENTES_ACTIONS.nextPage}"
          aria-label="Próxima página" ${nextDisabled}>${ICON_CHEV_R}</button>
      </div>
      <label class="cli-select cli-pag__size">
        <span class="cli-select__label">Por página</span>
        <select id="${CLIENTES_PUBLIC_IDS.pageSize}" class="cli-select__input" aria-label="Itens por página">
          ${CLIENTES_PAGE_SIZE_OPTIONS.map(
            (option) =>
              `<option value="${option}" ${pageSize === option ? 'selected' : ''}>${option}</option>`,
          ).join('')}
        </select>
      </label>
    </div>`;
}

function buildClienteHelpers(clienteAlerts = {}) {
  return {
    getClienteAlert: (id) => clienteAlerts[id] || null,
    daysUntilAlert: (id) => clienteAlerts[id]?.daysRemaining ?? null,
  };
}

export function renderClientesPage({ viewModel, clienteAlerts = {}, isSummaryCollapsed = false }) {
  const clienteHelpers = buildClienteHelpers(clienteAlerts);
  const filters = viewModel.filters;
  return `
    <div class="tw-w-full cli-page" data-clientes-page="true">
      ${renderHeader()}
      ${renderSummary({
        clientes: viewModel.clientes,
        equipamentos: viewModel.equipamentos,
        registros: viewModel.registros,
        indexed: viewModel.indexed,
        summaryCollapsed: isSummaryCollapsed,
      })}
      ${renderActiveContext(filters)}
      ${renderAlertStrip({ indexed: viewModel.indexed })}
      ${renderFilters({
        cities: viewModel.cities,
        searchTerm: filters.searchTerm,
        statusFilter: filters.statusFilter,
        cityFilter: filters.cityFilter,
        sortBy: filters.sortBy,
      })}
      ${renderGrid(viewModel, clienteHelpers)}
      ${renderPagination(viewModel.pagination.filteredCount, viewModel.pagination)}
    </div>`;
}

export function mountClientesDom(root, props = {}) {
  if (!root) return null;
  root.innerHTML = renderClientesPage(props);
  root.dataset.clientesMounted = 'true';
  return root;
}

export function unmountClientesDom(root) {
  if (!root) return;
  root.innerHTML = '';
  delete root.dataset.clientesMounted;
}
