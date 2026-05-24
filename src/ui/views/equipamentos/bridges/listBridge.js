import {
  getEquipamentosListBridge,
  getEquipamentosListBridgePromise,
  getEquipamentosListRenderGeneration,
  incrementEquipamentosListRenderGeneration,
  setEquipamentosListBridge,
  setEquipamentosListBridgePromise,
} from '../state/bridgeState.js';
import { mountEquipamentosListDom, unmountEquipamentosListDom } from '../ui/listRenderer.js';

/** @sliceTarget controller/bridges */
export function loadEquipamentosListBridge() {
  let promise = getEquipamentosListBridgePromise();
  if (!promise) {
    const bridge = { mountEquipamentosListDom, unmountEquipamentosListDom };
    setEquipamentosListBridge(bridge);
    promise = Promise.resolve(bridge);
    setEquipamentosListBridgePromise(promise);
  }
  return promise;
}

/** @sliceTarget ui/unmount */
export function unmountEquipamentosList() {
  incrementEquipamentosListRenderGeneration();
  const root = document.getElementById('lista-equip');
  if (!root?.dataset.equipamentosListMounted) return null;

  const bridge = getEquipamentosListBridge();
  if (bridge?.unmountEquipamentosListDom) {
    bridge.unmountEquipamentosListDom(root);
    return null;
  }

  return loadEquipamentosListBridge().then(({ unmountEquipamentosListDom }) => {
    unmountEquipamentosListDom(root);
    return null;
  });
}

export function mountEquipamentosList({ root, viewModel, onMounted } = {}) {
  if (!root) return null;
  const renderGeneration = incrementEquipamentosListRenderGeneration();

  return loadEquipamentosListBridge().then(({ mountEquipamentosListDom }) => {
    if (renderGeneration !== getEquipamentosListRenderGeneration()) return null;
    const mounted = mountEquipamentosListDom(root, { viewModel });
    onMounted?.();
    return mounted;
  });
}
