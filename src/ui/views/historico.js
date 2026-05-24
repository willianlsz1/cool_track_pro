/**
 * CoolTrack Pro - Histórico View v5.2
 * Port do mockup do Claude Design (docs/design/prompts/04-histórico-redesign.md).
 *
 * Estrutura de render:
 *   - #hist-quickfilters-slot  → pílulas de período + tipo (row scrollable)
 *   - #hist-active-chips-slot  → chips removíveis dos filtros ativos
 *   - #timeline                → hero summary + plan banner + items (.timeline__item)
 *
 * Funções expostas: renderHist, deleteReg
 */

import { Utils } from '../../core/utils.js';
import { getState, findEquip, setState } from '../../core/state.js';
import { Storage } from '../../core/storage.js';
import { Toast } from '../../core/toast.js';
import { goTo } from '../../core/router.js';
import { SavedHighlight } from '../components/onboarding.js';
import { Photos } from '../components/photos.js';
import { withSkeleton } from '../components/skeleton.js';
import { HistoricoFiltersSheet } from '../components/historicoFiltersSheet.js';
import { updateGlobalHeader } from '../composables/header.js';
import { getOperationalStatus } from '../../core/equipmentRules.js';
import { isCachedPlanPro } from '../../core/plans/planCache.js';
import { buildClientePmocDetails } from '../../core/clientePmoc.js';
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
  mountHistoricoFiltersDom,
  unmountHistoricoFiltersDom,
} from './historico/filtersRenderer.js';
import {
  mountHistoricoTimelineDom,
  unmountHistoricoTimelineDom,
} from './historico/timelineRenderer.js';

// Histórico é parte do core do produto e não tem corte por data em nenhum
// plano — Free, Plus e Pro veem todos os registros salvos. Outros limites
// do Free (equipamentos, PDFs, WhatsApp share) permanecem via plan cache.

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

// ──────────────────────────────────────────────────────────────────────
// URL persistence dos filtros
// ──────────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

function toNumber(value) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function getSafeMediaUrl(value) {
  const url = String(value || '').trim();
  if (!url) return null;
  if (/^data:image\/(?:png|jpe?g|gif|webp|bmp|avif);base64,/i.test(url)) return url;
  if (/^(https?:|blob:)/i.test(url)) return url;
  if (/^(\/(?!\/)|\.\/|\.\.\/)/.test(url)) return url;
  return null;
}

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatBRLMoney(value) {
  // Variante com 2 casas pra breakdown (R$ 120,00).
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getPhotoUrl(photo) {
  if (!photo) return null;
  const raw = typeof photo === 'string' ? photo : photo.url || photo.src || photo.dataUrl || null;
  return getSafeMediaUrl(raw);
}

/**
 * Tempo relativo curto pra contexto de lista. "há 2h", "ontem", "há 3 dias".
 */
/**
 * Normaliza o `tipo` free-form pra uma das categorias coloridas + label.
 */
function getTypePillInfo(tipo) {
  const normalized = (tipo || '').toLowerCase().trim();
  if (!normalized) return { color: 'cyan', label: '—' };

  for (const opt of TIPO_OPTIONS) {
    if (opt.match.some((keyword) => normalized.includes(keyword))) {
      return { color: opt.color, label: tipo };
    }
  }
  return { color: 'cyan', label: tipo };
}

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

function getSummaryMetrics(list) {
  const totalServicos = list.length;
  const custoTotal = list.reduce(
    (acc, reg) => acc + toNumber(reg.custoPecas) + toNumber(reg.custoMaoObra),
    0,
  );
  const preventivas = list
    .filter((reg) => (reg.tipo || '').trim().toLowerCase().includes('preventiva'))
    .sort((a, b) => a.data.localeCompare(b.data));

  let mediaDiasPreventiva = null;
  if (preventivas.length >= 2) {
    const intervals = [];
    for (let i = 1; i < preventivas.length; i += 1) {
      const previous = new Date(preventivas[i - 1].data);
      const current = new Date(preventivas[i].data);
      const diffMs = current.getTime() - previous.getTime();
      if (!Number.isNaN(diffMs) && diffMs > 0) intervals.push(diffMs / (1000 * 60 * 60 * 24));
    }
    if (intervals.length) {
      mediaDiasPreventiva = Math.round(
        intervals.reduce((acc, val) => acc + val, 0) / intervals.length,
      );
    }
  }

  return { totalServicos, custoTotal, mediaDiasPreventiva };
}

/**
 * Insights do período — extensão do getSummaryMetrics pra alimentar a segunda
 * linha do summary card. Fica puro / sem DOM pra ser testável.
 *
 * - preventivasCount / corretivasCount: contagem por match no `tipo`.
 * - equipsAtendidos: cardinalidade de equipIds únicos no período.
 * - equipsAtencao: quantos desses equipamentos estão com `status` warn/danger
 *   (status vem de equipmentRules.getOperationalStatus, já populado no state).
 */
export function getHistInsights(list, equipamentos = []) {
  const equipsAtendidosSet = new Set();
  let preventivasCount = 0;
  let corretivasCount = 0;

  list.forEach((reg) => {
    if (reg.equipId) equipsAtendidosSet.add(reg.equipId);
    const tipoNorm = (reg.tipo || '').toLowerCase();
    if (tipoNorm.includes('preventiva')) preventivasCount += 1;
    if (tipoNorm.includes('corretiva')) corretivasCount += 1;
  });

  const equipsById = new Map((equipamentos || []).map((e) => [e.id, e]));
  let equipsAtencao = 0;
  equipsAtendidosSet.forEach((equipId) => {
    const eq = equipsById.get(equipId);
    const status = (eq?.status || '').toLowerCase();
    if (status === 'warn' || status === 'danger') equipsAtencao += 1;
  });

  return {
    preventivasCount,
    corretivasCount,
    equipsAtendidos: equipsAtendidosSet.size,
    equipsAtencao,
  };
}

/**
 * Detecção determinística de equipamentos com alta recorrência — usada no
 * summary card pra sinalizar "olha aqui, tá saindo do padrão". Não chama
 * LLM nem tenta diagnosticar causa: só aponta o fato.
 *
 * @param {Array} list registros já filtrados pelo período ativo
 * @param {number} days janela em dias (default 14)
 * @param {number} threshold mínimo de registros no mesmo equip pra contar (default 3)
 * @returns {Array<{equipId: string, count: number}>}
 */
export function getRecurringEquips(list, days = 14, threshold = 3) {
  if (!Array.isArray(list) || !list.length) return [];
  const cutoffMs = Date.now() - days * 86400000;
  const byEquip = new Map();
  list.forEach((reg) => {
    if (!reg.equipId || !reg.data) return;
    const ts = new Date(reg.data).getTime();
    if (!Number.isFinite(ts) || ts < cutoffMs) return;
    byEquip.set(reg.equipId, (byEquip.get(reg.equipId) || 0) + 1);
  });
  return Array.from(byEquip.entries())
    .filter(([, count]) => count >= threshold)
    .map(([equipId, count]) => ({ equipId, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Converte dias até a próxima manutenção em um estado visual acionável.
 * Usa Utils.daysDiff (dias relativos a hoje, negativo=passado).
 *
 * - vencida: data no passado → vermelho ("Vencida há X dias")
 * - hoje: data é hoje → âmbar ("Vence hoje")
 * - próxima: ≤7 dias no futuro → âmbar ("Vence em X dias")
 * - distante: >7 dias no futuro → neutro ("Próxima em X dias")
 */
export function getProximaStatus(proximaIso) {
  if (!proximaIso) return null;
  const diasRaw = Utils.daysDiff(String(proximaIso).slice(0, 10));
  if (!Number.isFinite(diasRaw)) return null;

  if (diasRaw < 0) {
    const abs = Math.abs(diasRaw);
    return {
      tone: 'danger',
      label: `Vencida há ${abs} ${abs === 1 ? 'dia' : 'dias'}`,
      days: diasRaw,
    };
  }
  if (diasRaw === 0) {
    return { tone: 'warn', label: 'Vence hoje', days: 0 };
  }
  if (diasRaw <= 7) {
    return {
      tone: 'warn',
      label: `Vence em ${diasRaw} ${diasRaw === 1 ? 'dia' : 'dias'}`,
      days: diasRaw,
    };
  }
  return {
    tone: 'neutral',
    label: `Próxima em ${diasRaw} dias`,
    days: diasRaw,
  };
}

/**
 * Label humanizado pro status operacional do equipamento. Prefere o
 * `statusDescricao` já calculado pelo equipmentRules (se existir), senão
 * cai num default curto coerente com o tone.
 */
export function getEquipStatusPill(eq) {
  const status = (eq?.status || '').toLowerCase();
  if (!status) return null;
  const defaultLabels = {
    ok: 'Em dia',
    warn: 'Atenção',
    danger: 'Crítico',
  };
  const tone = status === 'danger' ? 'danger' : status === 'warn' ? 'warn' : 'ok';
  const label =
    (eq?.statusDescricao && String(eq.statusDescricao).trim()) || defaultLabels[tone] || 'Em dia';
  return { tone, label };
}

export function getTodaySummary(registros = []) {
  const today = Utils.localDateString();
  const todayRegs = (registros || []).filter((r) => String(r?.data || '').slice(0, 10) === today);
  const equipIds = new Set(todayRegs.map((r) => r?.equipId).filter(Boolean));
  return {
    totalServicosHoje: todayRegs.length,
    totalEquipHoje: equipIds.size,
  };
}

function createAttentionItem({
  id,
  tone = 'warn',
  title,
  reason,
  ctaLabel = 'Resolver',
  equipId = null,
}) {
  return { id, tone, title, reason, ctaLabel, equipId };
}

export function getAttentionItems({
  registros = [],
  equipamentos = [],
  clientes = [],
  setores = [],
  isPro = false,
}) {
  const list = [];
  const byEquip = new Map((equipamentos || []).map((eq) => [eq.id, eq]));
  const latestByEquip = new Map();
  [...(registros || [])]
    .filter((r) => r?.equipId && r?.data)
    .sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')))
    .forEach((r) => {
      if (!latestByEquip.has(r.equipId)) latestByEquip.set(r.equipId, r);
    });

  latestByEquip.forEach((reg, equipId) => {
    const eq = byEquip.get(equipId);
    const prox = getProximaStatus(reg?.proxima);
    const eqName = eq?.nome?.trim() || 'Equipamento';
    if (prox?.tone === 'danger') {
      list.push(
        createAttentionItem({
          id: `proxima-${equipId}`,
          tone: 'danger',
          title: eqName,
          reason: prox.label,
          ctaLabel: 'Resolver',
          equipId,
        }),
      );
    }

    const statusPill = getEquipStatusPill(eq);
    if (statusPill && statusPill.tone !== 'ok') {
      list.push(
        createAttentionItem({
          id: `status-${equipId}`,
          tone: statusPill.tone,
          title: eqName,
          reason: `Status: ${statusPill.label}`,
          ctaLabel: 'Ver equipamento',
          equipId,
        }),
      );
    }
  });

  if (isPro) {
    (clientes || []).forEach((cliente) => {
      const pmoc = buildClientePmocDetails({
        cliente,
        equipamentos,
        registros,
        setores,
        today: Utils.localDateString(),
      });
      if (pmoc.status === 'atrasado' || pmoc.status === 'atencao') {
        list.push(
          createAttentionItem({
            id: `pmoc-${cliente.id}`,
            tone: pmoc.status === 'atrasado' ? 'danger' : 'warn',
            title: cliente?.nome?.trim() || 'Cliente',
            reason: `PMOC ${pmoc.statusLabel.toLowerCase()}`,
            ctaLabel: 'Resolver',
          }),
        );
      }
    });
  }

  return list.slice(0, 6);
}

// Agrupa lista de registros por categoria de data relativa pra renderizar
// headers tipo "Hoje", "Ontem", "Esta semana" entre os grupos.
// Espera lista já ordenada (mais recente primeiro). Retorna lista de grupos
// [{ id, label, items }] preservando a ordem dos items dentro do grupo.
function groupRegistrosByDate(list) {
  const today = Utils.localDateString();
  const todayDate = new Date(today + 'T00:00:00');
  const yesterdayDate = new Date(todayDate.getTime() - 24 * 60 * 60 * 1000);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);
  const dow = todayDate.getDay();
  const daysSinceMonday = dow === 0 ? 6 : dow - 1;
  const weekStartDate = new Date(todayDate.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000);
  const weekStart = weekStartDate.toISOString().slice(0, 10);
  const monthStartDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  const monthStart = monthStartDate.toISOString().slice(0, 10);

  const buckets = [
    { id: 'hoje', label: 'Hoje', items: [] },
    { id: 'ontem', label: 'Ontem', items: [] },
    { id: 'semana', label: 'Esta semana', items: [] },
    { id: 'mes', label: 'Este mês', items: [] },
    { id: 'antigos', label: 'Anteriores', items: [] },
  ];
  const byId = Object.fromEntries(buckets.map((b) => [b.id, b]));

  for (const r of list) {
    const day = (r.data || '').slice(0, 10);
    if (!day) {
      byId.antigos.items.push(r);
      continue;
    }
    if (day === today) byId.hoje.items.push(r);
    else if (day === yesterday) byId.ontem.items.push(r);
    else if (day >= weekStart) byId.semana.items.push(r);
    else if (day >= monthStart) byId.mes.items.push(r);
    else byId.antigos.items.push(r);
  }

  return buckets.filter((b) => b.items.length > 0);
}

// ──────────────────────────────────────────────────────────────────────
// Render blocks
// ──────────────────────────────────────────────────────────────────────

/**
 * Linha fina logo abaixo dos KPIs principais com splits tipicos do período.
 * Só renderiza se houve ao menos 1 serviço — evita mostrar zeros sem sentido.
 */
function renderInsightsRow(insights, hasData) {
  if (!hasData) return '';
  const { preventivasCount, corretivasCount, equipsAtendidos, equipsAtencao } = insights;
  const chips = [];
  if (preventivasCount) {
    chips.push(
      `<span class="hist-summary-card__insight-chip hist-summary-card__insight-chip--cyan">
        <b>${preventivasCount}</b> ${preventivasCount === 1 ? 'preventiva' : 'preventivas'}
      </span>`,
    );
  }
  if (corretivasCount) {
    chips.push(
      `<span class="hist-summary-card__insight-chip hist-summary-card__insight-chip--amber">
        <b>${corretivasCount}</b> ${corretivasCount === 1 ? 'corretiva' : 'corretivas'}
      </span>`,
    );
  }
  if (equipsAtendidos) {
    chips.push(
      `<span class="hist-summary-card__insight-chip">
        <b>${equipsAtendidos}</b> ${equipsAtendidos === 1 ? 'equipamento' : 'equipamentos'}
      </span>`,
    );
  }
  if (equipsAtencao > 0) {
    chips.push(
      `<span class="hist-summary-card__insight-chip hist-summary-card__insight-chip--danger">
        <b>${equipsAtencao}</b> em atenção
      </span>`,
    );
  }
  if (!chips.length) return '';
  return `<div class="hist-summary-card__insights" role="list" aria-label="Splits do período">
    ${chips.join('')}
  </div>`;
}

/**
 * Aviso determinístico: N equipamentos acumularam 3+ serviços em 14 dias.
 * Não diagnostica causa (ambiente sujo / filtro etc) — só aponta o fato e
 * oferece filtro rápido quando é um único equipamento.
 */
function renderRecurringAlert(recurring, equipamentos) {
  if (!Array.isArray(recurring) || !recurring.length) return '';
  const equipsById = new Map((equipamentos || []).map((e) => [e.id, e]));
  const n = recurring.length;

  const ctaBtn =
    n === 1
      ? `<button type="button" class="hist-summary-card__recurring-link"
          data-hist-action="hist-filter-equip" data-equip-id="${Utils.escapeAttr(recurring[0].equipId)}">
          Ver serviços →
        </button>`
      : '';

  const detailText =
    n === 1
      ? `<b>${Utils.escapeHtml(equipsById.get(recurring[0].equipId)?.nome || 'Um equipamento')}</b> acumulou <b>${recurring[0].count}</b> serviços nos últimos 14 dias.`
      : `<b>${n}</b> equipamentos acumularam 3+ serviços nos últimos 14 dias.`;

  return `<div class="hist-summary-card__recurring" role="status" aria-live="polite">
    <span class="hist-summary-card__recurring-ic" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>
      </svg>
    </span>
    <span class="hist-summary-card__recurring-text">${detailText}</span>
    ${ctaBtn}
  </div>`;
}

function _renderSummaryCard(
  list,
  { filtered, activeFilterCount, equipamentos = [], recurring = [] },
) {
  const { totalServicos, custoTotal, mediaDiasPreventiva } = getSummaryMetrics(list);
  const insights = getHistInsights(list, equipamentos);
  const hasData = totalServicos > 0;
  const mediaLabel = mediaDiasPreventiva !== null ? `${mediaDiasPreventiva}` : '—';
  const mediaSuffix =
    mediaDiasPreventiva !== null ? ` <span class="hist-summary-card__kpi-unit">dias</span>` : '';

  const pillLabel = filtered
    ? `${totalServicos} de ${activeFilterCount > 1 ? 'muitos' : '?'} · filtros ativos`
    : 'Insights do período';

  const custoClass = hasData
    ? 'hist-summary-card__kpi-value hist-summary-card__kpi-value--mono'
    : 'hist-summary-card__kpi-value hist-summary-card__kpi-value--mono hist-summary-card__kpi-value--muted';

  const mediaClass =
    hasData && mediaDiasPreventiva !== null
      ? 'hist-summary-card__kpi-value'
      : 'hist-summary-card__kpi-value hist-summary-card__kpi-value--muted';

  const collapsed = isSummaryCollapsed();
  const sectionClass = collapsed
    ? 'hist-summary-card hist-summary-card--collapsed'
    : 'hist-summary-card';
  const expandedAttr = collapsed ? 'false' : 'true';
  const toggleAriaLabel = collapsed ? 'Mostrar insights' : 'Ocultar insights';
  const chevronPath = collapsed ? 'm6 9 6 6 6-6' : 'm18 15-6-6-6 6';

  return `<section class="${sectionClass}" aria-label="Resumo do período">
    <div class="hist-summary-card__orbs" aria-hidden="true">
      <div class="hist-summary-card__orb hist-summary-card__orb--tl"></div>
      <div class="hist-summary-card__orb hist-summary-card__orb--br"></div>
    </div>
    <button type="button" class="hist-summary-card__pill hist-summary-card__pill--toggle"
      data-hist-action="toggle-summary"
      aria-expanded="${expandedAttr}"
      aria-controls="hist-summary-content"
      aria-label="${Utils.escapeHtml(toggleAriaLabel)}">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        ${
          filtered
            ? '<path d="M3 5h18M6 12h12M10 19h4"/>'
            : '<path d="M3 20V10M9 20V4M15 20v-7M21 20v-4"/>'
        }
      </svg>
      <span class="hist-summary-card__pill-label">${Utils.escapeHtml(pillLabel)}</span>
      <svg class="hist-summary-card__pill-chev" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="1.75"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="${chevronPath}"/>
      </svg>
    </button>
    <div class="hist-summary-card__content" id="hist-summary-content" ${collapsed ? 'hidden' : ''}>
    <div class="hist-summary-card__kpis">
      <div class="hist-summary-card__kpi">
        <div class="hist-summary-card__kpi-value">${totalServicos}</div>
        <div class="hist-summary-card__kpi-label">${filtered ? 'Serviços filtrados' : 'Serviços no período'}</div>
      </div>
      <div class="hist-summary-card__kpi-sep" aria-hidden="true">::</div>
      <div class="hist-summary-card__kpi">
        <div class="${custoClass}">${formatBRL(custoTotal)}</div>
        <div class="hist-summary-card__kpi-label">${hasData ? 'Peças + mão de obra' : 'Nenhum custo'}</div>
      </div>
      <div class="hist-summary-card__kpi-sep" aria-hidden="true">::</div>
      <div class="hist-summary-card__kpi">
        <div class="${mediaClass}">${mediaLabel}${mediaSuffix}</div>
        <div class="hist-summary-card__kpi-label">${
          mediaDiasPreventiva !== null ? 'Intervalo médio preventivas' : 'Sem dados ainda'
        }</div>
      </div>
    </div>
    ${renderInsightsRow(insights, hasData)}
    ${renderRecurringAlert(recurring, equipamentos)}
    <div class="hist-summary-card__divider" aria-hidden="true"></div>
    <div class="hist-summary-card__upsell">
      <span class="hist-summary-card__upsell-ic" aria-hidden="true">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/>
        </svg>
      </span>
      <span>Relatórios automáticos serão revistos em etapa própria.</span>
    </div>
    </div>
  </section>`;
}

function getTimelineDateLabel(registro, groupId) {
  const dateInGroupContext = groupId && groupId !== 'antigos';
  if (!dateInGroupContext) return Utils.formatDatetime(registro?.data);

  const date = registro?.data ? new Date(registro.data) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : Utils.formatDatetime(registro?.data);
}

function buildTimelineHeadPills(registro, equipamento) {
  const prioridade = (registro?.prioridade || '').toLowerCase();
  const typePill = getTypePillInfo(registro?.tipo);
  const equipStatusPill = getEquipStatusPill(equipamento);
  const showEquipStatusPill = equipStatusPill && equipStatusPill.tone !== 'ok';
  const showPrioridadePill = prioridade === 'alta' || prioridade === 'baixa';

  return [
    String(registro?.data || '').slice(0, 10) === Utils.localDateString()
      ? { id: 'today', label: 'Hoje', color: 'success' }
      : null,
    showEquipStatusPill
      ? {
          id: 'equip-status',
          label: equipStatusPill.label,
          color: equipStatusPill.tone === 'danger' ? 'red' : 'amber',
          title: 'Status atual do equipamento',
        }
      : null,
    showPrioridadePill
      ? {
          id: 'prioridade',
          label: prioridade === 'alta' ? 'Alta prioridade' : 'Baixa prioridade',
          color: prioridade === 'alta' ? 'red' : 'cyan',
        }
      : null,
    {
      id: 'type',
      label: typePill.label,
      color: typePill.color,
    },
  ].filter(Boolean);
}

function buildTimelineMeta(registro) {
  const chunks = [];
  const custoPecas = toNumber(registro?.custoPecas);
  const custoMao = toNumber(registro?.custoMaoObra);
  const custoTotal = custoPecas + custoMao;

  if (registro?.tecnico) {
    chunks.push({ id: 'tecnico', icon: 'user', text: registro.tecnico });
  }
  if (registro?.pecas) {
    chunks.push({ id: 'pecas', icon: 'box', text: registro.pecas });
  }
  if (custoTotal > 0) {
    chunks.push({
      id: 'custo',
      className: 'meta-mono',
      prefix: 'Total: ',
      highlight: formatBRL(custoTotal),
      highlightClassName: 'meta-cyan',
      details:
        custoPecas > 0 && custoMao > 0
          ? `(peças ${formatBRLMoney(custoPecas)} · mão ${formatBRLMoney(custoMao)})`
          : '',
    });
  }
  if (registro?.proxima) {
    const proxInfo = getProximaStatus(registro.proxima) || {
      tone: 'neutral',
      label: `Próxima: ${Utils.formatDate(registro.proxima)}`,
    };
    chunks.push({
      id: 'proxima',
      icon: 'calendar',
      text: proxInfo.label,
      textClassName:
        proxInfo.tone === 'danger'
          ? 'meta-danger'
          : proxInfo.tone === 'warn'
            ? 'meta-warn'
            : 'meta-neutral',
      title: 'Próxima: ' + Utils.formatDate(registro.proxima),
    });
  }

  return chunks;
}

function buildTimelineItemModel(
  registro,
  {
    isFirst,
    equipamentos,
    setoresById,
    clientesById,
    isPro = false,
    currentFilterEquipId = '',
    groupId = '',
  },
) {
  const eq =
    equipamentos.find((item) => item.id === registro?.equipId) || findEquip(registro?.equipId);
  const setorNome = eq?.setorId ? setoresById.get(eq.setorId)?.nome || '' : '';
  const clienteNome = eq?.clienteId ? clientesById.get(eq.clienteId)?.nome || '' : '';
  const equipTag = (eq?.tag || eq?.local || '').trim();
  const setorTag = setorNome ? setorNome.slice(0, 12).toUpperCase().replace(/\s+/g, ' ') : '';
  const photoUrls = asArray(registro?.fotos).map(getPhotoUrl).filter(Boolean);
  const safeStatus = Utils.safeStatus(registro?.status);

  return {
    id: String(registro?.id || ''),
    equipId: String(registro?.equipId || ''),
    isLatest: Boolean(isFirst),
    status: safeStatus,
    headerDateLabel: getTimelineDateLabel(registro, groupId),
    headPills: buildTimelineHeadPills(registro, eq),
    serviceTitle: (registro?.tipo || 'Serviço').trim(),
    equipmentName: eq?.nome ?? '—',
    setorName: setorNome,
    setorTag,
    equipTag,
    context:
      isPro && (clienteNome || setorNome || eq?.nome)
        ? [clienteNome, setorNome, eq?.nome].filter(Boolean).join(' · ')
        : '',
    obs: registro?.obs || '',
    meta: buildTimelineMeta(registro),
    photoUrls: photoUrls.slice(0, 3),
    extraPhotoCount: Math.max(0, photoUrls.length - 3),
    signature: null,
    showFilterEquip: Boolean(registro?.equipId && currentFilterEquipId !== registro.equipId),
  };
}

function buildTimelineEmptyState(hasFilters) {
  if (hasFilters) {
    return {
      variant: 'default',
      icon: '\u{1f50d}',
      title: 'Nenhum resultado para esse filtro',
      description: 'Tente outro termo ou remova um filtro acima.',
    };
  }

  return {
    variant: 'engaging',
    ariaLabel: 'Histórico vazio',
    icon: '\u{1f4cb}',
    title: 'Nenhum serviço registrado ainda.',
    description: 'Depois do registro, seu histórico aparece aqui.',
    cta: {
      label: 'Registrar primeiro serviço',
      nav: 'registro',
    },
    microcopy: '',
  };
}

function buildHistoricoTimelineDomViewModel({
  list,
  todaySummary,
  attentionItems,
  equipamentos,
  setoresById,
  clientesById,
  isProMode,
  currentFilterEquipId,
  hasFilters,
}) {
  let globalIdx = 0;
  const groups = groupRegistrosByDate(list).map((group) => {
    const count = group.items.length;
    const items = group.items.map((registro) => {
      const item = buildTimelineItemModel(registro, {
        isFirst: globalIdx === 0,
        equipamentos,
        setoresById,
        clientesById,
        isPro: isProMode,
        currentFilterEquipId,
        groupId: group.id,
      });
      globalIdx += 1;
      return item;
    });

    return {
      id: group.id,
      label: group.label,
      countLabel: count === 1 ? '1 serviço' : `${count} serviços`,
      items,
    };
  });

  return {
    operationSummary: todaySummary,
    attentionItems,
    groups,
    emptyState: groups.length ? null : buildTimelineEmptyState(hasFilters),
  };
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
  const isProMode = isCachedPlanPro();
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
    buildClientePmocDetails,
    buildHistoricoViewModel,
  });

  // Filtros de período, tipo, cliente, setor, equipamento e busca agora ficam
  // no view model; o adapter segue responsável por DOM, URL, handlers e render legado.

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

function bindHistoricoCardLocalActions({ each }) {
  each('[data-hist-action="hist-open-photo"]', (btn) =>
    btn.addEventListener('click', () => {
      const url = btn.dataset.photoUrl;
      if (url) Photos.openLightbox(url);
    }),
  );
}

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

function cleanupHistoricoDeleteArtifacts(id) {
  localStorage.removeItem(`cooltrack-sig-${id}`);
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
  cleanupHistoricoDeleteArtifacts(id);
  refreshHistoricoAfterDelete();
  notifyHistoricoDeleteSuccess();
}
