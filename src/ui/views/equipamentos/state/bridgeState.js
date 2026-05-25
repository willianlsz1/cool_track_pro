/**
 * Module-level DOM bridge cache/generation state for equipamentos.
 *
 * Extraído de src/ui/views/equipamentos.js no Mudança 11 / CP-B.5.
 * Preserva promises memoizadas, referências carregadas e generation counters.
 */

let _equipamentosHeaderBridgePromise = null;
let _equipamentosHeaderBridge = null;
let _equipamentosHeaderRenderGeneration = 0;

let _equipamentosListBridgePromise = null;
let _equipamentosListBridge = null;
let _equipamentosListRenderGeneration = 0;

export function getEquipamentosHeaderBridgePromise() {
  return _equipamentosHeaderBridgePromise;
}

export function setEquipamentosHeaderBridgePromise(promise) {
  _equipamentosHeaderBridgePromise = promise;
}

export function clearEquipamentosHeaderBridgePromise() {
  _equipamentosHeaderBridgePromise = null;
}

export function getEquipamentosHeaderBridge() {
  return _equipamentosHeaderBridge;
}

export function setEquipamentosHeaderBridge(bridge) {
  _equipamentosHeaderBridge = bridge;
}

export function clearEquipamentosHeaderBridge() {
  _equipamentosHeaderBridge = null;
}

export function getEquipamentosHeaderRenderGeneration() {
  return _equipamentosHeaderRenderGeneration;
}

export function incrementEquipamentosHeaderRenderGeneration() {
  _equipamentosHeaderRenderGeneration += 1;
  return _equipamentosHeaderRenderGeneration;
}

export function getEquipamentosListBridgePromise() {
  return _equipamentosListBridgePromise;
}

export function setEquipamentosListBridgePromise(promise) {
  _equipamentosListBridgePromise = promise;
}

export function clearEquipamentosListBridgePromise() {
  _equipamentosListBridgePromise = null;
}

export function getEquipamentosListBridge() {
  return _equipamentosListBridge;
}

export function setEquipamentosListBridge(bridge) {
  _equipamentosListBridge = bridge;
}

export function clearEquipamentosListBridge() {
  _equipamentosListBridge = null;
}

export function getEquipamentosListRenderGeneration() {
  return _equipamentosListRenderGeneration;
}

export function incrementEquipamentosListRenderGeneration() {
  _equipamentosListRenderGeneration += 1;
  return _equipamentosListRenderGeneration;
}

export function clearBridgeState() {
  _equipamentosHeaderBridgePromise = null;
  _equipamentosHeaderBridge = null;
  _equipamentosHeaderRenderGeneration = 0;
  _equipamentosListBridgePromise = null;
  _equipamentosListBridge = null;
  _equipamentosListRenderGeneration = 0;
}
