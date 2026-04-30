import { getCachedPlan, hasHydratedPlanInSession, setCachedPlan } from './planCache.js';
import { fetchMyProfileBillingCached, getCachedBillingProfileSnapshot } from './monetization.js';
import { getEffectivePlan, normalizePlanCode, PLAN_CODE_PRO } from './subscriptionPlans.js';

export function canAccessClientes(planCode) {
  return normalizePlanCode(planCode) === PLAN_CODE_PRO;
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

  // Evita paywall prematuro: se ainda não hidratou nesta sessão e o cache diz
  // free/plus, tratamos como "pendente" e pedimos refresh antes de bloquear.
  if (!hydrated && !canAccessClientes(cachedPlan)) {
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
