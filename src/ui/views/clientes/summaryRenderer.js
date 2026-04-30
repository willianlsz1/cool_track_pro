import { Utils } from '../../../core/utils.js';
<<<<<<< HEAD
import { CLIENTES_ACTIONS } from '../../viewModels/clientesContracts.js';
=======
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
import {
  ICON_ALERT,
  ICON_CALENDAR,
  ICON_CHEV_DOWN,
  ICON_CHEV_R,
  ICON_MONITOR,
  ICON_USERS,
  ICON_WRENCH,
} from './constants.js';

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
<<<<<<< HEAD
      <button type="button" class="cli-summary__toggle" data-cli-action="${CLIENTES_ACTIONS.toggleSummary}"
=======
      <button type="button" class="cli-summary__toggle" data-cli-action="toggle-summary"
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
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
<<<<<<< HEAD
      <button type="button" class="cli-context__clear" data-cli-action="${CLIENTES_ACTIONS.clearFilters}">Limpar</button>
=======
      <button type="button" class="cli-context__clear" data-cli-action="clear-filters">Limpar</button>
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
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
<<<<<<< HEAD
      <button type="button" class="cli-alert__cta" data-cli-action="${CLIENTES_ACTIONS.filterPending}">
=======
      <button type="button" class="cli-alert__cta" data-cli-action="filter-pending">
>>>>>>> aa5925ea165d894e783e65b3a2a80ff11830860c
        Ver clientes
        <span aria-hidden="true">${ICON_CHEV_R}</span>
      </button>
    </div>`;
}
