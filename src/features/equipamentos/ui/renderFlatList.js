const renderFlatListDeps = {
  getState: null,
  Utils: null,
  createEquipRenderEvalContext: null,
  getPreventivaDueEquipmentIds: null,
  buildEquipamentosViewModel: null,
  buildReactListViewModel: null,
  resolveIdleClusterCollapsed: null,
  isCachedPlanPro: null,
  withSkeleton: null,
  mountEquipamentosList: null,
  bindEquipCardImageFallbacks: null,
};

export function configureRenderFlatList(deps = {}) {
  Object.assign(renderFlatListDeps, deps);
}

function getRenderFlatListDep(name) {
  const dep = renderFlatListDeps[name];
  if (!dep) {
    throw new Error(`renderFlatList dependency not configured: ${name}`);
  }
  return dep;
}

function buildRenderFlatListStateSnapshot() {
  const { equipamentos, registros, clientes, setores } = getRenderFlatListDep('getState')();
  return { equipamentos, registros, clientes, setores };
}

function buildRenderFlatListContext(filtro = '', options = {}, setorId = null) {
  const state = buildRenderFlatListStateSnapshot();
  const evalCtx = getRenderFlatListDep('createEquipRenderEvalContext')();

  // Filtro por cliente vindo da view /clientes ("Ver equipamentos"). Se
  // setado em options.clienteId, restringe a lista a equipamentos vinculados.
  const filterClienteId = options.clienteId || null;
  return { evalCtx, filterClienteId, filtro, options, setorId, state };
}

function buildRenderFlatListViewModel(context) {
  const { equipamentos, registros, clientes, setores } = context.state;
  const { evalCtx, filterClienteId, filtro, options, setorId } = context;
  const getPreventivaDueEquipmentIds = getRenderFlatListDep('getPreventivaDueEquipmentIds');

  return getRenderFlatListDep('buildEquipamentosViewModel')({
    equipamentos,
    clientes,
    setores,
    filtro,
    setorId,
    clienteId: filterClienteId,
    clienteNome: options.clienteNome || '',
    statusFilter: options.statusFilter || '',
    preventiva7dIds:
      options.statusFilter === 'preventiva-7d' ? getPreventivaDueEquipmentIds(registros, 7) : [],
    preventiva30dIds:
      options.statusFilter === 'preventiva-30d' ? getPreventivaDueEquipmentIds(registros, 30) : [],
    preventivaVencidaIds:
      options.statusFilter === 'preventiva-vencida'
        ? getPreventivaDueEquipmentIds(registros, 0)
        : [],
    getActionPriority: evalCtx.getActionPriority,
    getPriority: evalCtx.getPriority,
    getRisk: evalCtx.getRisk,
    isFullyIdle: evalCtx.isFullyIdle,
  });
}

function resolveRenderFlatListRoot() {
  return getRenderFlatListDep('Utils').getEl('lista-equip');
}

function resolveRenderFlatListIdleCluster(viewModel) {
  // PR4 §12.3 · Particiona idle vs ativo pra decidir sobre idle-cluster.
  //  · Cluster coleta idles quando ≥5 (histerese solta ≤2).
  //  · Posição: cluster sempre acima dos cards ativos — mas só se houver
  //    ao menos 1 card ativo pra contrastar. Em lista só-de-idle o cluster
  //    perde valor (nada pra "esconder") e volta a render linear.
  const idleList = viewModel.idleItems;
  const activeList = viewModel.activeItems;
  return (
    getRenderFlatListDep('resolveIdleClusterCollapsed')(idleList.length) &&
    idleList.length > 0 &&
    activeList.length > 0
  );
}

function buildRenderFlatListReactViewModel(context, viewModel) {
  const clusterActive = resolveRenderFlatListIdleCluster(viewModel);

  return getRenderFlatListDep('buildReactListViewModel')(viewModel, {
    evalCtx: context.evalCtx,
    clusterActive,
    filterClienteId: context.filterClienteId,
    isPro: getRenderFlatListDep('isCachedPlanPro')(),
  });
}

function bindRenderFlatListImageFallbacks(root) {
  getRenderFlatListDep('bindEquipCardImageFallbacks')(root);
}

function mountRenderFlatListReactIsland(root, viewModel, reactViewModel) {
  return getRenderFlatListDep('withSkeleton')(
    root,
    { enabled: true, variant: 'equipment', count: viewModel.skeletonCount },
    () =>
      getRenderFlatListDep('mountEquipamentosList')({
        root,
        viewModel: reactViewModel,
        onMounted: () => bindRenderFlatListImageFallbacks(root),
      }),
  );
}

/** Renderiza a lista flat de equipamentos (FREE ou drill-down de um setor). */
/**
 * @sliceSplit
 *   ui/list: build do reactViewModel + render skeleton + mount React
 *   controller/render: orquestra fetch state, viewModel build, generation counter
 */
export function renderFlatList(filtro = '', options = {}, setorId = null) {
  const context = buildRenderFlatListContext(filtro, options, setorId);
  const viewModel = buildRenderFlatListViewModel(context);
  const root = resolveRenderFlatListRoot();
  if (!root) return;

  const reactViewModel = buildRenderFlatListReactViewModel(context, viewModel);
  return mountRenderFlatListReactIsland(root, viewModel, reactViewModel);
}
