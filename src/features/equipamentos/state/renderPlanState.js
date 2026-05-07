/**
 * Module-level render plan refresh state for equipamentos.
 *
 * Extraído de src/ui/views/equipamentos.js no Mudança 11 / CP-C.
 * Mantém token de render, flags de invalidação e promise memoizada.
 */

let _renderEquipPlanToken = 0;
let _renderEquipPlanNeedsRefresh = true;
let _renderEquipPlanEventsBound = false;
let _renderEquipPlanRefreshPromise = null;

export function getRenderEquipPlanToken() {
  return _renderEquipPlanToken;
}

export function incrementRenderEquipPlanToken() {
  _renderEquipPlanToken += 1;
  return _renderEquipPlanToken;
}

export function getRenderEquipPlanNeedsRefresh() {
  return _renderEquipPlanNeedsRefresh;
}

export function setRenderEquipPlanNeedsRefresh(value) {
  _renderEquipPlanNeedsRefresh = value;
}

export function getRenderEquipPlanEventsBound() {
  return _renderEquipPlanEventsBound;
}

export function setRenderEquipPlanEventsBound(value) {
  _renderEquipPlanEventsBound = value;
}

export function getRenderEquipPlanRefreshPromise() {
  return _renderEquipPlanRefreshPromise;
}

export function setRenderEquipPlanRefreshPromise(promise) {
  _renderEquipPlanRefreshPromise = promise;
}

export function clearRenderEquipPlanRefreshPromise() {
  _renderEquipPlanRefreshPromise = null;
}

export function clearRenderPlanState() {
  _renderEquipPlanToken = 0;
  _renderEquipPlanNeedsRefresh = true;
  _renderEquipPlanEventsBound = false;
  _renderEquipPlanRefreshPromise = null;
}
