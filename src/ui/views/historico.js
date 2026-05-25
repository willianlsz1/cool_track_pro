/**
 * CoolTrack Pro - Histórico View v5.2
 * Port do mockup aprovado para a tela de historico.
 */

import { Utils } from '../../core/utils.js';
import { getState, findEquip, setState } from '../../core/state.js';
import { Storage } from '../../core/storage.js';
import { Toast } from '../../core/toast.js';
import { goTo } from '../../core/router.js';
import { SavedHighlight } from '../components/onboarding.js';
import { withSkeleton } from '../components/skeleton.js';
import { HistoricoFiltersSheet } from '../components/historicoFiltersSheet.js';
import { updateGlobalHeader } from '../composables/header.js';
import { getOperationalStatus } from '../../core/equipmentRules.js';
import {
  buildHistoricoRenderState,
  buildHistoricoRenderViewModel,
  buildHistoricoTimelineRenderContext,
} from './historico/helpers/render/renderHelpers.js';
import {
  buildHistoricoCurrentFiltersFromValues,
  mergeHistoricoDomCacheFilters,
  normalizeHistoricoFilterCache,
  parseHistoricoUrlFilters,
} from './historico/helpers/filters/filterHelpers.js';
import {
  closeHistoricoCardMenus,
  toggleHistoricoCardMenu,
} from './historico/helpers/actions/cardMenuHelpers.js';
import { buildHistoricoDeleteStateMutation } from './historico/helpers/delete/deleteHelpers.js';
import {
  HISTORICO_ACTIONS,
  HISTORICO_PERIOD_OPTIONS,
  HISTORICO_TIPO_OPTIONS,
} from '../viewModels/historicoContracts.js';
import { buildHistoricoViewModel } from '../viewModels/historicoViewModel.js';
import {
  asArray,
  buildHistoricoTimelineDomViewModel,
  getAttentionItems,
  getEquipStatusPill,
  getHistInsights,
  getProximaStatus,
  getRecurringEquips,
  getTodaySummary,
} from './historico/timelineViewModel.js';
import {
  mountHistoricoFiltersDom,
  unmountHistoricoFiltersDom,
} from './historico/filtersRenderer.js';
import {
  mountHistoricoTimelineDom,
  unmountHistoricoTimelineDom,
} from './historico/timelineRenderer.js';

export {
  getAttentionItems,
  getEquipStatusPill,
  getHistInsights,
  getProximaStatus,
  getRecurringEquips,
  getTodaySummary,
};

// Historico e parte do core operacional e nao tem corte por data nesta etapa.

// Filtros auxiliares persistem na sessão — desaparecem ao fechar o app (intencional).
const HIST_PERIOD_KEY = 'cooltrack-hist-period';
const HIST_TIPO_KEY = 'cooltrack-hist-tipo';
const HIST_SUMMARY_COLLAPSED_KEY = 'cooltrack-hist-summary-collapsed';

// Helper de UA mobile-ish para decidir default colapsado.
// Não confiamos só em viewport — touch + viewport <= 720px = mobile.
function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(max-width: 720px)').matches;
  } catch {
    return (window.innerWidth || 0) <= 720;
  }
}

function getSummaryCollapsedDefault() {
  return isMobileViewport();
}

function hasOperationalHistoricoAccess() {
  return true;
}

function isSummaryCollapsed() {
  try {
    const raw = sessionStorage.getItem(HIST_SUMMARY_COLLAPSED_KEY);
    if (raw === '1') return true;
    if (raw === '0') return false;
    return getSummaryCollapsedDefault();
  } catch {
    return getSummaryCollapsedDefault();
  }
}

function setSummaryCollapsed(value) {
  try {
    sessionStorage.setItem(HIST_SUMMARY_COLLAPSED_KEY, value ? '1' : '0');
  } catch {
    /* sessionStorage indisponivel: ignora */
  }
}

// Mapa de query param -> id do select/input no DOM. Usamos URLSearchParams
// como source-of-truth on-load (deep linking) e replaceState on-change
// (mantem URL atualizada sem inflar o history).
const URL_PARAM_KEYS = {
  busca: 'q',
  setor: 'setor',
  equip: 'equip',
  periodo: 'periodo',
  tipo: 'tipo',
};

const HIST_FILTER_DOM_IDS = {
  busca: 'hist-busca',
  setor: 'hist-setor',
  equip: 'hist-equip',
};

let _urlFiltersHydrated = false;
// Filtro "Cliente: X" vindo da view /clientes -> "Ver serviços". Reset toda
// vez que o user limpa via chip, ou navega pra histórico sem clienteId nos
// query params. Persistente apenas dentro da sessão (não na URL).
let _clienteFilter = { id: null, nome: null };
let _historicoTimelineRenderGeneration = 0;
let _historicoFiltersRenderGeneration = 0;
let _histSearchRenderTimer = null;
let _histFilterValues = { busca: '', setor: '', equip: '' };

function readHistoricoFilterDomValue(id) {
  const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
  return el ? el.value || '' : null;
}

function readHistoricoFilterDomValues() {
  return {
    busca: readHistoricoFilterDomValue(HIST_FILTER_DOM_IDS.busca),
    setor: readHistoricoFilterDomValue(HIST_FILTER_DOM_IDS.setor),
    equip: readHistoricoFilterDomValue(HIST_FILTER_DOM_IDS.equip),
  };
}

function readHistoricoFilterCache() {
  return { ..._histFilterValues };
}

function writeHistoricoFilterCache(filters = {}) {
  _histFilterValues = normalizeHistoricoFilterCache(filters);
}

function buildHistoricoDomCacheFilters() {
  const domValues = readHistoricoFilterDomValues();
  const cachedValues = readHistoricoFilterCache();
  return mergeHistoricoDomCacheFilters(domValues, cachedValues);
}

function setHistoricoDomFilterValue(id, value) {
  const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
  if (el) el.value = value || '';
  return el;
}

function clearHistoricoDomFilterValue(id) {
  return setHistoricoDomFilterValue(id, '');
}

function clearHistoricoMainFilterDomValues() {
  clearHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.setor);
  clearHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.equip);
  clearHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.busca);
}

function captureHistoricoFilterValues() {
  writeHistoricoFilterCache(buildHistoricoDomCacheFilters());
}

export function unmountHistoricoTimeline() {
  _historicoTimelineRenderGeneration += 1;
  if (typeof document === 'undefined') return null;

  const root = document.getElementById('timeline');
  if (!root?.dataset.historicoTimelineMounted) return null;
  unmountHistoricoTimelineDom(root);
  return null;
}

export function unmountHistoricoFilters() {
  _historicoFiltersRenderGeneration += 1;
  if (_histSearchRenderTimer) {
    clearTimeout(_histSearchRenderTimer);
    _histSearchRenderTimer = null;
  }
  if (typeof document === 'undefined') return null;

  captureHistoricoFilterValues();

  const root = document.getElementById('hist-filters-root');
  if (!root?.dataset.historicoFiltersMounted) return null;
  unmountHistoricoFiltersDom(root);
  return null;
}

function readUrlFilters() {
  if (typeof window === 'undefined') return {};
  try {
    return parseHistoricoUrlFilters(new URLSearchParams(window.location.search), URL_PARAM_KEYS);
  } catch {
    return {};
  }
}

// Aplica filtros vindos da URL nos inputs/selects/sessionStorage. So roda
// uma vez por sessão do view (flag _urlFiltersHydrated). Apos hydrate,
// sessionStorage e DOM viram source-of-truth e a URL é atualizada por write.
function applyHistoricoUrlFiltersToDom(filters = {}) {
  if (filters.busca) setHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.busca, filters.busca);
  if (filters.setor) setHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.setor, filters.setor);
  if (filters.equip) setHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.equip, filters.equip);
}

function applyHistoricoUrlFiltersToSession(filters = {}) {
  if (filters.periodo) {
    setExtraFilter(HIST_PERIOD_KEY, filters.periodo === 'tudo' ? '' : filters.periodo);
  }
  if (filters.tipo) setExtraFilter(HIST_TIPO_KEY, filters.tipo);
}

function hydrateFiltersFromUrl() {
  if (_urlFiltersHydrated) return;
  _urlFiltersHydrated = true;
  const f = readUrlFilters();
  if (!Object.values(f).some(Boolean)) return;

  applyHistoricoUrlFiltersToDom(f);
  applyHistoricoUrlFiltersToSession(f);
}

function writeFiltersToUrl({ busca, setor, equip, periodo, tipo }) {
  if (typeof window === 'undefined') return;
  try {
    const sp = new URLSearchParams(window.location.search);
    const setOrDelete = (key, value) => {
      if (value) sp.set(key, value);
      else sp.delete(key);
    };
    setOrDelete(URL_PARAM_KEYS.busca, busca);
    setOrDelete(URL_PARAM_KEYS.setor, setor);
    setOrDelete(URL_PARAM_KEYS.equip, equip);
    setOrDelete(URL_PARAM_KEYS.periodo, periodo === 'tudo' ? '' : periodo);
    setOrDelete(URL_PARAM_KEYS.tipo, tipo);
    const qs = sp.toString();
    const newUrl = window.location.pathname + (qs ? '?' + qs : '') + (window.location.hash || '');
    if (newUrl !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState(null, '', newUrl);
    }
  } catch {
    /* não crucial: se replaceState falhar, app segue funcionando sem deep link */
  }
}

const PERIOD_OPTIONS = HISTORICO_PERIOD_OPTIONS;
const TIPO_OPTIONS = HISTORICO_TIPO_OPTIONS;

function readHistoricoSessionFilters() {
  try {
    const period = sessionStorage.getItem(HIST_PERIOD_KEY) || 'tudo';
    const tipo = sessionStorage.getItem(HIST_TIPO_KEY) || '';
    return { period, tipo };
  } catch (_error) {
    return { period: 'tudo', tipo: '' };
  }
}

function getExtraFilters() {
  return readHistoricoSessionFilters();
}

function writeHistoricoSessionFilter(key, value) {
  try {
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
  } catch (_error) {
    /* sessionStorage indisponível (iOS privacy mode) — ignora silenciosamente */
  }
}

function setExtraFilter(key, value) {
  writeHistoricoSessionFilter(key, value);
}

function clearHistoricoSessionFilters() {
  setExtraFilter(HIST_PERIOD_KEY, '');
  setExtraFilter(HIST_TIPO_KEY, '');
}

function ensureHistoricoFiltersRoot() {
  let root = document.getElementById('hist-filters-root');
  if (root) return root;

  const stickyHeader = document.getElementById('hist-sticky-header');
  if (!stickyHeader?.parentNode) return null;

  root = document.createElement('div');
  root.id = 'hist-filters-root';
  stickyHeader.parentNode.insertBefore(root, stickyHeader);
  root.appendChild(stickyHeader);

  const chipsSlot = document.getElementById('hist-active-chips-slot');
  if (chipsSlot) root.appendChild(chipsSlot);

  const chronoLabel = document.getElementById('hist-chrono-label');
  if (chronoLabel) root.appendChild(chronoLabel);

  return root;
}

function buildHistoricoFiltersDomViewModel({
  historicoVm,
  equipamentos,
  setores,
  busca,
  filtEq,
  filtSetor,
  period,
  tipo,
}) {
  const setoresComDados = new Set(
    asArray(equipamentos)
      .map((e) => e?.setorId)
      .filter(Boolean),
  );
  const clienteChip = historicoVm.clienteFilter?.nome
    ? [
        {
          key: 'Cliente',
          value: historicoVm.clienteFilter.nome,
          clearAction: HISTORICO_ACTIONS.clearClienteFilter,
        },
      ]
    : [];

  return {
    countLabel: historicoVm.countLabel,
    filters: {
      busca,
      setorId: filtSetor,
      equipId: filtEq,
      period,
      tipo,
    },
    filtersCount: [filtSetor, filtEq, tipo].filter(Boolean).length,
    setorOptions: asArray(setores).map((setor) => ({
      id: setor?.id || '',
      label: `${setor?.nome || ''}${setoresComDados.has(setor?.id) ? '' : ' (sem registros)'}`,
    })),
    equipamentoOptions: asArray(equipamentos).map((equipamento) => ({
      id: equipamento?.id || '',
      label: `${equipamento?.nome || '—'} — ${equipamento?.local || '—'}`,
    })),
    periodOptions: PERIOD_OPTIONS,
    tipoOptions: TIPO_OPTIONS,
    activeChips: [...clienteChip, ...asArray(historicoVm.activeChips)],
    showSetorSelect: asArray(setores).length > 0,
  };
}

/** Popula o select de setor e controla sua visibilidade. */
function syncSetorSelect(currentSetorId) {
  const state = getState() || {};
  const setores = asArray(state.setores);
  const equipamentos = asArray(state.equipamentos);
  const el = Utils.getEl('hist-setor');
  if (!el) return;

  el.style.display = setores.length ? '' : 'none';
  if (!setores.length) return;

  const prev = currentSetorId ?? el.value;
  el.textContent = '';
  const defOpt = document.createElement('option');
  defOpt.value = '';
  defOpt.textContent = 'Todos os setores';
  el.appendChild(defOpt);

  const setoresComDados = new Set(equipamentos.map((e) => e.setorId).filter(Boolean));
  setores.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.nome + (setoresComDados.has(s.id) ? '' : ' (sem registros)');
    el.appendChild(opt);
  });

  if (prev) el.value = prev;
}

// ──────────────────────────────────────────────────────────────────────
// Public: renderHist
// ──────────────────────────────────────────────────────────────────────

/**
 * Setter público chamado pela rota histórico quando o usuário chega via
 * /clientes -> "Ver serviços" (params.clienteId presente). Limpa quando
 * chamado sem args.
 */
export function setHistClienteFilter({ id = null, nome = null } = {}) {
  _clienteFilter = { id, nome };
}

export function clearHistClienteFilter() {
  _clienteFilter = { id: null, nome: null };
}

function buildHistoricoCurrentFilters() {
  const domCacheFilters = buildHistoricoDomCacheFilters();
  const { filters, cacheFilters } = buildHistoricoCurrentFiltersFromValues({
    domCacheFilters,
    sessionFilters: getExtraFilters(),
  });

  writeHistoricoFilterCache(cacheFilters);
  return filters;
}

function buildHistoricoRenderFilters() {
  return buildHistoricoCurrentFilters();
}
function mountHistoricoFiltersRenderer({ filtersRoot, filtersViewModel, filtersGeneration }) {
  if (!filtersRoot) return null;
  if (filtersGeneration !== _historicoFiltersRenderGeneration) return null;

  return mountHistoricoFiltersDom(filtersRoot, { viewModel: filtersViewModel });
}

function normalizeHistoricoMountResult(result) {
  return result && typeof result.then === 'function' ? result : Promise.resolve(result);
}

function renderHistoricoFiltersRenderer({ historicoVm, equipamentos, setores, filters }) {
  const filtersRoot = ensureHistoricoFiltersRoot();
  const filtersViewModel = buildHistoricoFiltersDomViewModel({
    historicoVm,
    equipamentos,
    setores,
    busca: filters.busca,
    filtEq: filters.filtEq,
    filtSetor: filters.filtSetor,
    period: filters.period,
    tipo: filters.tipo,
  });
  const filtersGeneration = (_historicoFiltersRenderGeneration += 1);
  const filtersMountResult = mountHistoricoFiltersRenderer({
    filtersRoot,
    filtersViewModel,
    filtersGeneration,
  });

  return normalizeHistoricoMountResult(filtersMountResult);
}

function syncHistoricoAfterTimelineMount({
  filtersReady,
  timelineRoot,
  scrollRoot,
  prevScrollTop,
}) {
  return filtersReady.then(() => {
    attachFilterHandlers(timelineRoot);

    if (prevScrollTop > 0) {
      requestAnimationFrame(() => {
        if (scrollRoot) scrollRoot.scrollTop = prevScrollTop;
        else window.scrollTo(0, prevScrollTop);
      });
    }

    if (SavedHighlight.applyIfPending()) {
      Toast.success('Serviço registrado.');
    }
  });
}

function mountHistoricoTimelineRenderer({
  timelineRoot,
  timelineViewModel,
  renderGeneration,
  afterMount,
}) {
  if (renderGeneration !== _historicoTimelineRenderGeneration) return null;
  const mounted = mountHistoricoTimelineDom(timelineRoot, {
    viewModel: timelineViewModel,
  });
  return afterMount().then(() => mounted);
}

function renderHistoricoTimelineRenderer({
  timelineRoot,
  list,
  timelineContext,
  filters,
  filtersReady,
  scrollRoot,
  prevScrollTop,
  isProMode,
  renderGeneration,
}) {
  if (renderGeneration !== _historicoTimelineRenderGeneration) return null;

  const timelineViewModel = buildHistoricoTimelineDomViewModel({
    list,
    todaySummary: timelineContext.todaySummary,
    attentionItems: timelineContext.attentionItems,
    equipamentos: timelineContext.equipamentos,
    setoresById: timelineContext.setoresById,
    clientesById: timelineContext.clientesById,
    isProMode,
    currentFilterEquipId: filters.filtEq || '',
    hasFilters: timelineContext.hasFilters,
    findEquipById: findEquip,
  });

  const afterMount = () =>
    syncHistoricoAfterTimelineMount({
      filtersReady,
      timelineRoot,
      scrollRoot,
      prevScrollTop,
    });

  return mountHistoricoTimelineRenderer({
    timelineRoot,
    timelineViewModel,
    renderGeneration,
    afterMount,
  });
}

function renderHistoricoTimelineWithSkeleton({
  timelineRoot,
  list,
  timelineContext,
  filters,
  filtersReady,
  scrollRoot,
  prevScrollTop,
  isProMode,
}) {
  const renderGeneration = (_historicoTimelineRenderGeneration += 1);

  return withSkeleton(
    timelineRoot,
    { enabled: true, variant: 'timeline', count: Math.min(Math.max(list.length, 3), 5) },
    () =>
      renderHistoricoTimelineRenderer({
        timelineRoot,
        list,
        timelineContext,
        filters,
        filtersReady,
        scrollRoot,
        prevScrollTop,
        isProMode,
        renderGeneration,
      }),
  );
}

export function renderHist() {
  // Le filtros da URL na primeira vez que o view é renderizado por sessão.
  // Suporta deep linking: ?periodo=7d&setor=xyz aplica filtros direto.
  hydrateFiltersFromUrl();

  const { registros, equipamentos, setores, clientes } = buildHistoricoRenderState(
    getState() || {},
  );
  syncSetorSelect();

  const filters = buildHistoricoRenderFilters();
  const isProMode = hasOperationalHistoricoAccess();
  const { historicoVm, list } = buildHistoricoRenderViewModel({
    registros,
    equipamentos,
    setores,
    clientes,
    filters: {
      busca: filters.busca,
      equipId: filters.filtEq,
      setorId: filters.filtSetor,
      period: filters.period,
      tipo: filters.tipo,
    },
    clienteFilter: _clienteFilter,
    isProMode,
    buildHistoricoViewModel,
  });

  // Filtros de período, tipo, cliente, setor, equipamento e busca agora ficam
  // no view model; o adapter segue responsável por DOM, URL, handlers e render.

  const timelineRoot = Utils.getEl('timeline');
  if (!timelineRoot) return;

  const scrollRoot = document.scrollingElement || document.documentElement;
  const prevScrollTop = scrollRoot ? scrollRoot.scrollTop : window.scrollY;

  // Sincroniza URL apos cada render. URLSearchParams omite chaves vazias,
  // entao ?busca=foo&periodo=7d nunca vira ?busca=&periodo=&setor=&equip=&tipo=.
  writeFiltersToUrl({
    busca: filters.busca,
    setor: filters.filtSetor,
    equip: filters.filtEq,
    periodo: filters.period,
    tipo: filters.tipo,
  });

  const filtersReady = renderHistoricoFiltersRenderer({
    historicoVm,
    equipamentos,
    setores,
    filters,
  });

  const timelineContext = buildHistoricoTimelineRenderContext({
    registros,
    equipamentos,
    setores,
    clientes,
    filters,
    isProMode,
    getTodaySummary,
    getAttentionItems,
  });

  return renderHistoricoTimelineWithSkeleton({
    timelineRoot,
    list,
    timelineContext,
    filters,
    filtersReady,
    scrollRoot,
    prevScrollTop,
    isProMode,
  });
}

// ──────────────────────────────────────────────────────────────────────
// Handlers (re-attach em cada render)
// ──────────────────────────────────────────────────────────────────────

function handleHistoricoCardMenuClick(container, event) {
  const toggle = event.target.closest('[data-hist-action="toggle-card-menu"]');
  if (toggle) {
    event.preventDefault();
    toggleHistoricoCardMenu(container, toggle);
    return;
  }
  if (!event.target.closest('.hist-item-actions__menu')) {
    closeHistoricoCardMenus(container);
  }
}

function handleHistoricoCardMenuKeydown(container, event) {
  if (event.key !== 'Escape') return;
  const open = container.querySelector('.hist-item-actions__menu:not([hidden])');
  if (!open) return;
  open.hidden = true;
  const toggle = open.parentElement?.querySelector('[data-hist-action="toggle-card-menu"]');
  if (toggle) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }
}

function bindHistoricoCardMenuDelegation(container) {
  if (container.dataset.histBound) return;
  container.dataset.histBound = '1';
  container.addEventListener('click', (event) => {
    handleHistoricoCardMenuClick(container, event);
  });
  container.addEventListener('keydown', (event) => {
    handleHistoricoCardMenuKeydown(container, event);
  });
}

function bindHistoricoCardLocalActions() {}

function attachFilterHandlers(container) {
  // Toggle do card de Insights (collapsed/expanded). Persiste a escolha em
  // sessionStorage para a sessão. Re-renderiza pra trocar o estado visual.
  const summaryToggle = container.querySelector('[data-hist-action="toggle-summary"]');
  if (summaryToggle) {
    summaryToggle.addEventListener('click', () => {
      const next = !isSummaryCollapsed();
      setSummaryCollapsed(next);
      renderHist();
    });
  }

  // Atualiza badge de contagem de filtros ativos no botao Filtros (mobile).
  // Conta apenas filtros que ficam dentro do sheet: setor, equipamento, tipo.
  // Quick-filters (periodo) não contam aqui pq tem chips visiveis no header.
  const filtersTrigger = document.getElementById('hist-filters-trigger');
  const filtersCount = document.getElementById('hist-filters-count');
  if (filtersTrigger && filtersCount) {
    const { setor, equip } = readHistoricoFilterDomValues();
    const { tipo } = getExtraFilters();
    const count = [setor, equip, tipo].filter(Boolean).length;
    if (count > 0) {
      filtersCount.textContent = String(count);
      filtersCount.hidden = false;
      filtersTrigger.classList.add('is-active');
    } else {
      filtersCount.hidden = true;
      filtersTrigger.classList.remove('is-active');
    }
  }

  const searchInput = document.getElementById('hist-busca');
  if (searchInput && !searchInput.dataset.histBound) {
    searchInput.dataset.histBound = '1';
    searchInput.addEventListener('input', () => {
      if (_histSearchRenderTimer) clearTimeout(_histSearchRenderTimer);
      _histSearchRenderTimer = setTimeout(() => {
        _histSearchRenderTimer = null;
        renderHist();
      }, 280);
    });
  }

  const setorSelect = document.getElementById('hist-setor');
  if (setorSelect && !setorSelect.dataset.histBound) {
    setorSelect.dataset.histBound = '1';
    setorSelect.addEventListener('change', () => {
      clearHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.equip);
      renderHist();
    });
  }

  const equipSelect = document.getElementById('hist-equip');
  if (equipSelect && !equipSelect.dataset.histBound) {
    equipSelect.dataset.histBound = '1';
    equipSelect.addEventListener('change', () => {
      renderHist();
    });
  }

  // Toggle do kebab menu nos cards. Click no kebab abre/fecha esse card.
  // Click fora ou em outro kebab fecha o anterior. ESC fecha também.
  // Gate dataset.histBound: container (#timeline) persiste entre renders;
  // sem o gate, addEventListener seria chamado N vezes apos N renders e
  // geraria cascata de cliques (=> congelamento ao clicar em algo).
  bindHistoricoCardMenuDelegation(container);

  // Handler do botao Filtros — mesmo gate (filtersTrigger persiste no DOM).
  if (filtersTrigger && !filtersTrigger.dataset.histBound) {
    filtersTrigger.dataset.histBound = '1';
    filtersTrigger.addEventListener('click', () => {
      const { setores, equipamentos } = getState();
      const { tipo } = getExtraFilters();
      HistoricoFiltersSheet.open({
        setores,
        equipamentos: equipamentos.map((e) => ({
          id: e.id,
          nome: e.nome,
          setorId: e.setorId,
        })),
        tipoOptions: TIPO_OPTIONS,
        initial: {
          setor: readHistoricoFilterDomValue(HIST_FILTER_DOM_IDS.setor) || '',
          equip: readHistoricoFilterDomValue(HIST_FILTER_DOM_IDS.equip) || '',
          tipo,
        },
        onApply: ({ setor, equip, tipo: newTipo }) => {
          // Aplica os valores nos selects ocultos (a logica existente os le).
          const setorEl = setHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.setor, setor);
          const equipEl = document.getElementById(HIST_FILTER_DOM_IDS.equip);
          if (setorEl) {
            // Re-sincroniza opções de equipamento se setor mudou
            syncSetorSelect(setor);
            setHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.equip, equip);
          } else if (equipEl) {
            setHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.equip, equip);
          }
          setExtraFilter(HIST_TIPO_KEY, newTipo);
          renderHist();
        },
        onReset: () => {
          clearHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.setor);
          clearHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.equip);
          setExtraFilter(HIST_TIPO_KEY, '');
          renderHist();
        },
      });
    });
  }

  const { registros = [], equipamentos = [] } = getState() || {};

  // Handlers vivem em múltiplos containers agora (slots fora do #timeline).
  // Usamos document.querySelectorAll pra capturar tudo — é seguro porque cada
  // re-render substitui o innerHTML dos slots, removendo listeners antigos.
  const roots = [
    container,
    Utils.getEl('hist-quickfilters-slot'),
    Utils.getEl('hist-active-chips-slot'),
  ].filter(Boolean);

  const each = (selector, fn) => {
    roots.forEach((root) => {
      root.querySelectorAll(selector).forEach((node) => {
        if (node.dataset.histBound) return;
        node.dataset.histBound = '1';
        fn(node);
      });
    });
  };

  each('[data-hist-action="hist-filter-period"]', (btn) =>
    btn.addEventListener('click', () => {
      const pid = btn.dataset.period;
      setExtraFilter(HIST_PERIOD_KEY, pid === 'tudo' ? '' : pid);
      renderHist();
    }),
  );

  each('[data-hist-action="hist-filter-tipo"]', (btn) =>
    btn.addEventListener('click', () => {
      const current = getExtraFilters().tipo;
      const next = current === btn.dataset.tipoId ? '' : btn.dataset.tipoId;
      setExtraFilter(HIST_TIPO_KEY, next);
      renderHist();
    }),
  );

  each('[data-hist-action="hist-clear-period"]', (btn) =>
    btn.addEventListener('click', () => {
      setExtraFilter(HIST_PERIOD_KEY, '');
      renderHist();
    }),
  );

  each('[data-hist-action="hist-clear-tipo"]', (btn) =>
    btn.addEventListener('click', () => {
      setExtraFilter(HIST_TIPO_KEY, '');
      renderHist();
    }),
  );

  // "Ver tudo deste equipamento" — navega pra aba Equipamentos focando o
  // setor correto E abre o modal de detalhes do equipamento (#modal-eq-det).
  // Sequência:
  //   1. goTo('equipamentos', { equipCtx: { sectorId } }) — troca a rota,
  //      renderEquip executa e popula o setor correto;
  //   2. requestAnimationFrame + import dinâmico pra chamar viewEquip(id),
  //      que monta o HTML do modal-eq-det e abre via Modal.open.
  // Sem o requestAnimationFrame o modal seria construído antes do renderEquip
  // terminar, podendo abrir sobre uma tela "intermediária".
  each('[data-hist-action="hist-filter-equip"]', (btn) =>
    btn.addEventListener('click', () => {
      const equipId = btn.dataset.equipId || '';
      if (!equipId) return;
      const eq = equipamentos.find((it) => it.id === equipId);
      const sectorId = eq?.setorId || null;
      goTo('equipamentos', sectorId ? { equipCtx: { sectorId } } : {});
      requestAnimationFrame(() => {
        import('./equipamentos.js')
          .then((mod) => mod.viewEquip && mod.viewEquip(equipId))
          .catch(() => {
            /* falha no import não deve travar a navegacao — o usuário
               pelo menos já esta na aba certa, focado no setor */
          });
      });
    }),
  );

  each('[data-hist-action="hist-clear-setor"]', (btn) =>
    btn.addEventListener('click', () => {
      clearHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.setor);
      renderHist();
    }),
  );

  each('[data-hist-action="hist-clear-equip"]', (btn) =>
    btn.addEventListener('click', () => {
      clearHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.equip);
      renderHist();
    }),
  );

  each('[data-hist-action="hist-clear-busca"]', (btn) =>
    btn.addEventListener('click', () => {
      clearHistoricoDomFilterValue(HIST_FILTER_DOM_IDS.busca);
      renderHist();
    }),
  );

  // Limpa o filtro "Cliente: X" injetado por /clientes -> Ver serviços.
  // Reseta o state e re-renderiza pra remover o chip.
  each('[data-hist-action="clear-cliente-filter"]', (btn) =>
    btn.addEventListener('click', () => {
      clearHistClienteFilter();
      renderHist();
    }),
  );

  each('[data-hist-action="hist-clear-all"]', (btn) =>
    btn.addEventListener('click', () => {
      clearHistoricoSessionFilters();
      clearHistoricoMainFilterDomValues();
      renderHist();
    }),
  );

  bindHistoricoCardLocalActions({ each, registros, equipamentos });
}

// ──────────────────────────────────────────────────────────────────────
// Public: deleteReg
// ──────────────────────────────────────────────────────────────────────

function persistHistoricoRegistroDeletion(id) {
  Storage.markRegistroDeleted(id);
}

function applyHistoricoDeleteStateMutation(id) {
  setState((prev) =>
    buildHistoricoDeleteStateMutation(prev, id, {
      getOperationalStatus,
      daysDiff: (date) => Utils.daysDiff(date),
    }),
  );
}

function refreshHistoricoAfterDelete() {
  renderHist();
  updateGlobalHeader();
}

function notifyHistoricoDeleteSuccess() {
  Toast.warning('Registro removido do histórico.');
}

export function deleteReg(id) {
  persistHistoricoRegistroDeletion(id);
  applyHistoricoDeleteStateMutation(id);
  refreshHistoricoAfterDelete();
  notifyHistoricoDeleteSuccess();
}
