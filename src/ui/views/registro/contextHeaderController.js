import { buildRegistroViewModel } from '../../viewModels/registroViewModel.js';
import { renderRegistroHeader, unmountRegistroHeaderDom } from './headerRenderer.js';

const deps = {};

export function configureRegistroContextHeaderController(options = {}) {
  Object.assign(deps, options);
}

function getDep(name) {
  const value = deps[name];
  if (!value) throw new Error(`[registroContextHeaderController] dependencia ausente: ${name}`);
  return value;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function applyClienteDetailsContext(context) {
  const Utils = getDep('Utils');
  const details = document.getElementById('registro-cliente-details');
  if (!details) return;
  const subtitle = details.querySelector('.registro-details__subtitle');
  const body = details.querySelector('.registro-details__body');
  const add = details.querySelector('.registro-details__add');
  const summary = document.getElementById('registro-cliente-context-summary');

  if (!subtitle || !body || !summary) return;

  if (context?.cliente) {
    details.hidden = false;
    subtitle.textContent = 'vinculado automaticamente ao contexto';
    body.hidden = true;
    add?.setAttribute('hidden', 'hidden');
    details.removeAttribute('open');
    summary.hidden = false;
    summary.innerHTML = `<strong>${Utils.escapeHtml(context.cliente.nome || 'Cliente vinculado')}</strong>${
      context.cliente.documento ? ` · ${Utils.escapeHtml(context.cliente.documento)}` : ''
    }`;
    return;
  }

  details.hidden = true;
  subtitle.textContent = 'definido no momento do envio';
  body.hidden = true;
  add?.setAttribute('hidden', 'hidden');
  details.removeAttribute('open');
  summary.hidden = true;
  summary.textContent = '';
}

function updateRegistroShareActions(context) {
  const otherButton = null;
  const otherRow = document.getElementById('r-action-other-row');
  const clienteNome = context?.cliente?.nome?.trim();
  if (otherRow) {
    otherRow.hidden = !clienteNome;
  }
  if (otherButton) {
    otherButton.setAttribute('aria-hidden', clienteNome ? 'false' : 'true');
  }
}

export function applyResolvedContext(context) {
  const Utils = getDep('Utils');
  const updateImpactCopy = getDep('updateImpactCopy');

  const contextCard = document.getElementById('registro-context-card');
  const contextHint = document.getElementById('registro-context-hint');
  const clienteText = document.getElementById('registro-context-cliente');
  const setorText = document.getElementById('registro-context-setor');
  const equipText = document.getElementById('registro-context-equip');

  if (context?.cliente) {
    Utils.setVal('r-cliente-nome', context.cliente.nome || '');
    Utils.setVal('r-cliente-documento', context.cliente.documento || '');
    Utils.setVal('r-local-atendimento', context.cliente.localAtendimento || '');
    Utils.setVal('r-cliente-contato', context.cliente.contato || '');
  }

  const hasContextCard = Boolean(context?.hasCompanyContext && contextCard);
  if (hasContextCard) {
    contextCard.hidden = false;
    if (clienteText) clienteText.textContent = context.cliente?.nome || 'Não informado';
    if (setorText) setorText.textContent = context.setor?.nome || 'Não informado';
    if (equipText) {
      const eq = context.equipamento;
      const suffix = eq?.tag ? ` · TAG ${eq.tag}` : '';
      equipText.textContent = eq?.nome ? `${eq.nome}${suffix}` : 'Não informado';
    }
  } else if (contextCard) {
    contextCard.hidden = true;
  }

  if (contextHint) {
    if (context?.missingEquipFromParams) {
      contextHint.hidden = false;
      contextHint.textContent =
        'Equipamento não encontrado. Confira o cadastro ou escolha outro equipamento.';
    } else if (context?.shouldWarnEquipmentOnly) {
      contextHint.hidden = false;
      contextHint.textContent = 'Este serviço ficará apenas no histórico do equipamento.';
    } else {
      contextHint.hidden = true;
      contextHint.textContent = '';
    }
  }

  applyClienteDetailsContext(context);
  updateRegistroShareActions(context);
  updateImpactCopy(context);
}

export function refreshRegistroContext() {
  const Utils = getDep('Utils');
  const getState = getDep('getState');
  const getCurrentRouteParams = getDep('getCurrentRouteParams');
  const setResolvedRegistroContext = getDep('setResolvedRegistroContext');
  const resolveRegistroContext = getDep('resolveRegistroContext');

  const currentRouteParams = getCurrentRouteParams();
  const stateNow = getState();
  const equipId = Utils.getVal('r-equip') || currentRouteParams?.equipId;
  const context = resolveRegistroContext(
    {
      ...currentRouteParams,
      equipId: equipId || null,
    },
    stateNow,
  );
  setResolvedRegistroContext(context);
  applyResolvedContext(context);
}

export function readRegistroFormModelSnapshot() {
  const Utils = getDep('Utils');
  return {
    equipId: Utils.getVal('r-equip'),
    data: Utils.getVal('r-data'),
    tipo: Utils.getVal('r-tipo'),
    tipoCustom: Utils.getVal('r-tipo-custom'),
    obs: Utils.getVal('r-obs'),
    tecnico: Utils.getVal('r-tecnico'),
    status: Utils.getVal('r-status'),
    prioridade: Utils.getVal('r-prioridade'),
    pecas: Utils.getVal('r-pecas'),
    proxima: Utils.getVal('r-proxima'),
    custoPecas: Utils.getVal('r-custo-pecas'),
    custoMaoObra: Utils.getVal('r-custo-mao-obra'),
    clienteNome: Utils.getVal('r-cliente-nome'),
    clienteDocumento: Utils.getVal('r-cliente-documento'),
    localAtendimento: Utils.getVal('r-local-atendimento'),
    clienteContato: Utils.getVal('r-cliente-contato'),
  };
}

export function buildRegistroReadOnlyViewModel(params = {}) {
  return buildRegistroViewModel({
    state: getDep('getState')(),
    params,
    form: readRegistroFormModelSnapshot(),
    editingId: sessionStorage.getItem(getDep('editingKey')),
    checklist: getDep('getCurrentChecklist')(),
  });
}

function ensureRegistroHeaderRoot() {
  const registroHeaderRootId = getDep('registroHeaderRootId');
  let root = document.getElementById(registroHeaderRootId);
  if (root) {
    root.classList.add('registro-main-column', 'registro-main-column--header');
    root.style.display = '';
    return root;
  }

  const hero = document.getElementById(getDep('heroId'));
  if (!hero?.parentNode) return null;

  root = document.createElement('div');
  root.id = registroHeaderRootId;
  root.className = 'registro-main-column registro-main-column--header';
  hero.parentNode.insertBefore(root, hero);

  const lastNode = document.getElementById('registro-context-hint') || hero;
  let node = hero;
  while (node) {
    const next = node.nextSibling;
    root.appendChild(node);
    if (node === lastNode) break;
    node = next;
  }

  return root;
}

function buildRegistroHeaderProps(params = {}) {
  const state = getDep('getState')() || {};
  const viewModel = buildRegistroReadOnlyViewModel(params);
  const equipmentOptions = asArray(state.equipamentos).map((equipamento) => ({
    id: String(equipamento?.id || ''),
    label: `${equipamento?.nome || '-'} - ${equipamento?.local || '-'}`,
  }));
  const technicianOptions = asArray(state.tecnicos);

  return {
    viewModel,
    equipmentOptions,
    technicianOptions,
  };
}

export function mountRegistroHeader(params = {}) {
  if (typeof document === 'undefined') return null;

  const root = ensureRegistroHeaderRoot();
  if (!root) return null;

  const props = buildRegistroHeaderProps(params);

  return renderRegistroHeader(root, props);
}

export function unmountRegistroHeader() {
  if (typeof document === 'undefined') return null;

  const root = document.getElementById(getDep('registroHeaderRootId'));
  return unmountRegistroHeaderDom(root);
}
