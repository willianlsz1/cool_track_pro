import {
  getEquipamentosListBridge,
  getEquipamentosListBridgePromise,
  getEquipamentosListRenderGeneration,
  incrementEquipamentosListRenderGeneration,
  setEquipamentosListBridge,
  setEquipamentosListBridgePromise,
} from '../state/bridgeState.js';

/** @sliceTarget controller/bridges */
export function loadEquipamentosListBridge() {
  let promise = getEquipamentosListBridgePromise();
  if (!promise) {
    promise = import('../../../react/entrypoints/equipamentosListIsland.jsx').then((bridge) => {
      setEquipamentosListBridge(bridge);
      return bridge;
    });
    setEquipamentosListBridgePromise(promise);
  }
  return promise;
}

/** @sliceTarget ui/unmount */
export function unmountEquipamentosList() {
  incrementEquipamentosListRenderGeneration();
  const root = document.getElementById('lista-equip');
  if (!root?.dataset.reactEquipamentosListMounted) return null;

  const bridge = getEquipamentosListBridge();
  if (bridge?.unmountEquipamentosListReact) {
    bridge.unmountEquipamentosListReact(root);
    return null;
  }

  return loadEquipamentosListBridge().then(({ unmountEquipamentosListReact }) => {
    unmountEquipamentosListReact(root);
    return null;
  });
}

export function mountEquipamentosList({ root, viewModel, onMounted } = {}) {
  if (!root) return null;
  const renderGeneration = incrementEquipamentosListRenderGeneration();

  return loadEquipamentosListBridge().then(({ mountEquipamentosListReact }) => {
    if (renderGeneration !== getEquipamentosListRenderGeneration()) return null;
    const mounted = mountEquipamentosListReact(root, { viewModel });
    onMounted?.();
    return mounted;
  });
}
