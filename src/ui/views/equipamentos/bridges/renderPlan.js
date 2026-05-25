import { setCachedPlan } from '../../../../core/plans/planCache.js';
import { getEffectivePlan } from '../../../../core/plans/operationalAccessPolicy.js';
import {
  clearRenderEquipPlanRefreshPromise,
  getRenderEquipPlanEventsBound,
  getRenderEquipPlanRefreshPromise,
  getRenderEquipPlanToken,
  setRenderEquipPlanEventsBound,
  setRenderEquipPlanNeedsRefresh,
  setRenderEquipPlanRefreshPromise,
} from '../state/renderPlanState.js';

let renderEquipHandler = null;

export function configureRenderEquipPlan({ renderEquip } = {}) {
  renderEquipHandler = typeof renderEquip === 'function' ? renderEquip : null;
}

/** @sliceTarget controller/eventBind */
export function bindRenderEquipPlanInvalidationEvents() {
  if (getRenderEquipPlanEventsBound() || typeof window === 'undefined') return;
  setRenderEquipPlanEventsBound(true);
  ['cooltrack:auth-changed', 'cooltrack:profile-updated', 'cooltrack:plan-changed'].forEach(
    (eventName) => {
      window.addEventListener(eventName, () => {
        setRenderEquipPlanNeedsRefresh(true);
      });
    },
  );
}

/** @sliceTarget controller/planSync */
export function refreshRenderEquipPlan({
  filtro = '',
  options = {},
  renderToken,
  isProAtRender = false,
} = {}) {
  const activePromise = getRenderEquipPlanRefreshPromise();
  if (activePromise) return;

  const refreshPromise = (async () => {
    try {
      const { fetchOperationalProfileCached } =
        await import('../../../../core/plans/operationalPlan.js');
      const { profile } = await fetchOperationalProfileCached();
      setCachedPlan(getEffectivePlan(profile));
      setRenderEquipPlanNeedsRefresh(false);
      const nextIsPro = true;
      if (renderToken !== getRenderEquipPlanToken()) return;
      if (nextIsPro !== isProAtRender) {
        renderEquipHandler?.(filtro, { ...options, __skipPlanRefresh: true });
      }
    } catch {
      /* fallback silencioso: mantém estado atual de render */
    } finally {
      clearRenderEquipPlanRefreshPromise();
    }
  })();

  setRenderEquipPlanRefreshPromise(refreshPromise);
}
