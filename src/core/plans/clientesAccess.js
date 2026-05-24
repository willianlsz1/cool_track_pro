import { PLAN_CODE_FREE, getPlanForUser, normalizePlanCode } from './subscriptionPlans.js';

export function canAccessClientes() {
  return true;
}

function normalizeClientesCount(currentClientesCount) {
  const parsed = Number.parseInt(String(currentClientesCount || '0'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function canCreateCliente({ currentClientesCount = 0, isEditing = false } = {}) {
  const limit = getPlanForUser().limits.clientes;
  const current = normalizeClientesCount(currentClientesCount);

  return {
    allowed: true,
    limit,
    current,
    planCode: PLAN_CODE_FREE,
    requiredPlan: isEditing ? null : null,
  };
}

function buildDecision(planCode = PLAN_CODE_FREE) {
  const normalized = normalizePlanCode(planCode);
  return {
    resolved: true,
    source: 'commercial_removed',
    errored: false,
    planCode: normalized,
    canAccess: true,
  };
}

export function getClientesAccessSnapshot() {
  return buildDecision();
}

export async function resolveClientesAccess() {
  return buildDecision();
}
