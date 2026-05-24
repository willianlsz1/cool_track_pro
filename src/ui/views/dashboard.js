/**
 * CoolTrack Pro - Dashboard View v6.0 (V2Refined)
 *
 * Sistema visual: tier accent via `--dsh-accent` (gold Pro, blue Plus, cyan Free).
 * Layout: Hero Status Card + KPI Grid 2×2 (mobile) / 1×4 (desktop) + Próxima ação
 * + Último serviço + seções preservadas (A fazer agora, Alertas, Recentes) +
 * Análise (accordion mobile / grid desktop).
 *
 * Exports públicos: calcHealthScore, getHealthClass, updateHeader, renderDashboard.
 */

import { Utils } from '../../core/utils.js';
import { getState, findEquip, findSetor, regsForEquip } from '../../core/state.js';
import { Auth } from '../../core/auth.js';
import { Alerts } from '../../domain/alerts.js';
// Charts segue legado e dynamic-imported pelo adapter para manter Chart.js
// fora do chunk principal do Dashboard.
import { OnboardingBanner, Profile } from '../components/onboarding.js';
import { OnboardingChecklist } from '../components/onboarding/onboardingChecklist.js';
import { ContextualOnboarding } from '../components/onboarding/contextualOnboarding.js';
import { InstallAppPrompt } from '../components/installAppPrompt.js';
import { UpgradeNudge } from '../components/upgradeNudge.js';
import { OverflowBanner } from '../components/overflowBanner.js';
import { withSkeleton } from '../components/skeleton.js';
import { fetchOperationalProfile } from '../../core/plans/operationalPlan.js';
import {
  PLAN_CODE_FREE,
  PLAN_CODE_PLUS,
  PLAN_CODE_PRO,
  getEffectivePlan,
  hasProAccess,
} from '../../core/plans/subscriptionPlans.js';
import {
  calculateHealthScore,
  evaluateEquipmentRisk,
  evaluateEquipmentRiskTrend,
  getEquipmentMaintenanceContext,
  getHealthClass as getMaintenanceHealthClass,
} from '../../domain/maintenance.js';
import { evaluateEquipmentPriority } from '../../domain/priorityEngine.js';
import { ACTION_CODE, evaluateEquipmentSuggestedAction } from '../../domain/suggestedAction.js';
import { getActionPriorityScore } from '../../domain/actionPriority.js';
import { getOperationalStatus } from '../../core/equipmentRules.js';
import { getEquipmentVisualMeta } from '../components/equipmentVisual.js';
import { ALERT_SEVERITY_WEIGHT } from '../../domain/constants/alerts.js';
import { buildClientePmocDetails } from '../../core/clientePmoc.js';
import { NAV_MODE_EMPRESA, getNavigationMode } from '../shell/navigationMode.js';
import {
  STATUS_OPERACIONAL,
  PRIORIDADE_LABEL,
  RISK_CLASS_LABEL,
} from '../../domain/constants/statuses.js';
import {
  buildDashboardViewModel,
  selectNextDashboardAction,
} from '../viewModels/dashboardViewModel.js';
import { DASHBOARD_ACTIONS, DASHBOARD_PUBLIC_IDS } from '../viewModels/dashboardContracts.js';
import { createDashboardChartsRefresher } from './dashboard/chartsRefresh.js';
import { updateGlobalHeader } from '../composables/header.js';

let dashboardKpisBridgePromise = null;
let dashboardKpisBridge = null;
let dashboardNextActionBridgePromise = null;
let dashboardNextActionBridge = null;
let dashboardMonthSummaryBridgePromise = null;
let dashboardMonthSummaryBridge = null;
let dashboardReadOnlyBlocksBridgePromise = null;
let dashboardReadOnlyBlocksBridge = null;
let dashboardProDraftBridgePromise = null;
let dashboardProDraftBridge = null;
let dashboardOnboardingBridgePromise = null;
let dashboardOnboardingBridge = null;
const refreshDashboardCharts = createDashboardChartsRefresher({
  loadCharts: () => import('../components/charts.js').then((module) => module.Charts),
});

function getDashboardHeroRoot() {
  return document.getElementById(DASHBOARD_PUBLIC_IDS.hero);
}

function loadDashboardKpisBridge() {
  dashboardKpisBridgePromise ??= import('../../react/entrypoints/dashboardKpisIsland.jsx').then(
    (bridge) => {
      dashboardKpisBridge = bridge;
      return bridge;
    },
  );
  return dashboardKpisBridgePromise;
}

function getDashboardKpisRoot() {
  return (
    document.getElementById(DASHBOARD_PUBLIC_IDS.kpiRoot) ||
    document.querySelector('#dash .dash__kpi-grid[aria-label="Indicadores principais"]')
  );
}

function loadDashboardNextActionBridge() {
  dashboardNextActionBridgePromise ??=
    import('../../react/entrypoints/dashboardNextActionIsland.jsx').then((bridge) => {
      dashboardNextActionBridge = bridge;
      return bridge;
    });
  return dashboardNextActionBridgePromise;
}

function getDashboardNextActionRoot() {
  return document.getElementById(DASHBOARD_PUBLIC_IDS.nextActionCard);
}

function getDashboardLastServiceRoot() {
  return document.getElementById(DASHBOARD_PUBLIC_IDS.lastServiceCard);
}

function loadDashboardMonthSummaryBridge() {
  dashboardMonthSummaryBridgePromise ??=
    import('../../react/entrypoints/dashboardMonthSummaryIsland.jsx').then((bridge) => {
      dashboardMonthSummaryBridge = bridge;
      return bridge;
    });
  return dashboardMonthSummaryBridgePromise;
}

function getDashboardMonthSummaryRoot() {
  return document.getElementById(DASHBOARD_PUBLIC_IDS.monthSection);
}

function loadDashboardReadOnlyBlocksBridge() {
  dashboardReadOnlyBlocksBridgePromise ??=
    import('../../react/entrypoints/dashboardReadOnlyBlocksIsland.jsx').then((bridge) => {
      dashboardReadOnlyBlocksBridge = bridge;
      return bridge;
    });
  return dashboardReadOnlyBlocksBridgePromise;
}

function getDashboardReadOnlyBlocksRoot() {
  return document.getElementById(DASHBOARD_PUBLIC_IDS.readOnlyBlocksRoot);
}

function loadDashboardProDraftBridge() {
  dashboardProDraftBridgePromise ??=
    import('../../react/entrypoints/dashboardProDraftIsland.jsx').then((bridge) => {
      dashboardProDraftBridge = bridge;
      return bridge;
    });
  return dashboardProDraftBridgePromise;
}

function getDashboardProDraftRoot() {
  return document.getElementById(DASHBOARD_PUBLIC_IDS.proOpsRow);
}

function getDashboardProDraftPortalRoot() {
  return document.getElementById(DASHBOARD_PUBLIC_IDS.proDraftRoot);
}

function loadDashboardOnboardingBridge() {
  dashboardOnboardingBridgePromise ??=
    import('../../react/entrypoints/dashboardOnboardingIsland.jsx').then((bridge) => {
      dashboardOnboardingBridge = bridge;
      return bridge;
    });
  return dashboardOnboardingBridgePromise;
}

function getDashboardOnboardingRoot() {
  return document.getElementById(DASHBOARD_PUBLIC_IDS.onboarding);
}

function getDashboardEmptyRoot() {
  return document.getElementById(DASHBOARD_PUBLIC_IDS.empty);
}

function getDashboardOverflowRoot() {
  return document.getElementById(DASHBOARD_PUBLIC_IDS.overflowBanner);
}

export function unmountDashboardHero(root = getDashboardHeroRoot()) {
  if (!root) return undefined;
  root.replaceChildren();
  delete root.dataset.reactDashboardHeroMounted;
  return undefined;
}

export function unmountDashboardKpis(root = getDashboardKpisRoot()) {
  if (!root) return undefined;
  if (dashboardKpisBridge?.unmountDashboardKpisReact) {
    dashboardKpisBridge.unmountDashboardKpisReact(root);
    return undefined;
  }
  return loadDashboardKpisBridge().then(({ unmountDashboardKpisReact }) => {
    unmountDashboardKpisReact(root);
  });
}

export function unmountDashboardNextAction(root = getDashboardNextActionRoot()) {
  if (!root) return undefined;
  if (dashboardNextActionBridge?.unmountDashboardNextActionReact) {
    dashboardNextActionBridge.unmountDashboardNextActionReact(root);
    return undefined;
  }
  return loadDashboardNextActionBridge().then(({ unmountDashboardNextActionReact }) => {
    unmountDashboardNextActionReact(root);
  });
}

export function unmountDashboardLastService(root = getDashboardLastServiceRoot()) {
  if (!root) return undefined;
  root.replaceChildren();
  delete root.dataset.reactDashboardLastServiceMounted;
  return undefined;
}

export function unmountDashboardMonthSummary(root = getDashboardMonthSummaryRoot()) {
  if (!root) return undefined;
  if (dashboardMonthSummaryBridge?.unmountDashboardMonthSummaryReact) {
    dashboardMonthSummaryBridge.unmountDashboardMonthSummaryReact(root);
    return undefined;
  }
  return loadDashboardMonthSummaryBridge().then(({ unmountDashboardMonthSummaryReact }) => {
    unmountDashboardMonthSummaryReact(root);
  });
}

export function unmountDashboardReadOnlyBlocks(root = getDashboardReadOnlyBlocksRoot()) {
  if (!root) return undefined;
  if (dashboardReadOnlyBlocksBridge?.unmountDashboardReadOnlyBlocksReact) {
    dashboardReadOnlyBlocksBridge.unmountDashboardReadOnlyBlocksReact(root);
    return undefined;
  }
  return loadDashboardReadOnlyBlocksBridge().then(({ unmountDashboardReadOnlyBlocksReact }) => {
    unmountDashboardReadOnlyBlocksReact(root);
  });
}

export function unmountDashboardProDraft(root = getDashboardProDraftRoot()) {
  if (!root) return undefined;
  if (dashboardProDraftBridge?.unmountDashboardProDraftReact) {
    dashboardProDraftBridge.unmountDashboardProDraftReact(root);
    return undefined;
  }
  return loadDashboardProDraftBridge().then(({ unmountDashboardProDraftReact }) => {
    unmountDashboardProDraftReact(root);
  });
}

// ═══════════════════════════════════════════════════════
// Helpers de métricas (preservados)
// ═══════════════════════════════════════════════════════
export function unmountDashboardOnboarding(root = getDashboardOnboardingRoot()) {
  if (!root) return undefined;
  if (dashboardOnboardingBridge?.unmountDashboardOnboardingReact) {
    dashboardOnboardingBridge.unmountDashboardOnboardingReact(root);
    return undefined;
  }
  return loadDashboardOnboardingBridge().then(({ unmountDashboardOnboardingReact }) => {
    unmountDashboardOnboardingReact(root);
  });
}

function _getMostSevereAlert(alerts = []) {
  return [...alerts].sort(
    (a, b) =>
      (ALERT_SEVERITY_WEIGHT[b?.severity] || 0) - (ALERT_SEVERITY_WEIGHT[a?.severity] || 0) ||
      (b?.sortScore || 0) - (a?.sortScore || 0),
  )[0];
}

function _getMonthRange(monthsAgo = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1);
  return { start, end };
}

function _sparklineData(registros, months = 6) {
  return Array.from({ length: months }, (_, i) => {
    const { start, end } = _getMonthRange(months - 1 - i);
    return registros.filter((r) => {
      const d = new Date(r.data);
      return d >= start && d < end;
    }).length;
  });
}

function _resolveClienteNome(clientes = [], clienteId = null) {
  if (!clienteId) return '';
  return clientes.find((cliente) => cliente.id === clienteId)?.nome || '';
}

function _resolveSetorNome(equipamento = null) {
  if (!equipamento?.setorId) return '';
  return findSetor(equipamento.setorId)?.nome || '';
}

function _composeEquipmentContext({ equipamento, clientes, includeBusinessContext }) {
  const equipNome = equipamento?.nome || 'Equipamento';
  if (!includeBusinessContext) return equipNome;
  const clienteNome = _resolveClienteNome(clientes, equipamento?.clienteId);
  const setorNome = _resolveSetorNome(equipamento);
  return [clienteNome, setorNome, equipNome].filter(Boolean).join(' • ');
}

// Sparkline SVG inline — gradient fill + linha com ponto final destacado
function _sparklineSvg(data) {
  if (!data || !data.length) return '';
  const w = 100;
  const h = 20;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * w;
    const y = h - 2 - (v / max) * (h - 4);
    return [x, y];
  });
  const line = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ');
  const área = `${line} L${w},${h} L0,${h} Z`;
  const dots = pts
    .map(([x, y], i) => {
      const r = data[i] > 0 ? 1.8 : 1;
      const last = i === pts.length - 1;
      return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${last ? 2.2 : r}" fill="var(--dsh-accent,currentColor)" opacity="${last ? 1 : 0.6}"/>`;
    })
    .join('');
  return `<svg width="100%" height="20" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id="dsh-spark" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="var(--dsh-accent,currentColor)" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="var(--dsh-accent,currentColor)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${área}" fill="url(#dsh-spark)"/>
    <path d="${line}" fill="none" stroke="var(--dsh-accent,currentColor)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    ${dots}
  </svg>`;
}

function _recencia(data) {
  const diff = Math.round((new Date() - new Date(data)) / 86400000);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 30) return `há ${diff} dias`;
  if (diff < 60) return 'há 1 mês';
  return `há ${Math.floor(diff / 30)} meses`;
}

function _planTier(planCode) {
  if (planCode === PLAN_CODE_PRO) return 'pro';
  if (planCode === PLAN_CODE_PLUS) return 'plus';
  return 'free';
}

function _planPillText(tier) {
  if (tier === 'pro') return 'PRO';
  if (tier === 'plus') return 'PLUS';
  return 'FREE';
}

// Fallback de último recurso pra saudação quando a única identidade
// disponível é o email (ex.: conta nova antes de completar o FTX). Pega
// a local-part, joga fora `+tag` (Gmail-style) e o domínio, e tira a
// primeira "palavra" quebrando em `. _ -` (cobre "ana.silva", "joao_pedro",
// "ana-maria") — evita "Olá, willianloopes123+teste@gmail.com" na home.
function _prettifyEmailLocalPart(email) {
  if (typeof email !== 'string' || !email) return '';
  const at = email.indexOf('@');
  const local = at === -1 ? email : email.slice(0, at);
  const base = local.split('+')[0].trim();
  if (!base) return '';
  const firstToken = base.split(/[._-]+/).filter(Boolean)[0] || '';
  if (!firstToken) return '';
  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1);
}

// Helper: ignora valores do `user_metadata` que parecem email. Supabase
// popula `user_metadata.name` com o próprio email no signup, então sem esse
// filtro o hero cairia em "Olá, fulano@gmail.com" mesmo com Profile vazio.
function _nonEmailMetadataName(raw) {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.includes('@')) return '';
  return trimmed;
}

function _initialsFromName(raw) {
  const src = String(raw || '')
    .replace(/[<>"`/\\]/g, ' ')
    .trim();
  if (!src) return '—';
  // email → usa as duas primeiras letras antes do @
  if (src.includes('@')) {
    const local = src
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .trim();
    if (!local) return '—';
    const parts = local.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return local.slice(0, 2).toUpperCase();
  }
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function _populateHeaderIdentity({ tier, userName }) {
  const header = Utils.getEl('app-header');
  if (header) header.setAttribute('data-tier', tier);

  const pill = Utils.getEl('app-logo-pill');
  const pillText = Utils.getEl('app-logo-pill-text');
  if (pill) {
    pill.setAttribute('data-tier', tier);
    pill.hidden = false;
    if (pillText) pillText.textContent = _planPillText(tier);
  }

  const avatar = Utils.getEl('header-avatar');
  const initialsEl = Utils.getEl('header-avatar-initials');
  if (avatar) avatar.setAttribute('data-tier', tier);
  if (initialsEl) initialsEl.textContent = _initialsFromName(userName);
}

// ═══════════════════════════════════════════════════════
// Health / risk (mantido; exportado pra outras views)
// ═══════════════════════════════════════════════════════
export function calcHealthScore(eqId) {
  const eq = findEquip(eqId);
  if (!eq) return 0;
  return calculateHealthScore(eq, regsForEquip(eqId));
}

export function getHealthClass(score) {
  return getMaintenanceHealthClass(score);
}

function _buildDashboardReadModel({
  equipamentos = [],
  registros = [],
  clientes = [],
  setores = [],
  alerts = [],
  planContext = {},
  navigationMode = '',
  userName = '',
} = {}) {
  return buildDashboardViewModel({
    equipamentos,
    registros,
    clientes,
    setores,
    alerts,
    planContext,
    navigationMode,
    userName,
    getHealthScore: (eq) => calcHealthScore(eq?.id),
    getHealthClass,
  });
}

// ═══════════════════════════════════════════════════════
// Plan context
// ═══════════════════════════════════════════════════════
async function resolveDashboardPlanContext() {
  const user = await Auth.getUser();
  if (!user?.id) return { planCode: PLAN_CODE_FREE, hasPro: false, userId: null };

  try {
    const { profile } = await fetchOperationalProfile();
    return {
      planCode: getEffectivePlan(profile),
      hasPro: hasProAccess(profile),
      userId: user.id,
    };
  } catch {
    const fallbackPlan = getEffectivePlan(null);
    return { planCode: fallbackPlan, hasPro: fallbackPlan === PLAN_CODE_PRO, userId: user.id };
  }
}

// ═══════════════════════════════════════════════════════
// Pro status card (preservado — aparece só quando tier=pro)
// ═══════════════════════════════════════════════════════
function _renderProStatusCard() {
  return `
    <article class="upgrade-nudge-card upgrade-nudge-card--pro-active" aria-label="Plano Pro ativo">
      <span class="upgrade-nudge-card__badge">PRO ATIVO</span>
      <div class="upgrade-nudge-card__icon" aria-hidden="true">&#10003;</div>
      <h3 class="upgrade-nudge-card__pro-title">Plano Pro ativo</h3>
      <p class="upgrade-nudge-card__pro-copy">Todos os recursos premium estão liberados para sua conta.</p>
    </article>
  `;
}

// ═══════════════════════════════════════════════════════
// Action / alert helpers (preservados para mini-cards)
// ═══════════════════════════════════════════════════════
function _getAlertActionMeta(alert) {
  const id = Utils.escapeAttr(alert.eq?.id || '');
  switch (alert.recommendedAction) {
    case 'register-now':
      return { action: 'go-register-equip', id, label: 'Registrar agora' };
    case 'schedule':
      return { action: 'go-register-equip', id, label: 'Registrar serviço preventivo' };
    case 'start-history':
      return { action: 'go-register-equip', id, label: 'Iniciar histórico' };
    case 'inspect':
      return { action: 'view-equip', id, label: 'Abrir equipamento' };
    default:
      return { action: 'view-equip', id, label: 'Ver equipamento' };
  }
}

function _getActionButton(actionCode) {
  if (
    actionCode === ACTION_CODE.REGISTER_CORRECTIVE_IMMEDIATE ||
    actionCode === ACTION_CODE.REGISTER_CORRECTIVE ||
    actionCode === ACTION_CODE.REGISTER_PREVENTIVE
  ) {
    return { action: 'go-register-equip', ctaLabel: 'Registrar' };
  }
  if (actionCode === ACTION_CODE.SCHEDULE_PREVENTIVE) {
    return { action: 'go-register-equip', ctaLabel: 'Programar' };
  }
  return { action: 'view-equip', ctaLabel: 'Ver' };
}

function _criticalEquipmentCardModel(eq) {
  const visual = getEquipmentVisualMeta(eq);
  const context = getEquipmentMaintenanceContext(eq, regsForEquip(eq.id));
  const last = context.ultimoRegistro;
  const score = calcHealthScore(eq.id);
  const hcls = getHealthClass(score);
  const scls = Utils.safeStatus(eq.status);
  const eqRegs = regsForEquip(eq.id);
  const risk = evaluateEquipmentRisk(eq, eqRegs);
  const riskTrend = evaluateEquipmentRiskTrend(eq, eqRegs);
  const priority = evaluateEquipmentPriority(eq, eqRegs);
  const suggestedAction = evaluateEquipmentSuggestedAction(eq, eqRegs);

  function getCtaByAction(actionCode) {
    if (actionCode === ACTION_CODE.REGISTER_CORRECTIVE_IMMEDIATE)
      return 'Registrar serviço corretivo agora →';
    if (actionCode === ACTION_CODE.REGISTER_CORRECTIVE) return 'Registrar serviço corretivo →';
    if (actionCode === ACTION_CODE.REGISTER_PREVENTIVE) return 'Registrar serviço preventivo →';
    if (actionCode === ACTION_CODE.SCHEDULE_PREVENTIVE) return 'Programar serviço preventivo →';
    return 'Registrar serviço →';
  }

  let proximaLabel = '—';
  let proximaCls = 'equip-card__metric-value--muted';
  let proximaIcon = '';
  if (context.proximaPreventiva) {
    const diff = Utils.daysDiff(context.proximaPreventiva);
    if (diff < 0) {
      proximaLabel = `Vencida há ${Math.abs(diff)}d`;
      proximaCls = 'equip-card__metric-value--danger';
      proximaIcon = '!!';
    } else if (diff === 0) {
      proximaLabel = 'Hoje';
      proximaCls = 'equip-card__metric-value--danger';
      proximaIcon = '!!';
    } else if (diff <= 7) {
      proximaLabel = `Em ${diff} dia${diff > 1 ? 's' : ''}`;
      proximaCls = 'equip-card__metric-value--warn';
      proximaIcon = '!';
    } else {
      proximaLabel = `Em ${diff} dias`;
    }
  }

  let ctaLabel = getCtaByAction(suggestedAction.actionCode);
  if (!last && suggestedAction.actionCode === ACTION_CODE.NONE) ctaLabel = 'Primeiro registro →';

  return {
    id: eq?.id || '',
    statusClass: scls,
    ariaLabel: `${eq?.nome ?? '—'} — ${STATUS_OPERACIONAL[scls]}`,
    visual: {
      photoUrl: visual.photoUrl || '',
      initials: visual.initials || 'EQ',
      tone: visual.tone || 'ok',
    },
    name: eq?.nome ?? '—',
    meta: `${eq.fluido || eq.tipo || '—'} · Prioridade ${PRIORIDADE_LABEL[eq.criticidade] || PRIORIDADE_LABEL.media}`,
    statusLabel: STATUS_OPERACIONAL[scls],
    health: {
      score,
      className: hcls,
    },
    risk: {
      classification: risk.classification,
      label: RISK_CLASS_LABEL[risk.classification],
      score: risk.score,
      trend: riskTrend,
    },
    priority: {
      level: priority.priorityLevel,
      label: priority.priorityLabel,
    },
    metrics: {
      lastLabel: last ? _recencia(last.data) : '',
      lastType: last ? Utils.truncate(last.tipo, 22) : '',
      nextLabel: proximaLabel,
      nextClass: proximaCls,
      nextIcon: proximaIcon,
    },
    ctaLabel,
  };
}

// ═══════════════════════════════════════════════════════
// Hero Status Card
// ═══════════════════════════════════════════════════════
const DEFAULT_DASHBOARD_HERO = Object.freeze({
  tier: 'free',
  tone: 'ok',
  greeting: 'Ola, Tecnico',
  summary: '0 equipamentos - 0 servicos no mes',
  primaryCta: {
    action: DASHBOARD_ACTIONS.startServiceRegistration,
    label: 'Registrar servico',
  },
  secondaryCta: {
    action: DASHBOARD_ACTIONS.openModal,
    id: 'modal-add-eq',
    label: 'Cadastrar equipamento',
  },
});

function heroText(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function resolveHeroCta(cta, fallback) {
  if (!cta) return fallback;
  return {
    ...cta,
    label: heroText(cta?.label, fallback.label),
  };
}

function setOptionalDataAttribute(element, name, value) {
  if (!element) return;
  const normalized = heroText(value);
  if (normalized) {
    element.setAttribute(name, normalized);
    return;
  }
  element.removeAttribute(name);
}

function renderHeroButton(button, label, cta) {
  if (!button) return;
  button.type = 'button';
  setOptionalDataAttribute(button, 'data-nav', cta.nav);
  setOptionalDataAttribute(button, 'data-action', cta.action);
  setOptionalDataAttribute(button, 'data-id', cta.id);
  if (label) label.textContent = heroText(cta.label);
}

function renderDashboardHeroDom(root, hero = {}) {
  const model = {
    ...DEFAULT_DASHBOARD_HERO,
    ...(hero || {}),
  };
  const primaryCta = resolveHeroCta(model.primaryCta, DEFAULT_DASHBOARD_HERO.primaryCta);
  const secondaryCta = resolveHeroCta(model.secondaryCta, DEFAULT_DASHBOARD_HERO.secondaryCta);

  root.dataset.tier = heroText(model.tier, DEFAULT_DASHBOARD_HERO.tier);
  root.dataset.tone = heroText(model.tone, DEFAULT_DASHBOARD_HERO.tone);
  root.innerHTML = `
    <div class="dash__hero-body">
      <h1 class="dash__hero-greeting" id="${DASHBOARD_PUBLIC_IDS.heroGreeting}"></h1>
      <p class="dash__hero-summary" id="${DASHBOARD_PUBLIC_IDS.heroSummary}"></p>
    </div>
    <div class="dash__hero-cta-wrap">
      <button class="dash__hero-cta" id="${DASHBOARD_PUBLIC_IDS.heroCta}" type="button">
        <span class="dash__hero-cta-label" id="${DASHBOARD_PUBLIC_IDS.heroCtaLabel}"></span>
      </button>
      <button class="dash__hero-cta dash__hero-cta--secondary" id="${DASHBOARD_PUBLIC_IDS.heroSecondaryCta}" type="button">
        <span class="dash__hero-cta-label" id="${DASHBOARD_PUBLIC_IDS.heroSecondaryCtaLabel}"></span>
      </button>
    </div>
  `;

  root.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroGreeting}`).textContent = heroText(
    model.greeting,
    DEFAULT_DASHBOARD_HERO.greeting,
  );
  root.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroSummary}`).textContent = heroText(
    model.summary,
    DEFAULT_DASHBOARD_HERO.summary,
  );
  renderHeroButton(
    root.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroCta}`),
    root.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroCtaLabel}`),
    primaryCta,
  );
  renderHeroButton(
    root.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroSecondaryCta}`),
    root.querySelector(`#${DASHBOARD_PUBLIC_IDS.heroSecondaryCtaLabel}`),
    secondaryCta,
  );
}

function _renderHero({ viewModel }) {
  const model = viewModel?.hero;
  const root = getDashboardHeroRoot();
  const dashRoot = document.getElementById(DASHBOARD_PUBLIC_IDS.root);

  if (!model) return Promise.resolve();

  if (dashRoot) {
    dashRoot.setAttribute('data-tier', model.tier);
    dashRoot.setAttribute('data-tone', model.tone);
  }

  if (root) {
    renderDashboardHeroDom(root, model);
  }

  return Promise.resolve();
}

// ═══════════════════════════════════════════════════════
// KPI Grid
// ═══════════════════════════════════════════════════════
function _renderKPIs({ equipamentos, registros, alerts, viewModel }) {
  const kpis =
    viewModel?.kpis || _buildDashboardReadModel({ equipamentos, registros, alerts }).kpis;
  const root = getDashboardKpisRoot();

  if (root) {
    if (dashboardKpisBridge?.mountDashboardKpisReact) {
      dashboardKpisBridge.mountDashboardKpisReact(root, { kpis });
    } else {
      const mountPromise = loadDashboardKpisBridge().then(({ mountDashboardKpisReact }) => {
        mountDashboardKpisReact(root, { kpis });
      });
      return {
        efficiency: kpis.eficiencia.value,
        mesCount: kpis.mes.count,
        mountPromise,
      };
    }
  }

  return {
    efficiency: kpis.eficiencia.value,
    mesCount: kpis.mes.count,
    mountPromise: Promise.resolve(),
  };
}

// ═══════════════════════════════════════════════════════
// Próxima Ação + Último Serviço
// ═══════════════════════════════════════════════════════
export function selectNextBestAction({ alerts, equipamentos, registros }) {
  return selectNextDashboardAction({ alerts, equipamentos, registros });
}

function _renderNextActionCard({ viewModel }) {
  const model = viewModel?.nextAction;
  const root = getDashboardNextActionRoot();
  if (root && model) {
    if (dashboardNextActionBridge?.mountDashboardNextActionReact) {
      dashboardNextActionBridge.mountDashboardNextActionReact(root, { nextAction: model });
      return Promise.resolve();
    }
    return loadDashboardNextActionBridge().then(({ mountDashboardNextActionReact }) => {
      mountDashboardNextActionReact(root, { nextAction: model });
    });
  }

  return Promise.resolve();
}

function appendDashboardText(parent, tagName, className, textContent, options = {}) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (options.id) element.id = options.id;
  if (options.ariaHidden) element.setAttribute('aria-hidden', 'true');
  element.textContent = textContent ?? '';
  parent.appendChild(element);
  return element;
}

function appendDashboardLastServiceIcon(parent) {
  const icon = document.createElement('div');
  icon.className = 'dash__card-icon';
  icon.setAttribute('aria-hidden', 'true');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.6');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute(
    'd',
    'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2.8-2.8 2.8-2.8z',
  );
  svg.appendChild(path);
  icon.appendChild(svg);
  parent.appendChild(icon);
  return icon;
}

function renderDashboardLastServiceDom(root, lastService = {}) {
  if (!root) return null;
  const model = lastService || {};

  root.replaceChildren();
  root.hidden = Boolean(model.hidden);
  root.dataset.reactDashboardLastServiceMounted = 'true';

  appendDashboardLastServiceIcon(root);

  const body = document.createElement('div');
  body.className = 'dash__card-body';
  appendDashboardText(body, 'div', 'dash__card-label', '\u00daltimo servi\u00e7o');
  appendDashboardText(body, 'div', 'dash__card-title', model.title || '\u2014', {
    id: DASHBOARD_PUBLIC_IDS.lastServiceTitle,
  });
  appendDashboardText(body, 'div', 'dash__card-sub', model.subtitle || '\u2014', {
    id: DASHBOARD_PUBLIC_IDS.lastServiceSubtitle,
  });
  appendDashboardText(body, 'div', 'dash__card-desc', model.description || '', {
    id: 'dash-last-desc',
  });

  root.appendChild(body);
  return root;
}

function _renderLastServiceCard({ viewModel }) {
  const model = viewModel?.lastService;
  const root = getDashboardLastServiceRoot();
  if (root && model) {
    renderDashboardLastServiceDom(root, model);
  }

  return Promise.resolve();
}

function _renderMonthView({ viewModel }) {
  const model = viewModel?.month;
  const root = getDashboardMonthSummaryRoot();
  if (root && model) {
    if (dashboardMonthSummaryBridge?.mountDashboardMonthSummaryReact) {
      dashboardMonthSummaryBridge.mountDashboardMonthSummaryReact(root, { month: model });
      return Promise.resolve();
    }
    return loadDashboardMonthSummaryBridge().then(({ mountDashboardMonthSummaryReact }) => {
      mountDashboardMonthSummaryReact(root, { month: model });
    });
  }

  return Promise.resolve();
}

function _buildContinueDraftModel({ equipamentos = [], registros = [] }) {
  let editingId = null;
  try {
    editingId = sessionStorage.getItem('cooltrack-editing-id');
  } catch (_e) {
    /* sessionStorage indisponivel */
  }
  if (!editingId) return null;

  const reg = (registros || []).find((r) => r.id === editingId);
  const eq = reg?.equipId ? (equipamentos || []).find((e) => e.id === reg.equipId) : null;

  return {
    visible: true,
    id: editingId,
    isEdit: Boolean(reg),
    equipmentName: eq?.nome || '',
    nav: 'registro',
  };
}

function _buildProDraftModel({
  tier,
  isEmpresaPro,
  clientes,
  equipamentos,
  registros,
  alerts,
  setores,
}) {
  const criticalAlerts = (alerts || [])
    .filter(
      (alert) =>
        ['critical', 'overdue', 'attention'].includes(alert.kind) || alert.severity === 'danger',
    )
    .slice(0, 3);
  const critical = criticalAlerts.length
    ? {
        label: 'Alertas críticos',
        title: 'Alertas críticos',
        subtitle: `${criticalAlerts.length} itens exigem ação`,
        actions: criticalAlerts.map((alert) => {
          const equip = alert.eq;
          const context = _composeEquipmentContext({
            equipamento: equip,
            clientes,
            includeBusinessContext: true,
          });
          return {
            label: `${alert.title} · ${context} · Resolver`,
            action: DASHBOARD_ACTIONS.goRegisterEquip,
            id: equip?.id || '',
          };
        }),
      }
    : {
        label: 'Alertas críticos',
        title: 'Tudo sob controle',
        subtitle: 'Sem alertas críticos agora.',
        actions: [],
      };

  const riscoClientes = (clientes || [])
    .map((cliente) => {
      const summary = buildClientePmocDetails({
        cliente,
        equipamentos,
        registros,
        setores,
      });
      return { cliente, summary };
    })
    .filter(({ summary }) => summary?.status === 'atrasado' || summary?.status === 'atencao')
    .slice(0, 3);
  const riskClients = riscoClientes.length
    ? {
        label: 'Clientes em risco',
        title: 'Clientes em risco',
        subtitle: `${riscoClientes.length} clientes exigem atenção`,
        actions: riscoClientes.map(({ cliente, summary }) => ({
          label: `${cliente?.nome || 'Cliente'} · ${summary.statusLabel} · Ver cliente`,
          nav: 'clientes',
        })),
      }
    : {
        label: 'Clientes em risco',
        title: 'Clientes em dia',
        subtitle: 'Nenhum cliente exige atenção agora.',
        actions: [],
      };

  return {
    tier,
    proCards: {
      visible: Boolean(isEmpresaPro),
      upgradeCta: null,
      critical,
      riskClients,
    },
    draft: _buildContinueDraftModel({ equipamentos, registros }),
  };
}

function _buildDashboardOnboardingModel({
  tier,
  dashboardReadModel,
  equipamentos,
  registros,
  planContext,
}) {
  const emptyVisible = !equipamentos.length;
  const installState = InstallAppPrompt.getRenderState?.() || 'hidden';
  const checklist = OnboardingChecklist.getRenderModel?.() || {
    visible: false,
    completed: 0,
    total: 0,
    percent: 0,
    steps: [],
  };
  const contextual = ContextualOnboarding.getRenderModel?.() || { visible: false };
  const overflowState =
    planContext.hasPro || planContext.planCode === PLAN_CODE_PLUS
      ? { overLimit: false }
      : OverflowBanner.computeState({ equipamentos, registros });

  return {
    tier,
    empty: {
      visible: emptyVisible,
      state: emptyVisible ? dashboardReadModel.emptyState : null,
    },
    installPrompt: { state: installState },
    contextual,
    checklist,
    overflow: {
      visible: Boolean(overflowState.overLimit),
      state: overflowState,
    },
  };
}

function _renderOnboardingBlocks({ onboarding }) {
  const root = getDashboardOnboardingRoot();
  if (!root || !onboarding) return Promise.resolve();

  const props = {
    onboarding,
    emptyRoot: getDashboardEmptyRoot(),
    overflowRoot: getDashboardOverflowRoot(),
  };

  if (dashboardOnboardingBridge?.mountDashboardOnboardingReact) {
    dashboardOnboardingBridge.mountDashboardOnboardingReact(root, props);
    return Promise.resolve();
  }

  return loadDashboardOnboardingBridge().then(({ mountDashboardOnboardingReact }) => {
    mountDashboardOnboardingReact(root, props);
  });
}

function _renderProDraftBlocks({ proDraft }) {
  const root = getDashboardProDraftRoot();
  const draftRoot = getDashboardProDraftPortalRoot();
  if (!root || !proDraft) return Promise.resolve();

  if (dashboardProDraftBridge?.mountDashboardProDraftReact) {
    dashboardProDraftBridge.mountDashboardProDraftReact(root, { proDraft, draftRoot });
    return Promise.resolve();
  }

  return loadDashboardProDraftBridge().then(({ mountDashboardProDraftReact }) => {
    mountDashboardProDraftReact(root, { proDraft, draftRoot });
  });
}

function _buildCriticalNowBlock(equipamentos) {
  if (!equipamentos.length) {
    return { visible: false, count: 0, groups: [] };
  }

  const actionQueue = equipamentos
    .map((eq) => ({ eq, score: getActionPriorityScore(eq, regsForEquip(eq.id)) }))
    .sort((a, b) => b.score.actionPriorityScore - a.score.actionPriorityScore)
    .slice(0, 9);

  const groups = {
    critico: actionQueue.filter((i) => i.score.group === 'critico').slice(0, 3),
    atencao: actionQueue.filter((i) => i.score.group === 'atencao').slice(0, 3),
  };

  const toItems = (items, tone) =>
    items.map(({ eq, score }) => {
      const actionMeta = _getActionButton(score.suggestedAction.actionCode);
      return {
        icon: score.group === 'critico' ? '!!' : '!',
        tone,
        title: `${eq.nome || 'Equipamento'} · ${score.suggestedAction.actionLabel}`,
        subtitle: score.reasons.join(' · ') || 'Ação recomendada',
        action: actionMeta.action,
        id: eq.id,
        ctaLabel: actionMeta.ctaLabel,
      };
    });

  const total = groups.critico.length + groups.atencao.length;
  if (!total) {
    return { visible: false, count: 0, groups: [] };
  }

  return {
    visible: true,
    count: total,
    groups: [
      groups.critico.length
        ? {
            key: 'critico',
            label: 'Crítico agora',
            items: toItems(groups.critico, 'danger'),
          }
        : null,
      groups.atencao.length
        ? {
            key: 'atencao',
            label: 'Atenção',
            items: toItems(groups.atencao, 'warn'),
          }
        : null,
    ].filter(Boolean),
  };
}

function _buildAlertsMiniBlock(alerts = []) {
  if (!alerts.length) {
    return { visible: false, alerts: [] };
  }

  return {
    visible: true,
    alerts: alerts.slice(0, 4).map((alert) => {
      const actionMeta = _getAlertActionMeta(alert);
      return {
        critical: alert.severity === 'danger',
        action: actionMeta.action,
        id: actionMeta.id,
        icon: alert.icon || '!',
        equipmentName: alert.eq?.nome ?? alert.equipmentName ?? '—',
        title: alert.title || 'Alerta',
        subtitle: Utils.truncate(alert.subtitle || '', 56),
      };
    }),
  };
}

function _buildCriticalEquipmentsBlock({ equipamentos, alerts }) {
  const critical = equipamentos
    .map((eq) => {
      const eqRegs = regsForEquip(eq.id);
      return {
        eq,
        score: calcHealthScore(eq.id),
        riskScore: evaluateEquipmentRisk(eq, eqRegs).score,
        priority: evaluateEquipmentPriority(eq, eqRegs),
        hasAlert: alerts.some((alert) => alert.eq?.id === eq.id),
      };
    })
    .filter(
      ({ eq, score, priority, hasAlert }) =>
        hasAlert ||
        getOperationalStatus({ status: eq.status }).code !== 'ok' ||
        score < 80 ||
        priority.priorityLevel >= 2,
    )
    .sort(
      (a, b) =>
        b.priority.priorityLevel - a.priority.priorityLevel ||
        Number(b.hasAlert) - Number(a.hasAlert) ||
        b.riskScore - a.riskScore ||
        a.score - b.score,
    )
    .map(({ eq }) => eq)
    .slice(0, 4);

  if (!critical.length) {
    return { visible: false, equipments: [] };
  }

  return {
    visible: true,
    equipments: critical.map(_criticalEquipmentCardModel),
  };
}

function _buildRecentServicesBlock({ registros, isEmpresaPro, clientes }) {
  if (registros.length < 2) {
    return { visible: false, records: [] };
  }
  const recent = [...registros].sort((a, b) => b.data.localeCompare(a.data)).slice(1, 4);
  if (!recent.length) {
    return { visible: false, records: [] };
  }

  return {
    visible: true,
    records: recent.map((r) => {
      const eq = findEquip(r.equipId);
      const clienteNome = isEmpresaPro ? _resolveClienteNome(clientes, eq?.clienteId) : '';
      const setorNome = isEmpresaPro ? _resolveSetorNome(eq) : '';
      const contexto = isEmpresaPro
        ? [clienteNome, setorNome, eq?.nome || '—'].filter(Boolean).join(' • ')
        : eq?.nome || '—';
      return {
        id: r.id || `${r.equipId || 'registro'}-${r.data || ''}`,
        dateLabel: Utils.formatDatetime(r.data),
        title: r.tipo || 'Serviço',
        context: `${contexto}${!isEmpresaPro && eq?.tag ? ` · ${eq.tag}` : ''}`,
        obs: Utils.truncate(r.obs, 70),
      };
    }),
  };
}

function _buildReadOnlyBlocksModel({ equipamentos, registros, alerts, isEmpresaPro, clientes }) {
  return {
    criticalNow: _buildCriticalNowBlock(equipamentos),
    alertsMini: _buildAlertsMiniBlock(alerts),
    criticalEquipments: _buildCriticalEquipmentsBlock({ equipamentos, alerts }),
    recentServices: _buildRecentServicesBlock({ registros, isEmpresaPro, clientes }),
  };
}

function _renderReadOnlyBlocksUpgradeHint({ alerts, planContext }) {
  const hint = document.getElementById(DASHBOARD_PUBLIC_IDS.upgradeInlineHint);
  if (!hint) return;
  if (!alerts.length || planContext.hasPro) {
    hint.innerHTML = '';
    return;
  }

  hint.innerHTML = UpgradeNudge.renderInlineHint('Exportar relatório em lote', {
    planCode: planContext.planCode,
    requiredPlan: 'plus',
  });
}

function _renderReadOnlyBlocks({
  equipamentos,
  registros,
  alerts,
  planContext,
  isEmpresaPro,
  clientes,
}) {
  const model = _buildReadOnlyBlocksModel({
    equipamentos,
    registros,
    alerts,
    isEmpresaPro,
    clientes,
  });
  const root = getDashboardReadOnlyBlocksRoot();

  if (root && dashboardReadOnlyBlocksBridge?.mountDashboardReadOnlyBlocksReact) {
    dashboardReadOnlyBlocksBridge.mountDashboardReadOnlyBlocksReact(root, {
      readOnlyBlocks: model,
    });
    _renderReadOnlyBlocksUpgradeHint({ alerts, planContext });
    return Promise.resolve();
  }

  if (root) {
    return loadDashboardReadOnlyBlocksBridge().then(({ mountDashboardReadOnlyBlocksReact }) => {
      mountDashboardReadOnlyBlocksReact(root, { readOnlyBlocks: model });
      _renderReadOnlyBlocksUpgradeHint({ alerts, planContext });
    });
  }

  return Promise.resolve();
}

// ═══════════════════════════════════════════════════════
// Charts refresh (legacy adapter)
// ═══════════════════════════════════════════════════════
function _refreshCharts({ equipamentos, registros }) {
  const viewInicio = document.getElementById(DASHBOARD_PUBLIC_IDS.view);
  return refreshDashboardCharts({
    isActive: Boolean(viewInicio?.classList.contains('active')),
    equipamentos,
    registros,
  });
}

// ═══════════════════════════════════════════════════════
// Header status (app-wide — não-dashboard-específico)
// ═══════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════
// API PÚBLICA
// ═══════════════════════════════════════════════════════

export function updateHeader() {
  const { equipamentos, registros } = getState();
  const alerts = Alerts.getAll();
  updateGlobalHeader({ equipamentos, registros, alerts });
  // KPIs também são populadas aqui para respostas em tempo real a mudanças vindas de outras views.
  _renderKPIs({ equipamentos, registros, alerts });
}

export async function renderDashboard() {
  const viewInicio = Utils.getEl('view-inicio');
  if (!viewInicio) return;

  // Skeleton cobre TODO o ciclo — incluindo o await do planContext — para
  // que o usuário nunca veja a view em branco enquanto buscamos o perfil operacional.
  return withSkeleton(viewInicio, { enabled: true, variant: 'generic', count: 4 }, async () => {
    const planContext = await resolveDashboardPlanContext();
    const { equipamentos, registros, clientes, setores } = getState();
    const alerts = Alerts.getAll();

    const tier = _planTier(planContext.planCode);
    const navigationMode = getNavigationMode();
    const isEmpresaPro = planContext.hasPro && navigationMode === NAV_MODE_EMPRESA;
    const proDraft = _buildProDraftModel({
      tier,
      isEmpresaPro,
      clientes,
      equipamentos,
      registros,
      alerts,
      setores,
    });
    let dashboardReadModel = _buildDashboardReadModel({
      equipamentos,
      registros,
      clientes,
      setores,
      alerts,
      planContext,
      navigationMode,
    });

    // Tier no root pra theming
    const dashRoot = document.getElementById('dash');
    if (dashRoot) dashRoot.setAttribute('data-tier', tier);

    // ─── Continue card (UX V2 audit fix) ──────────────────────────────
    // Se ha rascunho de registro em sessionStorage, mostra card sticky no
    // topo "Continuar registro de [Equipamento]" pra resgatar o flow.
    // Onboarding checklist: card "Primeiros passos" aparece no topo do
    // painel até o usuário completar 5/5 ou dispensar. Auto-detecta cliente,
    // equipamento e serviço via getState(). Relatório e PDF requerem hooks
    // explícitos (já plugados em routes.js + shareReport.js).
    const onboarding = _buildDashboardOnboardingModel({
      tier,
      dashboardReadModel,
      equipamentos,
      registros,
      planContext,
    });
    await _renderOnboardingBlocks({ onboarding });

    // KPIs
    const { mountPromise: kpisMountPromise } = _renderKPIs({
      equipamentos,
      registros,
      alerts,
      viewModel: dashboardReadModel,
    });
    await kpisMountPromise;

    // Nome do usuário — cascata priorizando o que o próprio usuário digitou
    // no FTX (Profile local). O Supabase popula `user_metadata.name` com o
    // email no signup, então ler dele antes do Profile faz o hero mostrar
    // "Olá, <email>" mesmo quando o técnico já cadastrou o nome no FTX.
    // Ordem correta: Profile (input explícito) → user_metadata → prettify(email).
    let userName = '';
    try {
      const user = await Auth.getUser();
      userName =
        Profile.get()?.nome ||
        _nonEmailMetadataName(user?.user_metadata?.full_name) ||
        _nonEmailMetadataName(user?.user_metadata?.name) ||
        _prettifyEmailLocalPart(user?.email) ||
        '';
    } catch {
      // sem fallback: userName fica vazio e o hero cai em "Técnico"
    }

    dashboardReadModel = _buildDashboardReadModel({
      equipamentos,
      registros,
      clientes,
      setores,
      alerts,
      planContext,
      navigationMode,
      userName,
    });

    await _renderHero({ viewModel: dashboardReadModel });

    _populateHeaderIdentity({ tier, userName });

    await _renderNextActionCard({ viewModel: dashboardReadModel });
    await _renderLastServiceCard({ viewModel: dashboardReadModel });
    await _renderMonthView({ viewModel: dashboardReadModel });
    await _renderProDraftBlocks({ proDraft });

    // Seções secundárias read-only
    await _renderReadOnlyBlocks({
      equipamentos,
      registros,
      alerts,
      planContext,
      isEmpresaPro,
      clientes,
    });

    // Plan extras: onboarding + overflow banner (Free only)
    OnboardingBanner.render({ userId: planContext.userId });

    // Banner + modal de overflow (só para Free acima dos limites).
    // Substitui o par usage-meter + upgrade-card anteriores — aparece
    // apenas quando há razão, em vez de ocupar espaço permanentemente.
    if (onboarding.overflow.state?.overLimit) {
      OverflowBanner.maybeShowFirstTimeModal({ state: onboarding.overflow.state });
    }

    // Header global (status, sync, badges)
    updateGlobalHeader({ equipamentos, registros, alerts });

    // Charts
    _refreshCharts({ equipamentos, registros });
  });
}
