import {
  getEquipamentosHeaderBridge,
  getEquipamentosHeaderBridgePromise,
  getEquipamentosHeaderRenderGeneration,
  incrementEquipamentosHeaderRenderGeneration,
  setEquipamentosHeaderBridge,
  setEquipamentosHeaderBridgePromise,
} from '../state/bridgeState.js';

/** @sliceTarget controller/bridges */
export function loadEquipamentosHeaderBridge() {
  let promise = getEquipamentosHeaderBridgePromise();
  if (!promise) {
    promise = import('../../../react/entrypoints/equipamentosHeaderIsland.jsx').then((bridge) => {
      setEquipamentosHeaderBridge(bridge);
      return bridge;
    });
    setEquipamentosHeaderBridgePromise(promise);
  }
  return promise;
}

/** @sliceTarget ui/unmount */
export function unmountEquipamentosHeader() {
  incrementEquipamentosHeaderRenderGeneration();
  const root = document.getElementById('equip-hero');
  if (!root?.dataset.reactEquipamentosHeaderMounted) return null;

  const bridge = getEquipamentosHeaderBridge();
  if (bridge?.unmountEquipamentosHeaderReact) {
    bridge.unmountEquipamentosHeaderReact(root);
    return null;
  }

  return loadEquipamentosHeaderBridge().then(({ unmountEquipamentosHeaderReact }) => {
    unmountEquipamentosHeaderReact(root);
    return null;
  });
}

/** @sliceTarget controller/mount */
export function mountEquipamentosHeader({ viewModel, root, filtersRoot, contextRoot }) {
  if (!root) return null;
  const renderGeneration = incrementEquipamentosHeaderRenderGeneration();

  return loadEquipamentosHeaderBridge().then(({ mountEquipamentosHeaderReact }) => {
    if (renderGeneration !== getEquipamentosHeaderRenderGeneration()) return null;
    return mountEquipamentosHeaderReact(root, { viewModel, filtersRoot, contextRoot });
  });
}
