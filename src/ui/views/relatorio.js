import { Utils } from '../../core/utils.js';
import { getState, findEquip } from '../../core/state.js';
import { getCachedPlan } from '../../core/plans/planCache.js';
import { withSkeleton } from '../components/skeleton.js';
import { CRITICIDADE_LABEL, PRIORIDADE_OPERACIONAL_LABEL } from '../../domain/maintenance.js';
import { formatDadosPlacaRows } from '../../domain/dadosPlacaDisplay.js';
import { PdfQuotaBadge } from '../components/pdfQuotaBadge.js';
import { getSignatureForRecord, SignatureViewerModal } from '../components/signature.js';
import { getPmocSummaryForCliente } from '../../core/pmocProgress.js';
import { RELATORIO_PLAN_CODES, RELATORIO_VIEW_MODES } from '../viewModels/relatorioContracts.js';
import { buildReportContext, buildRelatorioViewModel } from '../viewModels/relatorioViewModel.js';

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
let relatorioHeroBridgePromise = null;
let relatorioHeroBridge = null;
let relatorioHeroRenderGeneration = 0;
let relatorioControlsBridgePromise = null;
let relatorioControlsBridge = null;
let relatorioControlsRenderGeneration = 0;
let relatorioCardsBridgePromise = null;
let relatorioCardsBridge = null;
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

function loadRelatorioHeroBridge() {
  if (relatorioHeroBridge) return Promise.resolve(relatorioHeroBridge);
  if (!relatorioHeroBridgePromise) {
    relatorioHeroBridgePromise = import('../../react/entrypoints/relatorioHeroIsland.jsx')
      .then((bridge) => {
        relatorioHeroBridge = bridge;
        return bridge;
      })
      .catch((error) => {
        relatorioHeroBridgePromise = null;
        throw error;
      });
  }
  return relatorioHeroBridgePromise;
}

function loadRelatorioControlsBridge() {
  if (relatorioControlsBridge) return Promise.resolve(relatorioControlsBridge);
  if (!relatorioControlsBridgePromise) {
    relatorioControlsBridgePromise = import('../../react/entrypoints/relatorioControlsIsland.jsx')
      .then((bridge) => {
        relatorioControlsBridge = bridge;
        return bridge;
      })
      .catch((error) => {
        relatorioControlsBridgePromise = null;
        throw error;
      });
  }
  return relatorioControlsBridgePromise;
}

function loadRelatorioCardsBridge() {
  if (relatorioCardsBridge) return Promise.resolve(relatorioCardsBridge);
  if (!relatorioCardsBridgePromise) {
    relatorioCardsBridgePromise = import('../../react/entrypoints/relatorioCardsIsland.jsx')
      .then((bridge) => {
        relatorioCardsBridge = bridge;
        return bridge;
      })
      .catch((error) => {
        relatorioCardsBridgePromise = null;
        throw error;
      });
  }
  return relatorioCardsBridgePromise;
}

export function unmountRelatorioHero() {
  relatorioHeroRenderGeneration += 1;
  if (typeof document === 'undefined') return null;

  const root = document.getElementById('rel-hero');
  if (!root?.dataset.reactRelatorioHeroMounted) return null;

  if (relatorioHeroBridge?.unmountRelatorioHeroReact) {
    relatorioHeroBridge.unmountRelatorioHeroReact(root);
    return null;
  }

  return loadRelatorioHeroBridge().then((bridge) => {
    bridge.unmountRelatorioHeroReact?.(root);
  });
}

export function unmountRelatorioControls() {
  relatorioControlsRenderGeneration += 1;
  if (typeof document === 'undefined') return null;

  rememberRelatorioFiltersFromDom();
  const root = document.getElementById('rel-controls-root');
  if (!root?.dataset.reactRelatorioControlsMounted) return null;

  if (relatorioControlsBridge?.unmountRelatorioControlsReact) {
    relatorioControlsBridge.unmountRelatorioControlsReact(root);
    return null;
  }

  return loadRelatorioControlsBridge().then((bridge) => {
    bridge.unmountRelatorioControlsReact?.(root);
  });
}

export function unmountRelatorioCards() {
  relatorioCardsRenderGeneration += 1;
  if (typeof document === 'undefined') return null;

  const root = document.getElementById('relatorio-corpo');
  if (!root?.dataset.reactRelatorioCardsMounted) return null;

  if (relatorioCardsBridge?.unmountRelatorioCardsReact) {
    relatorioCardsBridge.unmountRelatorioCardsReact(root);
    return null;
  }

  return loadRelatorioCardsBridge().then((bridge) => {
    bridge.unmountRelatorioCardsReact?.(root);
  });
}

// tone = classe CSS .rel-tipo--<tone> (cores no components.css)
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

// ícones inline (stroke 1.6, currentColor) — usa o mesmo kit visual da UI
const ICON_SVG = {
  shieldCheck:
    '<path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
  droplets:
    '<path d="M8 4c1.2 2.5 4 6 4 9a4 4 0 1 1-8 0c0-3 2.8-6.5 4-9z"/><path d="M16 10c.9 1.9 3 4.6 3 7a3 3 0 1 1-6 0c0-2.4 2.1-5.1 3-7z"/>',
  zap: '<path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/>',
  wrench:
    '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2.4-2.4 2.3-2.3z"/>',
  flask:
    '<path d="M10 3h4"/><path d="M11 3v6l-5 9a2 2 0 0 0 2 3h8a2 2 0 0 0 2-3l-5-9V3"/><path d="M7 14h10"/>',
  tool: '<path d="M20 7a4 4 0 0 1-5 5l-7 7-3-3 7-7a4 4 0 0 1 5-5l-2.5 2.5 1.5 1.5L19 8l1-1z"/>',
  clipboardCheck:
    '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 13l2 2 4-4"/>',
  dollarSign: '<path d="M12 3v18"/><path d="M16 7H10a2.5 2.5 0 0 0 0 5h4a2.5 2.5 0 0 1 0 5H8"/>',
  calendarClock:
    '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M3 9h14M8 3v4M14 3v4"/><circle cx="18" cy="18" r="4"/><path d="M18 16.5V18l1 1"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  tag: '<path d="M3 12l9-9h8v8l-9 9-8-8z"/><circle cx="15.5" cy="8.5" r="1.2"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  edit2: '<path d="M14 4l6 6-12 12H2v-6L14 4z"/>',
  snowflake:
    '<path d="M12 2v20M2 12h20"/><path d="M5 5l14 14M19 5L5 19"/><path d="M12 5l-2-2M12 5l2-2M12 19l-2 2M12 19l2 2M5 12l-2-2M5 12l-2 2M19 12l2-2M19 12l2 2"/>',
  arrowRight: '<path d="M9 6l6 6-6 6"/>',
};

function icon(name, size = 14) {
  const inner = ICON_SVG[name] || ICON_SVG.tool;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

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
function buildRelatorioHeroReactViewModel({
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

function buildRelatorioControlsReactViewModel({
  modeCopy,
  viewMode,
  isPro,
  context,
  filters,
  advancedOpen,
  equipamentos,
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
  };
}

function buildRelatorioCardsReactViewModel({
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
      buildRelatorioRecordReactViewModel({
        r,
        eq: findEquip(r.equipId),
        expanded: expandedIds.has(r.id),
        singleEquipFilter,
      }),
    ),
  };
}

function buildRelatorioRecordReactViewModel({ r, eq, expanded, singleEquipFilter }) {
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
    signature: buildRelatorioSignatureReactViewModel(r),
    equipmentSpecs,
    pecas: r.pecas || '',
    proxima: r.proxima
      ? {
          dateText: Utils.formatDate(r.proxima),
          tone: proxTone,
          label: Utils.fmtDueRelative(r.proxima),
        }
      : null,
    obs: r.obs || '',
    expanded,
  };
}

function buildRelatorioSignatureReactViewModel(registro) {
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

  const mountWithBridge = (bridge) => {
    if (renderGeneration !== relatorioHeroRenderGeneration) return null;
    return bridge.mountRelatorioHeroReact(root, { hero });
  };

  if (relatorioHeroBridge?.mountRelatorioHeroReact) {
    return mountWithBridge(relatorioHeroBridge);
  }

  return loadRelatorioHeroBridge().then(mountWithBridge);
}

function mountRelatorioControls({ root, controls }) {
  if (!root) return null;
  const renderGeneration = (relatorioControlsRenderGeneration += 1);

  const mountWithBridge = (bridge) => {
    if (renderGeneration !== relatorioControlsRenderGeneration) return null;
    return bridge.mountRelatorioControlsReact(root, { controls });
  };

  if (relatorioControlsBridge?.mountRelatorioControlsReact) {
    return mountWithBridge(relatorioControlsBridge);
  }

  return loadRelatorioControlsBridge().then(mountWithBridge);
}

function mountRelatorioCards({ root, cards }) {
  if (!root) return null;
  const renderGeneration = (relatorioCardsRenderGeneration += 1);

  const mountWithBridge = (bridge) => {
    if (renderGeneration !== relatorioCardsRenderGeneration) return null;
    return bridge.mountRelatorioCardsReact(root, { cards });
  };

  if (relatorioCardsBridge?.mountRelatorioCardsReact) {
    return mountWithBridge(relatorioCardsBridge);
  }

  return loadRelatorioCardsBridge().then(mountWithBridge);
}

function renderModeSegment({ isPro, context }) {
  if (!isPro) return '';
  const active = context.cliente ? 'cliente' : context.setor ? 'setor' : 'servicos';
  const option = (key, label) =>
    `<span class="rel-mode-segment__item${active === key ? ' is-active' : ''}">${label}</span>`;
  return `
    <div class="rel-mode-segment" role="group" aria-label="Contexto dos relatórios">
      ${option('servicos', 'Serviços')}
      ${option('cliente', 'Cliente')}
      ${option('setor', 'Setor')}
      ${option('pmoc', 'PMOC')}
    </div>
  `;
}

function renderCompanyPmocBlock({ isPro, hasPmocAttention }) {
  if (!isPro) return '';
  return `
    <section class="rel-company-pmoc" aria-label="PMOC da empresa">
      <div class="rel-company-pmoc__head">
        <h3>PMOC</h3>
        ${
          hasPmocAttention
            ? `<span class="rel-company-pmoc__alert">PMOC precisa de atenção</span>`
            : ''
        }
      </div>
      <p class="rel-company-pmoc__desc">Documento anual com cronograma, evidências e assinaturas.</p>
      <div class="rel-company-pmoc__actions">
        <button type="button" class="btn btn--primary btn--sm" data-action="open-pmoc-modal">Gerar PMOC formal</button>
        ${
          hasPmocAttention
            ? '<button type="button" class="btn btn--ghost btn--sm" data-nav="clientes">Ver pendências</button>'
            : ''
        }
      </div>
    </section>
  `;
}

// ──────────────────────────────────────────────────────────────────────
// Filter chips
// ──────────────────────────────────────────────────────────────────────
function renderFilterChips({
  periodoTxt,
  equipTxt,
  hasPeriodoFilter,
  hasEquipFilter,
  advancedOpen,
  isPro,
}) {
  const anyActive = hasPeriodoFilter || hasEquipFilter;
  const periodoChip = `
    <button type="button" class="rel-chip${hasPeriodoFilter ? ' is-active' : ''}"
      data-action="rel-toggle-advanced" aria-expanded="${advancedOpen}" aria-controls="rel-filters-advanced">
      <span class="rel-chip__icon">${icon('calendar', 12)}</span>
      <span class="rel-chip__label">${Utils.escapeHtml(hasPeriodoFilter ? periodoTxt : 'Todo período')}</span>
    </button>
  `;
  const equipChip = `
    <button type="button" class="rel-chip${hasEquipFilter ? ' is-active' : ''}"
      data-action="rel-toggle-advanced" aria-expanded="${advancedOpen}" aria-controls="rel-filters-advanced">
      <span class="rel-chip__icon">${icon('tag', 12)}</span>
      <span class="rel-chip__label">${Utils.escapeHtml(hasEquipFilter ? equipTxt : 'Todos os equipamentos')}</span>
    </button>
  `;
  const newFilterChip = `
    <button type="button" class="rel-chip rel-chip--dashed"
      data-action="rel-toggle-advanced" aria-expanded="${advancedOpen}" aria-controls="rel-filters-advanced">
      <span class="rel-chip__icon">${icon(advancedOpen ? 'x' : 'plus', 12)}</span>
      <span class="rel-chip__label">${advancedOpen ? 'Fechar filtros' : isPro ? 'Mais filtros' : 'Mais opções'}</span>
    </button>
  `;
  const clearBtn = anyActive
    ? `<button type="button" class="rel-chip__clear" data-action="rel-clear-filters">
         ${icon('x', 12)} <span>Limpar filtros</span>
       </button>`
    : '';
  return `${periodoChip}${equipChip}${isPro ? newFilterChip : ''}${clearBtn}`;
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
  const chipsEl = Utils.getEl('rel-filters-chips');
  const corpoEl = Utils.getEl('relatorio-corpo');
  const pageTitleEl = Utils.getEl('rel-main-title');
  const pageSubtitleEl = Utils.getEl('rel-main-subtitle');
  const modeSegmentEl = Utils.getEl('rel-mode-segment-slot');
  const companyPmocEl = Utils.getEl('rel-company-pmoc-slot');
  if (!corpoEl) return;

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
    filters: { hasPeriodoFilter, periodoTxt, equipTxt, singleEquipFilter },
    modeCopy,
    context,
    hasPmocAttention,
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
    if (companyPmocEl)
      companyPmocEl.innerHTML = renderCompanyPmocBlock({ isPro, hasPmocAttention });

    const controlsViewModel = buildRelatorioControlsReactViewModel({
      modeCopy,
      viewMode,
      isPro,
      context,
      filters: reportViewModel.filters,
      advancedOpen,
      equipamentos,
    });
    const controlsMountResult = mountRelatorioControls({
      root: controlsRootEl,
      controls: controlsViewModel,
    });

    if (!controlsRootEl) {
      if (pageTitleEl) pageTitleEl.textContent = modeCopy.pageTitle;
      if (pageSubtitleEl) pageSubtitleEl.textContent = modeCopy.pageSubtitle;
      if (modeSegmentEl) modeSegmentEl.innerHTML = renderModeSegment({ isPro, context });
      if (advancedEl) {
        if (advancedOpen) advancedEl.removeAttribute('hidden');
        else advancedEl.setAttribute('hidden', '');
      }

      const pmocMainItem = Utils.getEl('rel-dd-pmoc-main');
      const pmocInfoItem = Utils.getEl('rel-dd-pmoc-info');
      if (pmocMainItem && pmocInfoItem) {
        if (isPro) {
          pmocMainItem.removeAttribute('hidden');
          pmocInfoItem.removeAttribute('hidden');
        } else {
          pmocMainItem.setAttribute('hidden', '');
          pmocInfoItem.setAttribute('hidden', '');
        }
      }

      const pmocNudgeItem = Utils.getEl('rel-dd-pmoc-nudge');
      if (pmocNudgeItem) {
        if (isPro) {
          pmocNudgeItem.setAttribute('hidden', '');
        } else {
          pmocNudgeItem.removeAttribute('hidden');
        }
      }

      if (chipsEl) {
        chipsEl.innerHTML = renderFilterChips({
          periodoTxt,
          equipTxt,
          hasPeriodoFilter,
          hasEquipFilter,
          advancedOpen,
          isPro,
        });
      }
    }

    const cardsViewModel = buildRelatorioCardsReactViewModel({
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

      const heroViewModel = buildRelatorioHeroReactViewModel({
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
