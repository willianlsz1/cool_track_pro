import { DASHBOARD_ACTIONS, DASHBOARD_PUBLIC_IDS } from '../../viewModels/dashboardContracts.js';

const EMPTY_DASHBOARD_READ_ONLY_BLOCKS = Object.freeze({
  criticalNow: { visible: false, count: 0, groups: [] },
  alertsMini: { visible: false, alerts: [] },
  criticalEquipments: { visible: false, equipments: [] },
  recentServices: { visible: false, records: [] },
});

const SAFE_DASHBOARD_IMAGE_DATA_RE = /^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i;

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function setOptionalDataAttribute(element, name, value) {
  if (!element) return;
  const normalized = text(value);
  if (normalized) {
    element.setAttribute(name, normalized);
    return;
  }
  element.removeAttribute(name);
}

function appendText(parent, tagName, className, textContent, options = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (options.id) element.id = options.id;
  if (options.ariaHidden) element.setAttribute('aria-hidden', 'true');
  element.textContent = textContent ?? '';
  parent.appendChild(element);
  return element;
}

function items(value) {
  return Array.isArray(value) ? value : [];
}

function cssToken(value, fallback = 'default') {
  const normalized = text(value, fallback);
  return /^[a-z0-9_-]+$/i.test(normalized) ? normalized : fallback;
}

function safePercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function safeImageSrc(value) {
  const src = text(value).trim();
  if (!src) return '';
  if (SAFE_DASHBOARD_IMAGE_DATA_RE.test(src)) return src;

  try {
    const url = new URL(src, 'https://cooltrack.local');
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'blob:') {
      return src;
    }
  } catch {
    return '';
  }

  return '';
}

function appendReadOnlySection(root, { id, label, countId, count }) {
  const section = document.createElement('section');
  section.className = 'dash__section';
  section.id = id;

  const header = document.createElement('header');
  header.className = 'dash__section-header';
  appendText(header, 'span', 'dash__section-label', label);
  if (countId) {
    appendText(header, 'span', 'dash__section-count', text(count, '0'), { id: countId });
  }
  section.appendChild(header);
  root.appendChild(section);
  return section;
}

function renderCriticalNowSection(root, block = EMPTY_DASHBOARD_READ_ONLY_BLOCKS.criticalNow) {
  const visible = Boolean(block?.visible);
  const section = appendReadOnlySection(root, {
    id: DASHBOARD_PUBLIC_IDS.criticalSection,
    label: 'A FAZER AGORA',
    countId: DASHBOARD_PUBLIC_IDS.criticalNowCount,
    count: block?.count,
  });
  section.hidden = !visible;

  const listRoot = document.createElement('div');
  listRoot.id = DASHBOARD_PUBLIC_IDS.criticalNow;
  section.appendChild(listRoot);

  if (!visible) return;

  items(block?.groups).forEach((group) => {
    const groupItems = items(group?.items);
    if (!groupItems.length) return;

    const groupRoot = document.createElement('div');
    groupRoot.className = 'critical-now-group';
    appendText(groupRoot, 'div', 'critical-now-group__label', text(group?.label));

    const groupList = document.createElement('div');
    groupList.className = 'critical-now-list';

    groupItems.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `critical-now-item critical-now-item--${cssToken(item?.tone, 'danger')}`;
      setOptionalDataAttribute(button, 'data-action', item?.action);
      setOptionalDataAttribute(button, 'data-id', item?.id);

      appendText(button, 'span', 'critical-now-item__icon', text(item?.icon, '!'), {
        ariaHidden: true,
      });

      const body = document.createElement('span');
      body.className = 'critical-now-item__body';
      appendText(body, 'span', 'critical-now-item__title', text(item?.title));
      if (item?.subtitle) {
        appendText(body, 'span', 'critical-now-item__subtitle', text(item.subtitle));
      }
      button.appendChild(body);
      appendText(button, 'span', 'critical-now-item__cta', text(item?.ctaLabel, 'Abrir'));
      groupList.appendChild(button);
    });

    groupRoot.appendChild(groupList);
    listRoot.appendChild(groupRoot);
  });
}

function renderAlertsMiniSection(root, block = EMPTY_DASHBOARD_READ_ONLY_BLOCKS.alertsMini) {
  const visible = Boolean(block?.visible);
  const section = appendReadOnlySection(root, {
    id: DASHBOARD_PUBLIC_IDS.alertsSection,
    label: 'Alertas ativos',
  });
  section.hidden = !visible;

  const listRoot = document.createElement('div');
  listRoot.id = DASHBOARD_PUBLIC_IDS.alertsMini;
  section.appendChild(listRoot);

  if (visible && items(block?.alerts).length) {
    const list = document.createElement('div');
    list.className = 'dash-alertas-list';
    items(block?.alerts).forEach((alert) => {
      const card = document.createElement('div');
      card.className = `alert-card${alert?.critical ? ' alert-card--critical' : ''}`;
      card.setAttribute('role', 'listitem');
      card.tabIndex = 0;
      setOptionalDataAttribute(card, 'data-action', alert?.action);
      setOptionalDataAttribute(card, 'data-id', alert?.id);

      appendText(card, 'span', 'alert-card__icon', text(alert?.icon, '!'));
      const body = document.createElement('div');
      body.className = 'alert-card__body';
      appendText(body, 'div', 'alert-card__equip', text(alert?.equipmentName, '\u2014'));
      appendText(body, 'div', 'alert-card__title', text(alert?.title, 'Alerta'));
      if (alert?.subtitle) {
        appendText(body, 'div', 'alert-card__sub', text(alert.subtitle));
      }
      card.appendChild(body);
      appendText(card, 'span', 'alert-card__action', '\u2192 Agir');
      list.appendChild(card);
    });
    listRoot.appendChild(list);
  }
}

function appendEquipmentIcon(parent, visual = {}) {
  const photoUrl = safeImageSrc(visual?.photoUrl);
  const tone = cssToken(visual?.tone, 'ok');
  const icon = document.createElement('div');
  icon.className = [
    'equip-card__type-icon',
    'equip-card__type-icon--lg',
    photoUrl ? 'equip-card__type-icon--photo' : 'equip-card__type-icon--fallback',
    `equip-card__type-icon--fallback-t${tone}`,
  ].join(' ');
  icon.setAttribute('aria-hidden', 'true');

  if (photoUrl) {
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.src = photoUrl;
    icon.appendChild(img);
  }

  appendText(icon, 'span', 'equip-card__fallback-initials', text(visual?.initials, 'EQ'));
  parent.appendChild(icon);
}

function trendLabel(trend) {
  const delta = Number(trend?.delta || 0);
  if (!trend || trend.trend === 'stable')
    return { text: '\u2192 est\u00e1vel', modifier: 'stable' };
  if (trend.trend === 'improving') {
    return { text: `\u2193 ${Math.abs(delta)}`, modifier: 'improving' };
  }
  return { text: `\u2191 ${delta}`, modifier: 'worsening' };
}

function appendCriticalEquipmentCard(root, equipment = {}) {
  const statusClass = cssToken(equipment?.statusClass, 'ok');
  const healthClass = cssToken(equipment?.health?.className, 'ok');
  const riskClass = cssToken(equipment?.risk?.classification, 'medio');
  const priorityLevel = cssToken(equipment?.priority?.level, '1');
  const score = safePercent(equipment?.health?.score);

  const card = document.createElement('div');
  card.className = `equip-card equip-card--${statusClass}`;
  card.setAttribute('role', 'listitem');
  card.tabIndex = 0;
  card.setAttribute('aria-label', text(equipment?.ariaLabel, text(equipment?.name, 'Equipamento')));
  card.setAttribute('data-action', DASHBOARD_ACTIONS.viewEquip);
  setOptionalDataAttribute(card, 'data-id', equipment?.id);

  const band = document.createElement('div');
  band.className = `equip-card__status-band equip-card__status-band--${statusClass}`;
  card.appendChild(band);

  const header = document.createElement('div');
  header.className = 'equip-card__header';
  appendEquipmentIcon(header, equipment?.visual);
  const meta = document.createElement('div');
  meta.className = 'equip-card__meta';
  appendText(
    meta,
    'div',
    `equip-card__name${statusClass === 'danger' ? ' equip-card__name--danger' : ''}`,
    text(equipment?.name, '\u2014'),
  );
  appendText(meta, 'div', 'equip-card__tag', text(equipment?.meta));
  header.appendChild(meta);
  const status = document.createElement('span');
  status.className = `equip-card__status equip-card__status--${statusClass}`;
  const dot = document.createElement('span');
  dot.className = `status-dot status-dot--${statusClass}`;
  status.appendChild(dot);
  status.append(text(equipment?.statusLabel));
  header.appendChild(status);
  card.appendChild(header);

  const health = document.createElement('div');
  health.className = 'equip-card__health';
  const bar = document.createElement('div');
  bar.className = 'equip-card__health-bar';
  const fill = document.createElement('div');
  fill.className = `equip-card__health-fill equip-card__health-fill--${healthClass}`;
  fill.style.width = `${score}%`;
  bar.appendChild(fill);
  health.appendChild(bar);
  const healthMeta = document.createElement('div');
  healthMeta.className = 'equip-card__health-meta';
  appendText(healthMeta, 'span', 'equip-card__health-label', 'Efici\u00eancia');
  appendText(
    healthMeta,
    'span',
    `equip-card__health-value equip-card__health-value--${healthClass}`,
    `${score}%`,
  );
  health.appendChild(healthMeta);
  card.appendChild(health);

  const risk = document.createElement('div');
  risk.className = 'equip-card__risk';
  appendText(
    risk,
    'span',
    `equip-card__risk-badge equip-card__risk-badge--${riskClass}`,
    text(equipment?.risk?.label),
  );
  appendText(risk, 'span', 'equip-card__risk-score', `Score ${text(equipment?.risk?.score, '0')}`);
  const trend = trendLabel(equipment?.risk?.trend);
  const trendEl = appendText(
    risk,
    'span',
    `equip-card__risk-trend equip-card__risk-trend--${trend.modifier}`,
    trend.text,
  );
  trendEl.setAttribute('aria-label', 'Tend\u00eancia de risco');
  trendEl.title = 'Tend\u00eancia nos \u00faltimos 30 dias';
  card.appendChild(risk);

  const priority = document.createElement('div');
  priority.className = 'equip-card__priority';
  appendText(
    priority,
    'span',
    `equip-card__priority-badge equip-card__priority-badge--${priorityLevel}`,
    text(equipment?.priority?.label),
  );
  card.appendChild(priority);

  const metrics = document.createElement('div');
  metrics.className = 'equip-card__metrics';
  const lastMetric = document.createElement('div');
  lastMetric.className = 'equip-card__metric';
  appendText(lastMetric, 'div', 'equip-card__metric-label', '\u00daltima manuten\u00e7\u00e3o');
  const lastValue = document.createElement('div');
  lastValue.className = 'equip-card__metric-value';
  if (equipment?.metrics?.lastLabel) {
    lastValue.textContent = text(equipment.metrics.lastLabel);
  } else {
    appendText(lastValue, 'span', 'equip-card__metric-empty', 'Nenhum registro');
  }
  lastMetric.appendChild(lastValue);
  if (equipment?.metrics?.lastType) {
    appendText(lastMetric, 'div', 'equip-card__metric-sub', text(equipment.metrics.lastType));
  }
  metrics.appendChild(lastMetric);

  const nextMetric = document.createElement('div');
  nextMetric.className = 'equip-card__metric';
  appendText(nextMetric, 'div', 'equip-card__metric-label', 'Pr\u00f3xima prev.');
  const nextValue = document.createElement('div');
  nextValue.className = `equip-card__metric-value ${cssToken(
    equipment?.metrics?.nextClass,
    'equip-card__metric-value--muted',
  )}`;
  if (equipment?.metrics?.nextIcon) {
    const icon = document.createElement('span');
    icon.textContent = `${text(equipment.metrics.nextIcon)} `;
    nextValue.appendChild(icon);
  }
  nextValue.append(text(equipment?.metrics?.nextLabel, '\u2014'));
  nextMetric.appendChild(nextValue);
  metrics.appendChild(nextMetric);
  card.appendChild(metrics);

  const footer = document.createElement('div');
  footer.className = 'equip-card__footer';
  const cta = document.createElement('button');
  cta.type = 'button';
  cta.className = 'equip-card__cta';
  cta.setAttribute('data-action', DASHBOARD_ACTIONS.goRegisterEquip);
  setOptionalDataAttribute(cta, 'data-id', equipment?.id);
  cta.textContent = text(equipment?.ctaLabel, 'Registrar servi\u00e7o \u2192');
  footer.appendChild(cta);
  card.appendChild(footer);

  root.appendChild(card);
}

function renderCriticalEquipmentsSection(
  root,
  block = EMPTY_DASHBOARD_READ_ONLY_BLOCKS.criticalEquipments,
) {
  const visible = Boolean(block?.visible);
  const section = appendReadOnlySection(root, {
    id: DASHBOARD_PUBLIC_IDS.criticosSection,
    label: 'Equipamentos com ocorr\u00eancia',
  });
  section.hidden = !visible;

  const listRoot = document.createElement('div');
  listRoot.id = DASHBOARD_PUBLIC_IDS.criticos;
  section.appendChild(listRoot);

  const equipments = items(block?.equipments);
  if (!visible || !equipments.length) return;

  const list = document.createElement('div');
  list.className = 'dash-criticos-list';
  equipments.forEach((equipment) => appendCriticalEquipmentCard(list, equipment));
  listRoot.appendChild(list);
}

function renderRecentServicesSection(
  root,
  block = EMPTY_DASHBOARD_READ_ONLY_BLOCKS.recentServices,
) {
  const visible = Boolean(block?.visible);
  const section = appendReadOnlySection(root, {
    id: DASHBOARD_PUBLIC_IDS.recentesSection,
    label: '\u00daltimos servi\u00e7os',
  });
  section.hidden = !visible;

  const listRoot = document.createElement('div');
  listRoot.id = DASHBOARD_PUBLIC_IDS.recentes;
  section.appendChild(listRoot);

  const records = items(block?.records);
  if (!visible || !records.length) return;

  const grid = document.createElement('div');
  grid.className = 'dash-recentes-grid';
  records.forEach((record) => {
    const article = document.createElement('article');
    article.className = 'card recent-card';
    article.setAttribute('data-nav', 'historico');
    appendText(article, 'div', 'recent-card__date', text(record?.dateLabel));
    appendText(article, 'div', 'recent-card__title', text(record?.title));
    appendText(article, 'div', 'recent-card__equip', text(record?.context, '\u2014'));
    appendText(article, 'div', 'recent-card__obs', text(record?.obs));
    grid.appendChild(article);
  });
  listRoot.appendChild(grid);
}

export function renderReadOnlyBlocksDom(root, readOnlyBlocks = EMPTY_DASHBOARD_READ_ONLY_BLOCKS) {
  if (!root) return;
  const model = {
    ...EMPTY_DASHBOARD_READ_ONLY_BLOCKS,
    ...(readOnlyBlocks || {}),
  };

  if (!root.style.display) root.style.display = 'contents';
  root.replaceChildren();
  renderCriticalNowSection(root, model.criticalNow);
  renderAlertsMiniSection(root, model.alertsMini);
  renderCriticalEquipmentsSection(root, model.criticalEquipments);
  renderRecentServicesSection(root, model.recentServices);
}
