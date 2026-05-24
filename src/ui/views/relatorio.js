import { Utils } from '../../core/utils.js';
import { getState, findEquip } from '../../core/state.js';
import { getCachedPlan } from '../../core/plans/planCache.js';
import { withSkeleton } from '../components/skeleton.js';
import { CRITICIDADE_LABEL, PRIORIDADE_OPERACIONAL_LABEL } from '../../domain/maintenance.js';
import { formatDadosPlacaRows } from '../../domain/dadosPlacaDisplay.js';
import { buildContextualPmocReportSummary } from '../../domain/pmoc/reportContext.js';
import { PdfQuotaBadge } from '../components/pdfQuotaBadge.js';
import { getSignatureForRecord, SignatureViewerModal } from '../components/signature.js';
import { getPmocSummaryForCliente } from '../../core/pmocProgress.js';
import {
  RELATORIO_PLAN_CODES,
  RELATORIO_PUBLIC_IDS,
  RELATORIO_VIEW_MODES,
} from '../viewModels/relatorioContracts.js';
import { buildReportContext, buildRelatorioViewModel } from '../viewModels/relatorioViewModel.js';
import {
  renderRelatorioControls,
  unmountRelatorioControlsDom,
} from './relatorio/controlsRenderer.js';
import { renderRelatorioCards, unmountRelatorioCardsDom } from './relatorio/cardsRenderer.js';

export {
  buildPeriodNarrative,
  computeRelatorioKpis as computeKPIs,
  countCorretivas,
  getProximasAcoes,
  resolveRelatorioModeCopy as resolveModeCopy,
  shouldShowCorretivasBanner,
} from '../viewModels/relatorioViewModel.js';

// ──────────────────────────────────────────────────────────────────────
// Constantes de design — mapeamento granular dos 12 tipos reais
// (aprovado com o Willian; o mockup original tinha só 4 buckets)
// ──────────────────────────────────────────────────────────────────────

const VIEW_MODE_STORAGE_KEY = 'cooltrack_relatorio_view_mode';
const VIEW_MODE_COMPACT = RELATORIO_VIEW_MODES.compact;
const VIEW_MODE_DETAILED = RELATORIO_VIEW_MODES.detailed;
const PLAN_CODE_PRO = RELATORIO_PLAN_CODES.pro;
let relatorioHeroRenderGeneration = 0;
let relatorioControlsRenderGeneration = 0;
let relatorioCardsRenderGeneration = 0;
let lastRelatorioFilters = {
  equipId: '',
  de: '',
  ate: '',
};

function readRelatorioFilters(options = {}) {
  const equipEl = Utils.getEl('rel-equip');
  const deEl = Utils.getEl('rel-de');
  const ateEl = Utils.getEl('rel-ate');
  const optionEquipId =
    options.equipId === null || options.equipId === undefined ? '' : String(options.equipId);

  const filters = {
    equipId: optionEquipId || (equipEl ? Utils.getVal('rel-equip') : lastRelatorioFilters.equipId),
    de: deEl ? Utils.getVal('rel-de') : lastRelatorioFilters.de,
    ate: ateEl ? Utils.getVal('rel-ate') : lastRelatorioFilters.ate,
  };
  lastRelatorioFilters = filters;
  return filters;
}

function rememberRelatorioFiltersFromDom() {
  lastRelatorioFilters = {
    equipId: Utils.getEl('rel-equip') ? Utils.getVal('rel-equip') : lastRelatorioFilters.equipId,
    de: Utils.getEl('rel-de') ? Utils.getVal('rel-de') : lastRelatorioFilters.de,
    ate: Utils.getEl('rel-ate') ? Utils.getVal('rel-ate') : lastRelatorioFilters.ate,
  };
}

export function unmountRelatorioHero() {
  relatorioHeroRenderGeneration += 1;
  if (typeof document === 'undefined') return null;

  const root = document.getElementById('rel-hero');
  if (!root?.dataset.reactRelatorioHeroMounted) return null;

  root.replaceChildren();
  delete root.dataset.reactRelatorioHeroMounted;
  return null;
}

export function unmountRelatorioControls() {
  relatorioControlsRenderGeneration += 1;
  if (typeof document === 'undefined') return null;

  rememberRelatorioFiltersFromDom();
  const root = document.getElementById('rel-controls-root');
  return unmountRelatorioControlsDom(root);
}

export function unmountRelatorioCards() {
  relatorioCardsRenderGeneration += 1;
  if (typeof document === 'undefined') return null;

  const root = document.getElementById('relatorio-corpo');
  return unmountRelatorioCardsDom(root);
}

// tone = classe CSS legada .rel-tipo--<tone>
const TIPO_META = {
  'Manutenção Preventiva': { tone: 'cyan', icon: 'shieldCheck' },
  'Inspeção Geral': { tone: 'cyan', icon: 'shieldCheck' },
  'Limpeza de Filtros': { tone: 'cyan-soft', icon: 'droplets' },
  'Limpeza de Condensador': { tone: 'cyan-soft', icon: 'droplets' },
  'Limpeza de Evaporador': { tone: 'cyan-soft', icon: 'droplets' },
  'Ajuste de Dreno': { tone: 'cyan-soft', icon: 'droplets' },
  'Verificação Elétrica': { tone: 'gold-soft', icon: 'zap' },
  'Troca de Capacitor': { tone: 'gold-soft', icon: 'zap' },
  'Manutenção Corretiva': { tone: 'gold', icon: 'wrench' },
  'Troca de Compressor': { tone: 'gold', icon: 'wrench' },
  'Carga de Gás Refrigerante': { tone: 'cyan-strong', icon: 'flask' },
  Outro: { tone: 'muted', icon: 'tool' },
};

const DEFAULT_TIPO_META = { tone: 'muted', icon: 'tool' };

// ──────────────────────────────────────────────────────────────────────
// Status → variante visual (ok/warn/danger do sistema)
// ──────────────────────────────────────────────────────────────────────
const STATUS_TONE = { ok: 'ok', warn: 'warn', danger: 'danger' };

// Labels locais pro relatório — mais fortes que "Normal" do STATUS_LABEL
// global (que também vive em equipamentos, onde um rótulo curto tipo
// "Normal" funciona melhor). Aqui "Concluído" comunica ação finalizada,
// que é o que o leitor do relatório quer ver.
const REL_STATUS_LABEL = {
  ok: 'Concluído',
  warn: 'Atenção',
  danger: 'Crítico',
};

// ──────────────────────────────────────────────────────────────────────
// View mode persistence
// ──────────────────────────────────────────────────────────────────────
function getStoredViewMode() {
  try {
    const v = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return v === VIEW_MODE_DETAILED ? VIEW_MODE_DETAILED : VIEW_MODE_COMPACT;
  } catch {
    return VIEW_MODE_COMPACT;
  }
}

function setStoredViewMode(v) {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, v);
  } catch {
    /* ignore (Safari privado, etc.) */
  }
}

// ──────────────────────────────────────────────────────────────────────
// Public: populateRelatorioSelects (inalterado, só move o default label)
// ──────────────────────────────────────────────────────────────────────
export function populateRelatorioSelects() {
  const { equipamentos } = getState();
  const el = Utils.getEl('rel-equip');
  if (!el) return;

  el.textContent = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Todos os equipamentos';
  el.appendChild(defaultOption);

  equipamentos.forEach((equipamento) => {
    const option = document.createElement('option');
    option.value = String(equipamento.id || '');
    option.textContent = `${equipamento.nome || '-'} - ${equipamento.local || '-'}`;
    el.appendChild(option);
  });
}

// ──────────────────────────────────────────────────────────────────────
// Hero summary
// ──────────────────────────────────────────────────────────────────────
function relText(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function relClassNames(...values) {
  return values.filter(Boolean).join(' ');
}

function appendRelText(parent, tagName, className, textContent, options = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (options.id) element.id = options.id;
  if (options.role) element.setAttribute('role', options.role);
  if (options.ariaLabel) element.setAttribute('aria-label', options.ariaLabel);
  if (options.title) element.title = options.title;
  element.textContent = textContent;
  parent.appendChild(element);
  return element;
}

function createRelIcon(name, size = 14) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.6');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  const appendPath = (d) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  };
  const appendRect = (attrs) => {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    Object.entries(attrs).forEach(([key, value]) => rect.setAttribute(key, value));
    svg.appendChild(rect);
  };
  const appendCircle = (attrs) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    Object.entries(attrs).forEach(([key, value]) => circle.setAttribute(key, value));
    svg.appendChild(circle);
  };

  if (name === 'dollarSign') {
    appendPath('M12 3v18');
    appendPath('M16 7H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H8');
    return svg;
  }

  if (name === 'shieldCheck') {
    appendPath('M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z');
    appendPath('M9 12l2 2 4-4');
    return svg;
  }

  if (name === 'calendarClock') {
    appendRect({ x: '3', y: '5', width: '14', height: '14', rx: '2' });
    appendPath('M3 9h14M8 3v4M14 3v4');
    appendCircle({ cx: '18', cy: '18', r: '4' });
    appendPath('M18 16.5V18l1 1');
    return svg;
  }

  appendRect({ x: '6', y: '4', width: '12', height: '17', rx: '2' });
  appendPath('M9 4h6v3H9z');
  appendPath('M9 13l2 2 4-4');
  return svg;
}

function appendRelViewModeButton(parent, mode, active, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = relClassNames('rel-segmented__opt', active ? 'is-active' : '');
  button.setAttribute('role', 'radio');
  button.setAttribute('aria-checked', active ? 'true' : 'false');
  button.dataset.viewMode = mode;
  button.textContent = label;
  parent.appendChild(button);
  return button;
}

function appendRelKpi(parent, item = {}) {
  const kpi = document.createElement('div');
  kpi.className = 'rel-kpi';
  if (item.ariaLabel) kpi.setAttribute('aria-label', item.ariaLabel);
  if (item.title) kpi.title = item.title;

  const row = document.createElement('div');
  row.className = 'rel-kpi__row';

  const icon = document.createElement('span');
  icon.className = relClassNames(
    'rel-kpi__icon',
    `rel-kpi__icon--${relText(item.iconTone, 'cyan')}`,
  );
  icon.appendChild(createRelIcon(item.icon || 'clipboardCheck'));

  const value = document.createElement('span');
  value.className = relClassNames('rel-kpi__value', item.valueClass);
  value.textContent = relText(item.value, '---');

  row.append(icon, value);
  kpi.appendChild(row);
  appendRelText(kpi, 'div', 'rel-kpi__label', relText(item.label));
  parent.appendChild(kpi);
  return kpi;
}

function renderRelatorioHeroDom(root, hero = {}) {
  const data = hero || {};
  const kpis = Array.isArray(data.kpis) && data.kpis.length ? data.kpis : [];
  const viewMode =
    data.viewMode === RELATORIO_VIEW_MODES.detailed
      ? RELATORIO_VIEW_MODES.detailed
      : RELATORIO_VIEW_MODES.compact;

  root.replaceChildren();
  root.dataset.reactRelatorioHeroMounted = 'true';

  const brand = document.createElement('div');
  brand.className = 'rel-hero__brand';
  const brandIcon = document.createElement('span');
  brandIcon.className = 'rel-hero__brand-ic';
  brandIcon.setAttribute('aria-hidden', 'true');
  brandIcon.appendChild(createRelIcon('clipboardCheck', 14));
  brand.appendChild(brandIcon);
  appendRelText(brand, 'span', 'rel-hero__brand-label', relText(data.brand, 'Relatorio rapido'));
  root.appendChild(brand);

  const head = document.createElement('div');
  head.className = 'rel-hero__head';
  appendRelText(head, 'h2', 'rel-hero__title', relText(data.title, 'Resumo dos servicos'), {
    id: RELATORIO_PUBLIC_IDS.heroTitle,
  });
  const segmented = document.createElement('div');
  segmented.className = 'rel-segmented';
  segmented.setAttribute('role', 'radiogroup');
  segmented.setAttribute('aria-label', 'Modo de visualizacao');
  appendRelViewModeButton(
    segmented,
    RELATORIO_VIEW_MODES.compact,
    viewMode === RELATORIO_VIEW_MODES.compact,
    'Compacto',
  );
  appendRelViewModeButton(
    segmented,
    RELATORIO_VIEW_MODES.detailed,
    viewMode === RELATORIO_VIEW_MODES.detailed,
    'Detalhado',
  );
  head.appendChild(segmented);
  root.appendChild(head);

  const meta = document.createElement('div');
  meta.className = 'rel-hero__meta';
  appendRelText(meta, 'span', 'rel-hero__meta-period', relText(data.metaText, 'Todo o periodo'));
  if (data.emittedAt) {
    appendRelText(meta, 'span', 'rel-hero__emitted', `Emitido em ${relText(data.emittedAt)}`, {
      ariaLabel: `Emitido em ${relText(data.emittedAt)}`,
    });
  }
  root.appendChild(meta);

  if (data.narrativeText) {
    appendRelText(root, 'p', 'rel-hero__narrative', relText(data.narrativeText));
  }

  appendRelText(root, 'div', 'rel-hero__divider', '', { role: 'presentation' });

  const kpiList = document.createElement('div');
  kpiList.className = 'rel-hero__kpis';
  kpis.forEach((item) => appendRelKpi(kpiList, item));
  root.appendChild(kpiList);

  return root;
}

function buildRelatorioHeroViewModel({
  kpis,
  periodoTxt,
  equipTxt,
  viewMode,
  narrative,
  emittedAt,
  modeCopy,
  context,
}) {
  const dueState = (() => {
    if (kpis.count === 0 || !kpis.nextDue) return 'default';
    if (kpis.nextDue.n < 0) return 'red';
    if (kpis.nextDue.n <= 7) return 'gold';
    return 'default';
  })();

  const dueValue = kpis.count === 0 || !kpis.nextDue ? '—' : Utils.fmtDueRelative(kpis.nextDue.iso);

  // "Tipo mais comum": exibe "N × Tipo"; se tipo muito longo, trunca
  const tipoValue = (() => {
    if (kpis.count === 0 || !kpis.mostCommonType) return '—';
    const nome = kpis.mostCommonType.replace(/^Manutenção\s+/i, '');
    const truncated = nome.length > 20 ? `${nome.slice(0, 20)}…` : nome;
    return `${kpis.mostCommonCount}× ${truncated}`;
  })();

  const tipoTitle =
    kpis.count === 0 || !kpis.mostCommonType
      ? ''
      : `${kpis.mostCommonCount} × ${kpis.mostCommonType}`;

  // Custo total "R$ 0,00" vira "—" pra não ser lido como "serviço gratuito".
  // Prestadores nem sempre registram custos — o hero precisa refletir
  // ausência de dado, não afirmação de zero.
  const hasCusto = kpis.total > 0;
  const custoValue = hasCusto ? Utils.fmtBRL(kpis.total) : '—';
  const custoAriaLabel = hasCusto
    ? `Custo total: ${Utils.fmtBRL(kpis.total)}`
    : 'Custo total não registrado no período';

  const contextMeta = [
    context?.cliente?.nome ? `Cliente: ${context.cliente.nome}` : null,
    context?.setor?.nome ? `Setor: ${context.setor.nome}` : null,
    context?.equipamento?.nome ? `Equipamento: ${context.equipamento.nome}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const metaText = contextMeta || `${periodoTxt} · ${equipTxt}`;

  const items = [
    {
      key: 'records',
      icon: 'clipboardCheck',
      iconTone: 'cyan',
      value: String(kpis.count),
      label: 'Registros',
      ariaLabel: `Registros: ${kpis.count}`,
    },
  ];

  if (hasCusto) {
    items.push({
      key: 'total',
      icon: 'dollarSign',
      iconTone: 'cyan',
      value: custoValue,
      label: 'Custo total',
      ariaLabel: custoAriaLabel,
    });
  }

  if (kpis.mostCommonType) {
    items.push({
      key: 'type',
      icon: 'shieldCheck',
      iconTone: 'cyan',
      value: tipoValue,
      valueClass: 'rel-kpi__value--compact',
      label: 'Tipo mais comum',
      title: tipoTitle || undefined,
    });
  }

  if (kpis.nextDue) {
    items.push({
      key: 'nextDue',
      icon: 'calendarClock',
      iconTone: dueState === 'red' ? 'red' : dueState === 'gold' ? 'gold' : 'cyan',
      value: dueValue,
      valueClass: `rel-kpi__value--${dueState}`,
      label: 'Próx. vencimento',
      ariaLabel: `Próximo vencimento: ${dueValue}`,
    });
  }

  return {
    brand: modeCopy.heroBrand,
    title: modeCopy.heroTitle,
    metaText,
    emittedAt,
    narrativeText: narrative?.text || '',
    viewMode,
    kpis: items,
  };
}

function buildRelatorioControlsViewModel({
  modeCopy,
  viewMode,
  isPro,
  context,
  filters,
  advancedOpen,
  equipamentos,
  reportSummary,
}) {
  const modeSegmentActive = context?.cliente ? 'cliente' : context?.setor ? 'setor' : 'servicos';
  const equipOptions = (Array.isArray(equipamentos) ? equipamentos : []).map((equipamento) => ({
    id: equipamento?.id || '',
    label: `${equipamento?.nome || '-'} - ${equipamento?.local || '-'}`,
  }));

  return {
    pageTitle: modeCopy.pageTitle,
    pageSubtitle: modeCopy.pageSubtitle,
    viewMode,
    isPro,
    advancedOpen,
    modeSegmentActive,
    equipOptions,
    filters: {
      equipId: filters.equipId || '',
      de: filters.de || '',
      ate: filters.ate || '',
      hasPeriodoFilter: filters.hasPeriodoFilter,
      hasEquipFilter: filters.hasEquipFilter,
      periodoTxt: filters.periodoTxt,
      equipTxt: filters.equipTxt,
    },
    reportSummary,
  };
}

function buildRelatorioCardsViewModel({
  list,
  viewMode,
  hoje,
  singleEquipFilter,
  expandedIds,
  showCorretivasBanner,
  corretivasCount,
  proximasAcoes,
}) {
  return {
    today: hoje,
    viewMode,
    isEmpty: !list.length,
    showCorretivasBanner,
    corretivasBanner: showCorretivasBanner
      ? {
          count: corretivasCount,
          total: list.length,
          pct: list.length > 0 ? Math.round((corretivasCount / list.length) * 100) : 0,
        }
      : null,
    proximasAcoes: proximasAcoes.map((item) => ({
      equipNome: item.equipNome,
      dateText: Utils.formatDate(item.proximaIso),
      tone: item.tone,
      label: item.label,
    })),
    records: list.map((r) =>
      buildRelatorioRecordViewModel({
        r,
        eq: findEquip(r.equipId),
        expanded: expandedIds.has(r.id),
        singleEquipFilter,
      }),
    ),
  };
}

function buildRelatorioRecordViewModel({ r, eq, expanded, singleEquipFilter }) {
  const tipoMeta = TIPO_META[r.tipo] || DEFAULT_TIPO_META;
  const safeStatus = Utils.safeStatus(r.status);
  const statusTone = STATUS_TONE[safeStatus] || 'ok';

  const custoPecas = parseFloat(r.custoPecas) || 0;
  const custoMao = parseFloat(r.custoMaoObra) || 0;
  const custoTotal = custoPecas + custoMao;
  const isCostZero = custoTotal <= 0;

  const nProx = r.proxima ? Utils.daysUntil(r.proxima) : null;
  const proxTone = nProx == null ? null : nProx < 0 ? 'red' : nProx <= 7 ? 'gold' : 'default';

  const equipNome = eq?.nome || r.equipNome || '—';
  const equipTag = eq?.tag || '—';
  const equipLocal = eq?.local || '—';
  const equipFluido = eq?.fluido || '—';
  const equipCriticidade = CRITICIDADE_LABEL[eq?.criticidade] || CRITICIDADE_LABEL.media;
  const equipPrioridade =
    PRIORIDADE_OPERACIONAL_LABEL[eq?.prioridadeOperacional] || PRIORIDADE_OPERACIONAL_LABEL.normal;
  const equipRotina = eq?.periodicidadePreventivaDias
    ? `${eq.periodicidadePreventivaDias} dias`
    : '—';
  const dadosPlacaRows = formatDadosPlacaRows(eq?.dadosPlaca);

  const equipmentSpecs = [
    { label: 'Equipamento', value: equipNome },
    { label: 'TAG', value: equipTag, mono: true },
    { label: 'Local', value: equipLocal },
    { label: 'Fluido', value: equipFluido },
    { label: 'Criticidade', value: equipCriticidade },
    { label: 'Prior. operacional', value: equipPrioridade },
    { label: 'Rotina', value: equipRotina },
    ...dadosPlacaRows.map((row) => ({
      label: row.label,
      value: row.value,
      mono: Boolean(row.mono),
    })),
  ];

  return {
    id: r.id,
    title: r.tipo || 'Outro',
    tipoTone: tipoMeta.tone,
    tipoIcon: tipoMeta.icon,
    statusTone,
    statusLabel: REL_STATUS_LABEL[statusTone] || REL_STATUS_LABEL.ok,
    dateText: Utils.fmtDateTimeShort(r.data),
    relativeText: Utils.getRelativeTime(r.data),
    singleEquipFilter,
    equipName: equipNome,
    equipTag,
    technician: r.tecnico || '—',
    cost: isCostZero
      ? null
      : {
          totalText: Utils.fmtBRL(custoTotal),
          partsText: Utils.fmtBRL(custoPecas),
          laborText: Utils.fmtBRL(custoMao),
        },
    signature: buildRelatorioSignatureViewModel(r),
    equipmentSpecs,
    pecas: r.pecas || '',
    proxima: r.proxima
      ? {
          dateText: Utils.formatDate(r.proxima),
          tone: proxTone,
          label: Utils.fmtDueRelative(r.proxima),
        }
      : null,
    pmocContext: buildContextualPmocReportSummary({
      registro: r,
      equipamento: eq,
      formatDate: (value) => Utils.formatDate(value),
      formatDueRelative: (value) => Utils.fmtDueRelative(value),
    }),
    obs: r.obs || '',
    expanded,
  };
}

function buildRelatorioSignatureViewModel(registro) {
  if (!registro?.assinatura) {
    return { state: 'none' };
  }
  const dataUrl = getSafeSignatureUrl(getSignatureForRecord(registro.id));
  if (!dataUrl) {
    return { state: 'unavailable' };
  }
  return {
    state: 'available',
    recordId: registro.id,
    clienteNome: registro.clienteNome?.trim() || 'cliente',
    dataUrl,
  };
}

function mountRelatorioHero({ root, hero }) {
  if (!root) return null;
  root.classList.add('rel-hero');
  const renderGeneration = (relatorioHeroRenderGeneration += 1);

  if (renderGeneration !== relatorioHeroRenderGeneration) return null;
  return renderRelatorioHeroDom(root, hero);
}

function mountRelatorioControls({ root, controls }) {
  if (!root) return null;
  const renderGeneration = (relatorioControlsRenderGeneration += 1);

  if (renderGeneration !== relatorioControlsRenderGeneration) return null;
  return renderRelatorioControls(root, { controls });
}

function mountRelatorioCards({ root, cards }) {
  if (!root) return null;
  const renderGeneration = (relatorioCardsRenderGeneration += 1);

  if (renderGeneration !== relatorioCardsRenderGeneration) return null;
  return renderRelatorioCards(root, { cards });
}

function getSafeSignatureUrl(value) {
  const url = String(value || '').trim();
  if (/^data:image\/(?:png|jpe?g|gif|webp|bmp|avif);base64,/i.test(url)) return url;
  return null;
}

// ──────────────────────────────────────────────────────────────────────
// Handlers wiring (idempotente: chamado a cada render)
// ──────────────────────────────────────────────────────────────────────
function wireHandlers({ registros, equipamentos, expandedIds, viewMode, rerender }) {
  const view = Utils.getEl('view-relatorio');
  if (!view) return;

  ['rel-equip', 'rel-de', 'rel-ate'].forEach((id) => {
    const input = Utils.getEl(id);
    input?.addEventListener('change', async () => rerender(), { once: true });
  });

  // Segmented control (compact/detailed)
  view.querySelectorAll('[data-view-mode]').forEach((btn) => {
    btn.addEventListener(
      'click',
      async () => {
        const v = btn.dataset.viewMode;
        if (v !== viewMode) {
          setStoredViewMode(v);
          // Detailed expands all, compact collapses all — align w/ user expectation
          if (v === VIEW_MODE_DETAILED) {
            registros.forEach((r) => expandedIds.add(r.id));
          } else {
            expandedIds.clear();
          }
          await rerender();
        }
      },
      { once: true },
    );
  });

  // Toggle advanced filter disclosure
  view.querySelectorAll('[data-action="rel-toggle-advanced"]').forEach((btn) => {
    btn.addEventListener(
      'click',
      async () => {
        const adv = Utils.getEl('rel-filters-advanced');
        if (!adv) return;
        const willOpen = adv.hasAttribute('hidden');
        if (willOpen) {
          adv.removeAttribute('hidden');
        } else {
          adv.setAttribute('hidden', '');
        }
        // Atualiza aria-expanded dos chips
        view.querySelectorAll('[data-action="rel-toggle-advanced"]').forEach((c) => {
          c.setAttribute('aria-expanded', String(willOpen));
        });
        // Re-renderiza chips pra trocar o label "Mais filtros" <-> "Fechar filtros"
        // (não precisa refazer o hero ou records, mas é mais simples re-render completo)
        await rerender({ keepAdvancedOpen: willOpen });
      },
      { once: true },
    );
  });

  // Clear filters
  view.querySelectorAll('[data-action="rel-clear-filters"]').forEach((btn) => {
    btn.addEventListener(
      'click',
      async () => {
        Utils.setVal('rel-equip', '');
        Utils.setVal('rel-de', '');
        Utils.setVal('rel-ate', '');
        await rerender();
      },
      { once: true },
    );
  });

  // Disclosure per card
  view.querySelectorAll('[data-rel-action="rel-toggle-card"]').forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        const id = btn.dataset.id;
        if (!id) return;
        if (expandedIds.has(id)) {
          expandedIds.delete(id);
        } else {
          expandedIds.add(id);
        }
        rerender();
      },
      { once: true },
    );
  });

  // Signature thumb → viewer modal
  view.querySelectorAll('[data-action="rel-view-signature"]').forEach((btn) => {
    btn.addEventListener(
      'click',
      () => {
        const id = btn.dataset.id;
        if (!id) return;
        const registro = registros.find((r) => r.id === id);
        if (!registro) return;
        const eq = equipamentos.find((e) => e.id === registro.equipId);
        SignatureViewerModal.open(registro, { equipNome: eq?.nome || '—' });
      },
      { once: true },
    );
  });
}

// ──────────────────────────────────────────────────────────────────────
// Public: renderRelatorio
// ──────────────────────────────────────────────────────────────────────

// expandedIds vive entre re-renders da MESMA entrada na view.
// Recriar a cada navegação previne leak entre registros diferentes.
const expandedIds = new Set();

export function renderRelatorio(options = {}) {
  const { equipamentos, registros, clientes = [], setores = [] } = getState();
  const { equipId: filtEq, de, ate } = readRelatorioFilters(options);

  const controlsRootEl = Utils.getEl('rel-controls-root');
  const corpoEl = Utils.getEl('relatorio-corpo');
  const companyPmocEl = Utils.getEl('rel-company-pmoc-slot');
  if (!corpoEl) return;
  if (companyPmocEl) companyPmocEl.textContent = '';

  const hoje = new Date().toLocaleDateString('pt-BR');
  const viewMode = getStoredViewMode();
  const isPro = getCachedPlan() === PLAN_CODE_PRO;
  const hasEquipFilter = Boolean(filtEq);
  const equipFiltrado = hasEquipFilter ? equipamentos.find((e) => e.id === filtEq) : null;
  const initialContext = buildReportContext({ isPro, equipFiltrado, clientes, setores });
  const pmocSummary = initialContext.cliente?.id
    ? getPmocSummaryForCliente({
        clienteId: initialContext.cliente.id,
        year: new Date().getFullYear(),
        equipamentos,
        registros,
      })
    : null;
  const reportViewModel = buildRelatorioViewModel({
    registros,
    equipamentos,
    clientes,
    setores,
    filters: { equipId: filtEq, de, ate },
    isPro,
    viewMode,
    context: initialContext,
    pmocSummary,
    daysUntil: (iso) => Utils.daysUntil(iso),
    formatDueRelative: (iso) => Utils.fmtDueRelative(iso),
    formatShortDateRange: (from, to) => Utils.fmtShortDateRange(from, to),
  });
  const {
    records: list,
    filters: { periodoTxt, equipTxt, singleEquipFilter },
    modeCopy,
    context,
    kpis,
    narrative,
    corretivasCount,
    showCorretivasBanner,
    proximasAcoes,
  } = reportViewModel;

  // Se mode=detailed, garante que todos estão expandidos (respeitando toggle individual durante a sessão)
  if (viewMode === VIEW_MODE_DETAILED) {
    list.forEach((r) => expandedIds.add(r.id));
  }

  const advancedEl = Utils.getEl('rel-filters-advanced');
  const advancedOpen =
    options.keepAdvancedOpen ?? (!isPro ? true : !(advancedEl?.hasAttribute('hidden') ?? true));

  const rerender = (opts = {}) => renderRelatorio(opts);

  const renderContent = () => {
    const controlsViewModel = buildRelatorioControlsViewModel({
      modeCopy,
      viewMode,
      isPro,
      context,
      filters: reportViewModel.filters,
      advancedOpen,
      equipamentos,
      reportSummary: reportViewModel.reportSummary,
    });
    const controlsMountResult = mountRelatorioControls({
      root: controlsRootEl,
      controls: controlsViewModel,
    });

    const cardsViewModel = buildRelatorioCardsViewModel({
      list,
      viewMode,
      hoje,
      singleEquipFilter,
      expandedIds,
      showCorretivasBanner,
      corretivasCount,
      proximasAcoes,
    });

    const bindHandlers = () => {
      PdfQuotaBadge.refresh();
      return wireHandlers({
        registros,
        equipamentos,
        expandedIds,
        viewMode,
        rerender,
      });
    };

    const mountHeroAndBind = () => {
      const heroEl = Utils.getEl('rel-hero');
      if (!heroEl) {
        bindHandlers();
        return null;
      }

      const heroViewModel = buildRelatorioHeroViewModel({
        kpis,
        periodoTxt,
        equipTxt,
        viewMode,
        narrative,
        emittedAt: hoje,
        modeCopy,
        context,
      });
      const heroMountResult = mountRelatorioHero({ root: heroEl, hero: heroViewModel });
      if (heroMountResult && typeof heroMountResult.then === 'function') {
        return heroMountResult.then(bindHandlers);
      }
      bindHandlers();
      return null;
    };

    const mountCardsThenHeroAndBind = () => {
      const cardsMountResult = mountRelatorioCards({
        root: corpoEl,
        cards: cardsViewModel,
      });
      if (cardsMountResult && typeof cardsMountResult.then === 'function') {
        return cardsMountResult.then(mountHeroAndBind);
      }
      return mountHeroAndBind();
    };

    if (controlsMountResult && typeof controlsMountResult.then === 'function') {
      return controlsMountResult.then(mountCardsThenHeroAndBind);
    }
    return mountCardsThenHeroAndBind();
  };

  return withSkeleton(
    corpoEl,
    { enabled: true, variant: 'report', count: Math.min(Math.max(list.length, 3), 4) },
    renderContent,
  );
}
