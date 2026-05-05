import { Utils } from '../../core/utils.js';
import { getState } from '../../core/state.js';
import { Storage } from '../../core/storage.js';
import { Alerts } from '../../domain/alerts.js';

function _countRegistrosNoMes(registros = [], monthOffset = 0) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const y = base.getFullYear();
  const m = base.getMonth();

  return registros.filter((r) => {
    const d = new Date(r.data);
    return !Number.isNaN(d) && d.getFullYear() === y && d.getMonth() === m;
  }).length;
}

function _setStatusIndicatorState(el, tone, options = {}) {
  if (!el) return;
  const { live = false, syncing = false } = options;
  el.classList.remove(
    'status-indicator--ok',
    'status-indicator--warn',
    'status-indicator--danger',
    'status-indicator--live',
    'status-indicator--syncing',
  );
  el.classList.add(`status-indicator--${tone}`);
  if (live) el.classList.add('status-indicator--live');
  if (syncing) el.classList.add('status-indicator--syncing');
}

function _safeHeaderAttributeText(value) {
  return String(value || '')
    .replace(/javascript:/gi, '')
    .replace(/[<>"'`]/g, '')
    .trim();
}

export function updateGlobalHeader({ equipamentos, registros, alerts } = {}) {
  const state = equipamentos && registros ? { equipamentos, registros } : getState();
  const resolvedEquipamentos = state.equipamentos || [];
  const resolvedRegistros = state.registros || [];
  const resolvedAlerts = alerts || Alerts.getAll();

  const today = new Date();
  const alertCount = resolvedAlerts.length;
  const faultCount = resolvedEquipamentos.filter((e) => e.status === 'danger').length;
  const activeCount = resolvedEquipamentos.filter((e) => e.status !== 'danger').length;
  const mesCount = _countRegistrosNoMes(resolvedRegistros, 0);

  const dateEl = Utils.getEl('hdr-date');
  if (dateEl)
    dateEl.textContent = today
      .toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })
      .toUpperCase();

  const totalEl = Utils.getEl('hst-total');
  if (totalEl)
    totalEl.textContent = resolvedEquipamentos.length
      ? `${activeCount}/${resolvedEquipamentos.length}`
      : '—';
  const mesEl = Utils.getEl('hst-mes');
  if (mesEl) mesEl.textContent = mesCount || '—';
  const alertEl = Utils.getEl('hst-alert');
  if (alertEl) alertEl.textContent = alertCount || '0';

  const badge = Utils.getEl('alerta-badge');
  if (badge) {
    badge.textContent = String(alertCount);
    badge.classList.toggle('is-visible', alertCount > 0);
  }

  const preventivas7dCount = Alerts.countPreventivas7Dias();
  const headerAlertPill = Utils.getEl('header-alert-pill');
  const headerAlertTooltip = Utils.getEl('header-alert-tooltip');
  const headerAlertBtn = document.querySelector('.header-alert-btn');
  if (headerAlertPill && headerAlertTooltip && headerAlertBtn) {
    headerAlertPill.textContent = String(preventivas7dCount);
    headerAlertPill.hidden = preventivas7dCount <= 0;
    headerAlertPill.classList.toggle('is-visible', preventivas7dCount > 0);
    headerAlertTooltip.textContent = `${preventivas7dCount} equipamento${preventivas7dCount > 1 ? 's' : ''} com preventiva nos próximos 7 dias`;
    headerAlertTooltip.hidden = preventivas7dCount <= 0;
    headerAlertBtn.setAttribute('title', headerAlertTooltip.textContent);
  }

  const helpMenuBadge = Utils.getEl('header-help-menu-alert-badge');
  if (helpMenuBadge) {
    helpMenuBadge.textContent = String(preventivas7dCount);
    helpMenuBadge.hidden = preventivas7dCount <= 0;
  }
  const helpBtn = Utils.getEl('header-help-btn');
  if (helpBtn) {
    if (preventivas7dCount > 0) helpBtn.setAttribute('data-has-alerts', '1');
    else helpBtn.removeAttribute('data-has-alerts');
  }

  const statusSistema = Utils.getEl('status-sistema');
  const statusFalhas = Utils.getEl('status-falhas');
  const statusFalhasTxt = Utils.getEl('status-falhas-txt');
  if (statusSistema && statusFalhas) {
    if (faultCount > 0) {
      statusSistema.hidden = true;
      statusFalhas.hidden = false;
      _setStatusIndicatorState(statusFalhas, 'danger', { live: true });
      if (statusFalhasTxt)
        statusFalhasTxt.textContent = `${faultCount} situaç${faultCount > 1 ? 'ões' : 'ão'} crítica${faultCount > 1 ? 's' : ''} em aberto`;
    } else if (alertCount > 0) {
      statusSistema.innerHTML = `<span class="status-indicator__dot status-indicator__dot--warn"></span><span>Atenção requerida</span>`;
      statusSistema.hidden = false;
      statusFalhas.hidden = true;
      _setStatusIndicatorState(statusSistema, 'warn', { live: true });
      _setStatusIndicatorState(statusFalhas, 'danger');
    } else {
      statusSistema.innerHTML = `<span class="status-indicator__dot status-indicator__dot--ok"></span><span>Sistema operacional</span>`;
      statusSistema.hidden = false;
      statusFalhas.hidden = true;
      _setStatusIndicatorState(statusSistema, 'ok');
      _setStatusIndicatorState(statusFalhas, 'danger');
    }
  }

  const syncStatus = Storage.getSyncStatus();
  const syncTargets = [
    { el: Utils.getEl('sync-status'), txt: Utils.getEl('sync-status-txt'), kind: 'header' },
    {
      el: Utils.getEl('sidenav-sync-status'),
      txt: Utils.getEl('sidenav-sync-status-txt'),
      kind: 'sidenav',
    },
  ];

  syncTargets.forEach(({ el, txt, kind }) => {
    if (!el || !txt) return;
    const dot = el.querySelector('.status-indicator__dot, .app-sidebar__sync-dot');

    if (syncStatus.state === 'syncing') {
      el.hidden = false;
      if (dot) {
        if (kind === 'header') {
          dot.className = 'status-indicator__dot status-indicator__dot--ok';
        } else {
          dot.className = 'app-sidebar__sync-dot app-sidebar__sync-dot--ok';
        }
      }
      if (kind === 'header') {
        _setStatusIndicatorState(el, 'ok', { live: true, syncing: true });
      } else {
        el.setAttribute('data-state', 'syncing');
      }
      txt.textContent =
        syncStatus.pendingOps > 1 ? 'Sincronizando alterações...' : 'Sincronizando...';
    } else if (syncStatus.state === 'pending') {
      el.hidden = false;
      const isServerErr = syncStatus.errorKind === 'server';
      const dotVariant = isServerErr ? 'danger' : 'warn';
      if (dot) {
        if (kind === 'header') {
          dot.className = `status-indicator__dot status-indicator__dot--${dotVariant}`;
        } else {
          dot.className = `app-sidebar__sync-dot app-sidebar__sync-dot--${dotVariant}`;
        }
      }
      if (kind === 'header') {
        _setStatusIndicatorState(el, dotVariant, { live: true });
      } else {
        el.setAttribute('data-state', isServerErr ? 'error' : 'pending');
      }
      const baseLabel = isServerErr ? 'Erro ao sincronizar' : 'Sincronização pendente';
      txt.textContent =
        syncStatus.pendingOps > 0 ? `${baseLabel} (${syncStatus.pendingOps})` : baseLabel;
      const safeMessage = _safeHeaderAttributeText(syncStatus.message);
      if (safeMessage) {
        el.title = safeMessage;
      }
    } else {
      el.hidden = true;
      el.removeAttribute('title');
      if (kind === 'header') {
        _setStatusIndicatorState(el, 'ok');
      } else {
        el.removeAttribute('data-state');
      }
    }
  });
}
