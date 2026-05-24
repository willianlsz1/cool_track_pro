import { PLAN_CODE_FREE } from './subscriptionPlans.js';

let _hydratedInSession = false;

export function setCachedPlan() {
  _hydratedInSession = true;
  try {
    localStorage.removeItem('cooltrack-cached-plan');
  } catch {
    /* storage indisponivel */
  }
}

export function getCachedPlan() {
  return PLAN_CODE_FREE;
}

export function hasHydratedPlanInSession() {
  return _hydratedInSession;
}

export function isCachedPlanPro() {
  return false;
}

export function isCachedPlanPlus() {
  return false;
}

export function isCachedPlanPlusOrHigher() {
  return false;
}
