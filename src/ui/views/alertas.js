/**
 * CoolTrack Pro - Alertas View v6.0
 * Legacy alertas renderer.
 */

import { Utils } from '../../core/utils.js';
import { getState } from '../../core/state.js';
import { Alerts, getPreventivaDueEquipmentIds } from '../../domain/alerts.js';
import { getAllClienteAlerts } from '../../core/clienteAlerts.js';
import { withSkeleton } from '../components/skeleton.js';
import { buildAlertasViewModel } from '../viewModels/alertasViewModel.js';

const ALERTAS_VIEW_ID = 'view-alertas';

let renderGeneration = 0;

function appendTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text || '';
  parent.append(element);
  return element;
}

function ensureAlertasContainers(root) {
  let contextual = root.querySelector('#alertas-contextual');
  let list = root.querySelector('#lista-alertas');
  if (contextual && list) return { contextual, list };

  root.replaceChildren();
  appendTextElement(root, 'div', 'section-title', 'Alertas e Anormalidades registradas');
  contextual = document.createElement('div');
  contextual.id = 'alertas-contextual';
  root.append(contextual);

  list = document.createElement('div');
  list.id = 'lista-alertas';
  list.setAttribute('role', 'list');
  root.append(list);

  return { contextual, list };
}

function renderEmptyState(list, emptyState) {
  if (!emptyState) return;
  const cta = emptyState.cta;
  const section = document.createElement('section');
  section.className = 'engaging-empty-state';
  if (emptyState.ariaLabel) section.setAttribute('aria-label', emptyState.ariaLabel);

  appendTextElement(section, 'div', 'engaging-empty-state__icon', emptyState.icon);
  appendTextElement(section, 'h3', 'engaging-empty-state__title', emptyState.title);
  if (emptyState.description) {
    appendTextElement(section, 'p', 'engaging-empty-state__description', emptyState.description);
  }

  if (cta) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = [
      'btn',
      cta.tone === 'outline' ? 'btn--outline' : 'btn--primary',
      'engaging-empty-state__cta',
    ].join(' ');
    if (cta.nav) button.dataset.nav = cta.nav;
    button.textContent = cta.label || '';
    section.append(button);
  }

  list.append(section);
}

function renderContextBanner(contextual, banner) {
  contextual.replaceChildren();
  if (!banner) return;

  const section = document.createElement('section');
  section.className = 'alertas-context-banner';
  section.setAttribute('role', 'status');
  section.setAttribute('aria-live', 'polite');

  const icon = appendTextElement(section, 'span', 'alertas-context-banner__icon', banner.icon);
  icon.setAttribute('aria-hidden', 'true');
  appendTextElement(section, 'div', 'alertas-context-banner__text', banner.text);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'alertas-context-banner__cta';
  if (banner.action) button.dataset.action = banner.action;
  button.textContent = banner.ctaLabel || '';
  section.append(button);

  contextual.append(section);
}

function renderAlertCard(list, card) {
  const item = document.createElement('div');
  item.className = ['alert-card', card.tone ? `alert-card--${card.tone}` : '']
    .filter(Boolean)
    .join(' ');
  item.dataset.action = card.action || '';
  item.dataset.id = card.dataId || '';
  item.setAttribute('role', 'listitem');
  item.tabIndex = 0;
  if (card.kind === 'cliente') item.dataset.clienteNome = card.clienteNome || '';

  appendTextElement(item, 'span', 'alert-card__icon', card.icon);
  const body = document.createElement('div');
  appendTextElement(body, 'div', 'alert-card__title', card.title);
  appendTextElement(body, 'div', 'alert-card__sub', card.subtitle);
  appendTextElement(body, 'div', 'alert-card__equip', card.equipmentLabel);
  item.append(body);
  list.append(item);
}

function renderAlertasDom(root, viewModel, generation) {
  if (generation !== renderGeneration) return null;
  const safeViewModel = viewModel || {};
  const cards = Array.isArray(safeViewModel.cards) ? safeViewModel.cards : [];
  const { contextual, list } = ensureAlertasContainers(root);

  renderContextBanner(contextual, safeViewModel.contextBanner);
  list.replaceChildren();
  if (cards.length) {
    cards.forEach((card) => renderAlertCard(list, card));
  } else {
    renderEmptyState(list, safeViewModel.emptyState);
  }

  return root;
}

export function renderAlertas() {
  const { equipamentos = [], registros = [], clientes = [] } = getState();
  const maintenanceAlerts = Alerts.getAll();
  const preventivas7dCount = getPreventivaDueEquipmentIds(registros, 7).length;
  const clienteAlerts = getAllClienteAlerts(clientes);
  const viewModel = buildAlertasViewModel({
    equipamentos,
    maintenanceAlerts,
    clienteAlerts,
    preventivas7dCount,
  });

  const root = Utils.getEl(ALERTAS_VIEW_ID);
  if (!root) return null;

  const generation = ++renderGeneration;
  const listEl = Utils.getEl('lista-alertas');
  const renderView = () => renderAlertasDom(root, viewModel, generation);

  if (!listEl) return renderView();

  return withSkeleton(
    listEl,
    {
      enabled: true,
      variant: 'alerts',
      count: viewModel.skeletonCount,
    },
    renderView,
  );
}

export function unmountAlertas() {
  renderGeneration += 1;
  const root = Utils.getEl(ALERTAS_VIEW_ID);
  if (!root) return null;
  const contextual = root.querySelector('#alertas-contextual');
  const list = root.querySelector('#lista-alertas');
  contextual?.replaceChildren();
  list?.replaceChildren();
  return null;
}
