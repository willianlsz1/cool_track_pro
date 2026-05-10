import { buildSetorGridForClienteModel } from '../setor/setorState.js';

const renderEquipDeps = {
  Utils: null,
  resolveEquipCtx: null,
  stripRenderInternalOptions: null,
  isCachedPlanPro: null,
  bindRenderEquipPlanInvalidationEvents: null,
  incrementRenderEquipPlanToken: null,
  getRenderEquipPlanNeedsRefresh: null,
  refreshRenderEquipPlan: null,
  populateSetorSelect: null,
  getState: null,
  getPreventivaDueEquipmentIds: null,
  buildEquipamentosHeaderViewModel: null,
  computeEquipKpis: null,
  mountEquipamentosHeader: null,
  setToolbar: null,
  renderFlatList: null,
  renderSetorGrid: null,
  renderSetorGridForCliente: null,
  findSetor: null,
};

export function configureRenderEquip(deps = {}) {
  Object.assign(renderEquipDeps, deps);
}

function getRequiredRenderEquipDep(name) {
  const dep = renderEquipDeps[name];
  if (!dep) {
    throw new Error(`renderEquip dependency not configured: ${name}`);
  }
  return dep;
}

function buildRenderEquipContext(filtro = '', options = {}) {
  getRequiredRenderEquipDep('bindRenderEquipPlanInvalidationEvents')();
  const renderToken = getRequiredRenderEquipDep('incrementRenderEquipPlanToken')();
  const renderOptions = getRequiredRenderEquipDep('stripRenderInternalOptions')(options);
  const equipCtx = getRequiredRenderEquipDep('resolveEquipCtx')(renderOptions);
  const activeSectorId = equipCtx.sectorId;
  const activeQuickFilter = equipCtx.quickFilter;
  const activeClienteId = equipCtx.clienteId;
  const activeClienteNome = equipCtx.clienteNome;
  // Spread opcional pra propagar o filtro de cliente nas renderFlatList calls.
  const renderOptionsWithClient = activeClienteId
    ? { ...renderOptions, clienteId: activeClienteId, clienteNome: activeClienteNome }
    : renderOptions;
  const isPro = getRequiredRenderEquipDep('isCachedPlanPro')();

  return {
    filtro,
    options,
    renderToken,
    renderOptions,
    renderOptionsWithClient,
    equipCtx,
    activeSectorId,
    activeQuickFilter,
    activeClienteId,
    activeClienteNome,
    isPro,
  };
}

function syncRenderEquipPlanAndSubtitle(context) {
  const Utils = getRequiredRenderEquipDep('Utils');
  // Renderiza imediatamente com snapshot local do plano (nao bloqueia a tela).
  // O refresh assincrono corrige drift e evita fetch repetido em cada render.
  const subtitleEl = Utils.getEl('equip-page-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = context.isPro
      ? 'Ação rápida em todos os clientes e setores.'
      : 'Acompanhe seus equipamentos e registre serviços rápido.';
  }
  getRequiredRenderEquipDep('populateSetorSelect')(context.isPro);
  if (
    !context.options?.__skipPlanRefresh &&
    getRequiredRenderEquipDep('getRenderEquipPlanNeedsRefresh')()
  ) {
    getRequiredRenderEquipDep('refreshRenderEquipPlan')({
      filtro: context.filtro,
      options: context.renderOptions,
      renderToken: context.renderToken,
      isProAtRender: context.isPro,
    });
  }
}

function mountRenderEquipHeader(context) {
  const headerState = getRequiredRenderEquipDep('getState')();
  const headerRegistros = Array.isArray(headerState.registros) ? headerState.registros : [];
  const headerPreventivaVencidaIds = getRequiredRenderEquipDep('getPreventivaDueEquipmentIds')(
    headerRegistros,
    0,
  );
  return getRequiredRenderEquipDep('mountEquipamentosHeader')({
    ...getRequiredRenderEquipDep('buildEquipamentosHeaderViewModel')({
      equipamentos: headerState.equipamentos,
      activeQuickFilter: context.activeQuickFilter,
      activeClienteId: context.activeClienteId,
      activeClienteNome: context.activeClienteNome || '',
      activeSectorId: context.activeSectorId,
      kpis: getRequiredRenderEquipDep('computeEquipKpis')(headerState),
      preventivaVencidaIds: headerPreventivaVencidaIds,
    }),
  });
}

function renderEquipQuickFilterBranch(context, headerRender) {
  // Quick filter ativo sobrescreve o fluxo normal: vai pra flat list com
  // statusFilter correspondente. Sempre rende com a toolbar "<- Todos" pra dar
  // caminho de volta claro.
  if (!context.activeQuickFilter) return null;

  const Utils = getRequiredRenderEquipDep('Utils');
  const searchBar = Utils.getEl('equip-search-bar');
  if (searchBar) searchBar.style.display = '';
  const titleMap = {
    'sem-setor': 'Sem setor',
    'em-atencao': 'Em atenção',
    criticos: 'Críticos',
    'preventiva-vencida': 'Preventiva vencida',
  };
  getRequiredRenderEquipDep('setToolbar')({
    title: titleMap[context.activeQuickFilter] || 'Equipamentos',
    extraBtn: `<button class="btn btn--outline btn--sm" data-action="equip-quickfilter" data-id="todos">← Todos</button>`,
  });

  if (context.activeQuickFilter === 'sem-setor') {
    const listRender = getRequiredRenderEquipDep('renderFlatList')(
      context.filtro,
      context.renderOptionsWithClient,
      '__sem_setor__',
    );
    return Promise.all([headerRender, listRender]).then(([, result]) => result);
  }
  const listRender = getRequiredRenderEquipDep('renderFlatList')(
    context.filtro,
    { ...context.renderOptionsWithClient, statusFilter: context.activeQuickFilter },
    null,
  );
  return Promise.all([headerRender, listRender]).then(([, result]) => result);
}

function renderEquipSetorGridBranch(context, headerRender, searchBar) {
  if (context.isPro && context.activeSectorId === null && searchBar) searchBar.style.display = '';

  // Vista Pro padrao: grade de setores (global ou filtrada por cliente).
  // Regressao pos-revert: esse branch tinha se perdido e caia sempre na lista
  // flat, ocultando a feature de Setores (cards, Novo setor, Ver/Editar).
  if (!(context.isPro && context.activeSectorId === null)) return null;

  if (context.activeClienteId) {
    const { setores = [], equipamentos = [] } = getRequiredRenderEquipDep('getState')();
    const clienteSetorModel = buildSetorGridForClienteModel({
      setores,
      equipamentos,
      clienteId: context.activeClienteId,
    });
    if (!clienteSetorModel.setoresDoCliente.length) return null;

    const setorial = Promise.resolve(
      getRequiredRenderEquipDep('renderSetorGridForCliente')(
        context.activeClienteId,
        context.activeClienteNome,
      ),
    );
    return Promise.all([headerRender, setorial]).then(([, result]) => result);
  }
  const setorial = Promise.resolve(getRequiredRenderEquipDep('renderSetorGrid')());
  return Promise.all([headerRender, setorial]).then(([, result]) => result);
}

function syncRenderEquipListToolbar(context, searchBar) {
  // Vista lista (FREE ou drill-down de setor)
  if (searchBar) searchBar.style.display = '';

  if (context.activeSectorId) {
    syncRenderEquipSectorToolbar(context);
    return;
  }

  if (context.activeClienteId) {
    syncRenderEquipClienteToolbar(context);
    return;
  }

  // Vista FREE/Plus: toolbar SEM "+ Novo setor". Setores depende de
  // Clientes (Pro-only) - sem clientes cadastrados, o botao vira ruido.
  // O upgrade aparece naturalmente no hero/empty state quando o user
  // ja tem 5+ equipamentos sem setor (ver hero.js).
  getRequiredRenderEquipDep('setToolbar')({
    title: 'Equipamentos',
  });
}

function syncRenderEquipClienteToolbar(context) {
  const Utils = getRequiredRenderEquipDep('Utils');
  const clienteNome = context.activeClienteNome
    ? Utils.truncate(context.activeClienteNome, 28)
    : 'cliente';
  getRequiredRenderEquipDep('setToolbar')({
    title: `Equipamentos de ${clienteNome}`,
    extraBtn:
      `<button class="btn btn--outline btn--sm" data-action="open-setor-modal" data-cliente-id="${Utils.escapeAttr(context.activeClienteId)}">+ Novo setor</button>` +
      '<button class="btn btn--ghost btn--sm" data-action="equip-clear-cliente-filter" title="Voltar para todos os equipamentos">x Limpar cliente</button>',
  });
}

function syncRenderEquipSectorToolbar(context) {
  const Utils = getRequiredRenderEquipDep('Utils');
  // Drill-down: mostra equipamentos do setor
  const setor =
    context.activeSectorId === '__sem_setor__'
      ? { nome: 'Sem setor' }
      : getRequiredRenderEquipDep('findSetor')(context.activeSectorId);
  const nome = setor?.nome ?? 'Setor';
  // Contexto cliente: titulo "Setor X · Cliente Y" e back vai pra grid do cliente
  const titlePrefix = context.activeClienteNome
    ? `${Utils.truncate(nome, 22)} - ${Utils.truncate(context.activeClienteNome, 18)}`
    : Utils.truncate(nome, 28);
  const backLabel = context.activeClienteNome ? '<- Setores do cliente' : '<- Setores';
  // Bug fix #103: "+ Novo equipamento" precisa carregar o contexto atual.
  // Sem isso, user navega Cliente -> Setor -> + Novo equipamento e o form
  // abre vazio, perdendo a hierarquia que ele acabou de percorrer.
  // data-setor-id + data-cliente-id sao lidos pelo handler open-modal pra
  // pre-preencher os dropdowns Setor e Cliente no modal-add-eq.
  const novoEquipBtn =
    context.activeSectorId !== '__sem_setor__'
      ? `<button class="btn btn--primary btn--sm"
              data-action="open-modal" data-id="modal-add-eq"
              data-setor-id="${Utils.escapeAttr(context.activeSectorId)}"
              ${
                context.activeClienteId
                  ? `data-cliente-id="${Utils.escapeAttr(context.activeClienteId)}"`
                  : ''
              }
              data-source="setor_drill">+ Novo equipamento</button>`
      : '';
  getRequiredRenderEquipDep('setToolbar')({
    title: titlePrefix,
    extraBtn: `${novoEquipBtn}<button class="btn btn--outline btn--sm" data-action="back-to-setores">${backLabel}</button>`,
    hideDefaultCta: true,
  });
}

function renderEquipListBranch(context, headerRender) {
  // O filtro de cliente ja foi tratado mais cedo via early-return - aqui
  // segue o flow normal de drill-down em setor ou lista flat default.
  const listRender = getRequiredRenderEquipDep('renderFlatList')(
    context.filtro,
    context.renderOptionsWithClient,
    context.activeSectorId,
  );
  return Promise.all([headerRender, listRender]).then(([, result]) => result);
}

export async function renderEquip(filtro = '', options = {}) {
  const context = buildRenderEquipContext(filtro, options);
  syncRenderEquipPlanAndSubtitle(context);

  const headerRender = mountRenderEquipHeader(context);
  const quickFilterRender = renderEquipQuickFilterBranch(context, headerRender);
  if (quickFilterRender) return quickFilterRender;

  const searchBar = getRequiredRenderEquipDep('Utils').getEl('equip-search-bar');
  const setorGridRender = renderEquipSetorGridBranch(context, headerRender, searchBar);
  if (setorGridRender) return setorGridRender;

  syncRenderEquipListToolbar(context, searchBar);
  return renderEquipListBranch(context, headerRender);
}
