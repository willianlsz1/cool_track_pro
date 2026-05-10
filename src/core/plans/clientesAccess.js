import { getCachedPlan, hasHydratedPlanInSession, setCachedPlan } from './planCache.js';
import { fetchMyProfileBillingCached, getCachedBillingProfileSnapshot } from './monetization.js';
import {
  getEffectivePlan,
  getPlanForUser,
  normalizePlanCode,
  PLAN_CODE_FREE,
  PLAN_CODE_PLUS,
} from './subscriptionPlans.js';

export function canAccessClientes(planCode) {
  return Boolean(normalizePlanCode(planCode));
}

function normalizeClientesCount(currentClientesCount) {
  const parsed = Number.parseInt(String(currentClientesCount || '0'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function canCreateCliente({ planCode, currentClientesCount = 0, isEditing = false } = {}) {
  const normalized = normalizePlanCode(planCode);
  const limit = getPlanForUser({ planCode: normalized }).limits.clientes;
  const current = normalizeClientesCount(currentClientesCount);

  if (isEditing) {
    return { allowed: true, limit, current, planCode: normalized, requiredPlan: null };
  }

  const allowed = !Number.isFinite(limit) || current < limit;
  return {
    allowed,
    limit,
    current,
    planCode: normalized,
    requiredPlan: allowed ? null : PLAN_CODE_PLUS,
  };
}

function buildDecision(planCode, { resolved, source, errored = false } = {}) {
  const normalized = normalizePlanCode(planCode);
  return {
    resolved: Boolean(resolved),
    source: source || 'unknown',
    errored,
    planCode: normalized,
    canAccess: canAccessClientes(normalized),
  };
}

export function getClientesAccessSnapshot() {
  const billingSnapshot = getCachedBillingProfileSnapshot();
  if (billingSnapshot?.profile) {
    const planFromBilling = getEffectivePlan(billingSnapshot.profile);
    if (planFromBilling !== getCachedPlan()) setCachedPlan(planFromBilling);
    return buildDecision(planFromBilling, { resolved: true, source: 'billing_snapshot' });
  }

  const cachedPlan = getCachedPlan();
  const hydrated = hasHydratedPlanInSession();

  // Evita decisao de limite com cache Free stale antes da hidratacao do plano.
  if (!hydrated && normalizePlanCode(cachedPlan) === PLAN_CODE_FREE) {
    return buildDecision(cachedPlan, { resolved: false, source: 'pending_hydration' });
  }

  return buildDecision(cachedPlan, {
    resolved: true,
    source: hydrated ? 'plan_cache' : 'plan_cache_paid',
  });
}

export async function resolveClientesAccess() {
  const snapshot = getClientesAccessSnapshot();
  if (snapshot.resolved) return snapshot;

  try {
    const { profile } = await fetchMyProfileBillingCached({ forceRefresh: true });
    const planCode = getEffectivePlan(profile);
    setCachedPlan(planCode);
    return buildDecision(planCode, { resolved: true, source: 'billing_fetch' });
  } catch {
    return buildDecision(snapshot.planCode, {
      // Não fecha como "resolved" em erro de refresh para evitar paywall
      // indevido (ex.: usuário Pro com cache stale free durante boot).
      resolved: false,
      source: 'pending_on_error',
      errored: true,
    });
  }
}
