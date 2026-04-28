import { Utils } from '../../../core/utils.js';
import { formatCnpjOrCpf } from '../../../core/clientes.js';
import {
  ICON_BELL_SM,
  ICON_CLOCK_SM,
  ICON_FILE,
  ICON_KEBAB,
  ICON_MONITOR_SM,
  ICON_PEN,
  ICON_PIN,
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
  const razao = cliente.razaoSocial ? Utils.escapeHtml(cliente.razaoSocial) : '';
  const cnpj = cliente.cnpj ? Utils.escapeHtml(formatCnpjOrCpf(cliente.cnpj)) : '';
  const subline = [razao, cnpj].filter(Boolean).join('  ·  ');

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
          return `<div class="cli-pmoc" data-cli-action="pmoc-focus" data-id="${safeId}"
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
      tabindex="0" aria-label="Cliente ${nome}">
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
            data-cli-action="alert" data-id="${safeId}" role="menuitem">
            ${ICON_BELL_SM}
            <span>${alert ? 'Alterar alerta' : 'Definir alerta'}</span>
          </button>
          <button type="button" class="cli-card__menu-item"
            data-cli-action="edit" data-id="${safeId}" role="menuitem">
            ${ICON_PEN}
            <span>Editar cliente</span>
          </button>
          <button type="button" class="cli-card__menu-item cli-card__menu-item--danger"
            data-cli-action="delete" data-id="${safeId}" role="menuitem">
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

      <section class="cli-pmoc" aria-label="Resumo PMOC" role="button" tabindex="0" data-cli-action="open-pmoc-panel" data-id="${safeId}">
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
          data-cli-action="ver-equipamentos" data-id="${safeId}">
          ${ICON_MONITOR_SM}<span>Ver equipamentos</span>
        </button>
        <button type="button" class="cli-card__action cli-card__action--secondary"
          data-cli-action="ver-serviços" data-id="${safeId}">
          ${ICON_CLOCK_SM}<span>Ver serviços</span>
        </button>
        <button type="button" class="cli-card__action cli-card__action--pmoc"
          data-cli-action="open-pmoc-panel" data-id="${safeId}">
          ${ICON_FILE}<span>PMOC</span>
        </button>
        <button type="button" class="cli-card__action cli-card__action--ghost cli-card__action--options"
          data-cli-action="card-menu" data-id="${safeId}"
          aria-label="Mais opções para ${nome}" title="Opções"
          aria-haspopup="menu" aria-expanded="false">
          ${ICON_KEBAB}<span class="cli-card__options-label">Opções</span>
        </button>
      </footer>
    </article>`;
}
