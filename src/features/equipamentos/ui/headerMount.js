const headerMountDeps = {
  Utils: null,
  mountHeaderBridge: null,
};

export function configureHeaderMount(deps = {}) {
  Object.assign(headerMountDeps, deps);
}

function requireHeaderMountDep(name) {
  const dep = headerMountDeps[name];
  if (!dep) {
    throw new Error(`header mount dependency not configured: ${name}`);
  }
  return dep;
}

export function mountEquipamentosHeader(viewModel) {
  const Utils = requireHeaderMountDep('Utils');
  const mountHeaderBridge = requireHeaderMountDep('mountHeaderBridge');

  return mountHeaderBridge({
    viewModel,
    root: Utils.getEl('equip-hero'),
    filtersRoot: Utils.getEl('equip-filters'),
    contextRoot: Utils.getEl('equip-context-chip'),
  });
}
