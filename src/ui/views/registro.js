/**
 * CoolTrack Pro - Registro View v5.0
 * Funções: initRegistro, saveRegistro, clearRegistro
 */

import { Utils } from '../../core/utils.js';
import { getState, findEquip, setState, lastRegForEquip } from '../../core/state.js';
import { migratePreviousGlobalKey, userStorage } from '../../core/userStorage.js';
import { Toast } from '../../core/toast.js';
import { goTo, setRouteGuard, clearRouteGuard } from '../../core/router.js';
import { CustomConfirm } from '../../core/modal.js';
import { SavedHighlight } from '../components/onboarding.js';
import { Profile } from '../../core/profile.js';
import { getOperationalStatus } from '../../core/equipmentRules.js';
import { reconcileEquipmentStatusesAfterRegistroEdit } from '../../domain/registroStatus.js';
import { trackEvent } from '../../core/telemetry.js';
import { withSkeleton } from '../components/skeleton.js';
import * as PlanCache from '../../core/plans/planCache.js';
import { PostSaveRegistroToast } from '../components/postSaveRegistroToast.js';
import { RegistroProximaPreventivaPrompt } from '../components/registroProximaPreventivaPrompt.js';
import { bindSmartContactMaskInput } from '../../core/phoneMask.js';
import { resolveRegistroContext } from '../composables/registroContext.js';
import {
  mountRegistroChecklistDom,
  unmountRegistroChecklistDom,
} from './registro/checklistRenderer.js';
import {
  buildRegistroPayloadDraft,
  buildRegistroPersistPayload,
  normalizeRegistroServiceTypeValue,
  validateRegistroOperationalFieldsData,
  validateRegistroPayloadDraftData,
} from './registro/save/payload.js';
import {
  buildRegistroCreateRecord,
  buildRegistroCreateStateMutation,
  buildRegistroEditStateMutation,
  resolveRegistroCreateId,
} from './registro/save/persistence.js';
import {
  buildRegistroChecklistSoftRequiredWarning,
  buildRegistroChecklistViewModel,
  cloneRegistroChecklistForEdit,
  collectRegistroChecklistForSave,
  parseRegistroChecklistMeasure,
  resolveRegistroChecklistTemplate,
} from './registro/checklist/pmocChecklist.js';
import {
  getClearRegistroFieldIds,
  resolveRegistroEditTarget,
  resolveRegistroInitEquipId,
} from './registro/lifecycle/helpers.js';
import {
  applyRegistroSavedHighlight,
  notifyRegistroCreateSaved,
  notifyRegistroEditSaved,
  persistRegistroLastClientAfterSave,
  resetRegistroCreateAfterSave,
  resetRegistroEditAfterSave,
  runRegistroEditNavigationAfterSave,
  runRegistroPreventivaPromptAfterSave,
} from './registro/save/postSave.js';
import {
  getChecklistTemplate,
  buildEmptyChecklist,
  validateChecklist,
  summarizeChecklist,
} from '../../domain/pmoc/checklistTemplates.js';
import {
  configureRegistroFormUiController,
  TIPO_CUSTOM_MAX,
  TIPO_OUTRO_PREFIX,
  syncTipoCustomVisibility,
  updateImpactCopy,
  updateProgressBar,
} from './registro/formUiController.js';
import {
  buildRegistroReadOnlyViewModel,
  configureRegistroContextHeaderController,
  mountRegistroHeader,
  refreshRegistroContext,
} from './registro/contextHeaderController.js';
import { configureRegistroInitController, initRegistroFlow } from './registro/initController.js';
import {
  clearRegistroFlow,
  configureRegistroEditClearController,
  loadRegistroForEditFlow,
} from './registro/editClearController.js';
import {
  configureRegistroSaveUiController,
  setRegistroSaveButtonsLoading,
  showProximaPreventivaPrompt,
} from './registro/saveUiController.js';

const HERO_ID = 'registro-hero';
const HERO_SUB_ID = 'registro-hero-sub';
const HERO_PILL_TEXT_ID = 'registro-hero-pill-text';
const PROGRESS_COUNT_ID = 'form-progress-count';
const METER_ID = 'registro-hero-meter';
const REGISTRO_HEADER_ROOT_ID = 'registro-header-root';
const REGISTRO_CHECKLIST_ROOT_ID = 'r-checklist-body';
const REGISTRO_CHECKLIST_DETAILS_ID = 'r-checklist-details';
const REGISTRO_CHECKLIST_UPSELL_ID = 'r-checklist-upsell';
const REGISTRO_MATERIAIS_DETAILS_ID = 'registro-materiais-details';
const REGISTRO_IMPACT_DETAILS_ID = 'registro-impact-details';
const DEFAULT_REGISTRO_STATUS = 'ok';
const DEFAULT_REGISTRO_PRIORIDADE = 'media';
const QUICK_TEMPLATE_MAP = {
  limpeza: {
    tipo: 'Limpeza de Filtros',
    prioridade: 'media',
    descricao:
      'Limpeza preventiva realizada no equipamento. Filtros higienizados e operação validada em funcionamento normal.',
  },
  recarga_gas: {
    tipo: 'Carga de Gás Refrigerante',
    prioridade: 'alta',
    descricao:
      'Recarga de gás refrigerante aplicada após verificação de pressão e vedação. Sistema estabilizado para operação.',
  },
  troca_filtro: {
    tipo: 'Limpeza de Filtros',
    prioridade: 'media',
    descricao:
      'Troca de filtro executada para restabelecer vazão de ar e qualidade da operação. Equipamento testado após a substituição.',
  },
  inspecao: {
    tipo: 'Inspeção Geral',
    prioridade: 'baixa',
    descricao:
      'Inspeção técnica geral concluída com checklist visual e funcional. Sem anomalias críticas no momento.',
  },
  manutencao_corretiva: {
    tipo: 'Manutenção Corretiva',
    prioridade: 'alta',
    descricao:
      'Atendimento corretivo realizado para falha reportada em campo. Correção aplicada e equipamento reavaliado em funcionamento.',
  },
};

// Descrições padrão por tipo do dropdown r-tipo. Quando o usuário seleciona uma
// opção (via select nativo, não via chip de ação rápida), o textarea
// "Detalhes pro cliente" é preenchido com a frase abaixo - mesma lógica dos
// chips, pra evitar dois caminhos com comportamento diferente.
// Reusa as descrições do QUICK_TEMPLATE_MAP onde há correspondência, e
// adiciona frases novas pros tipos que não têm ação rápida equivalente.
// "Outro" fica fora - nesse caso o user digita um rótulo próprio no campo
// "Qual serviço?" e escreve os detalhes manualmente.
const DESCRIPTION_BY_TIPO = {
  'Manutenção Preventiva':
    'Manutenção preventiva realizada conforme plano do equipamento. Componentes verificados, limpeza geral executada e operação validada em funcionamento normal.',
  'Manutenção Corretiva': QUICK_TEMPLATE_MAP.manutencao_corretiva.descricao,
  'Limpeza de Filtros': QUICK_TEMPLATE_MAP.limpeza.descricao,
  'Carga de Gás Refrigerante': QUICK_TEMPLATE_MAP.recarga_gas.descricao,
  'Troca de Compressor':
    'Compressor substituído por unidade compatível. Sistema recarregado, isolamento térmico reconstituído e funcionamento validado após o procedimento.',
  'Troca de Capacitor':
    'Capacitor substituído por componente equivalente. Partida do motor testada e parâmetros elétricos dentro do esperado.',
  'Limpeza de Condensador':
    'Limpeza do condensador executada com desobstrução das aletas. Troca térmica restabelecida e operação validada.',
  'Limpeza de Evaporador':
    'Limpeza do evaporador realizada com higienização das aletas. Temperatura de operação verificada após o procedimento.',
  'Verificação Elétrica':
    'Verificação elétrica realizada: medições de corrente, tensão e isolamento dentro dos parâmetros normais. Sem anomalias registradas.',
  'Ajuste de Dreno':
    'Dreno desobstruído e testado. Escoamento do condensado normalizado, sem retorno de água no equipamento.',
  'Inspeção Geral': QUICK_TEMPLATE_MAP.inspecao.descricao,
};

// Set com todas as descrições conhecidas (quick templates + por-tipo). Serve
// pro prefill do dropdown saber se pode sobrescrever o textarea - se o texto
// atual for uma frase auto-preenchida, é seguro trocar; se o user editou, a
// gente respeita o que ele escreveu. Inclui as duas descrições de tipo
// 'Limpeza de Filtros' (limpeza preventiva vs troca de filtro) porque ambas
// vêm dos chips de ação rápida e ainda representam texto auto-gerado.
const KNOWN_AUTO_DESCRIPTIONS = new Set([
  ...Object.values(QUICK_TEMPLATE_MAP).map((t) => t.descricao),
  ...Object.values(DESCRIPTION_BY_TIPO),
]);

function _prefillObsFromTipo(tipo) {
  const desc = DESCRIPTION_BY_TIPO[tipo];
  if (!desc) return; // tipo sem template (ex.: "Outro") - nada a fazer
  const currentObs = Utils.getVal('r-obs').trim();
  // Sobrescreve só quando o textarea está vazio OU quando o conteúdo atual é
  // uma frase auto-gerada (ação rápida anterior ou outro tipo do dropdown).
  // Assim, trocar de tipo atualiza os detalhes, mas texto digitado à mão
  // continua intocado.
  if (currentObs && !KNOWN_AUTO_DESCRIPTIONS.has(currentObs)) return;
  Utils.setVal('r-obs', desc);
}

const EDITING_KEY = 'cooltrack-editing-id';
let _registroChecklistRenderGeneration = 0;
let _isSavingRegistro = false;
// Persiste o último cliente preenchido para auto-prefill no próximo registro -
// técnico que atende o mesmo cliente em sequência não precisa digitar de novo.
const LAST_CLIENT_KEY = 'cooltrack-last-client';
let _currentRouteParams = {};
let _resolvedRegistroContext = null;

configureRegistroFormUiController({
  Utils,
  lastRegForEquip,
  resetEditingState,
  clearRegistro,
  editingKey: EDITING_KEY,
  heroId: HERO_ID,
  heroSubId: HERO_SUB_ID,
  progressCountId: PROGRESS_COUNT_ID,
  meterId: METER_ID,
  registroMateriaisDetailsId: REGISTRO_MATERIAIS_DETAILS_ID,
  registroImpactDetailsId: REGISTRO_IMPACT_DETAILS_ID,
  defaultRegistroStatus: DEFAULT_REGISTRO_STATUS,
  defaultRegistroPrioridade: DEFAULT_REGISTRO_PRIORIDADE,
});

configureRegistroContextHeaderController({
  Utils,
  getState,
  resolveRegistroContext,
  updateImpactCopy,
  getCurrentChecklist,
  editingKey: EDITING_KEY,
  heroId: HERO_ID,
  registroHeaderRootId: REGISTRO_HEADER_ROOT_ID,
  getCurrentRouteParams: () => _currentRouteParams,
  setResolvedRegistroContext: (context) => {
    _resolvedRegistroContext = context;
  },
});

configureRegistroInitController({
  Utils,
  Profile,
  withSkeleton,
  bindSmartContactMaskInput,
  resolveRegistroInitEquipId,
  refreshRegistroContext,
  mountRegistroHeader,
  buildRegistroReadOnlyViewModel,
  renderChecklist,
  prefillObsFromTipo: _prefillObsFromTipo,
  refreshChecklistPriBadge: _refreshChecklistPriBadge,
  updateChecklistSummary: _updateChecklistSummary,
  resetEditingState,
  setCurrentRouteParams: (params) => {
    _currentRouteParams = params;
  },
});

configureRegistroEditClearController({
  Utils,
  Profile,
  getState,
  getClearRegistroFieldIds,
  resetEditingState,
  resetChecklist,
  loadChecklistForEdit,
  renderChecklist,
  refreshRegistroContext,
  resolveRegistroEditTarget,
  setRouteGuard,
  confirmLeaveEditingGuard: _confirmLeaveEditingGuard,
  loadLastClient: _loadLastClient,
  editingKey: EDITING_KEY,
  heroPillTextId: HERO_PILL_TEXT_ID,
  defaultRegistroStatus: DEFAULT_REGISTRO_STATUS,
  defaultRegistroPrioridade: DEFAULT_REGISTRO_PRIORIDADE,
});

configureRegistroSaveUiController({
  setState,
  RegistroProximaPreventivaPrompt,
});

function _loadLastClient() {
  try {
    migratePreviousGlobalKey(LAST_CLIENT_KEY);
    return JSON.parse(userStorage.get(LAST_CLIENT_KEY) || 'null');
  } catch (_err) {
    return null;
  }
}

function _saveLastClient(cliente) {
  try {
    // Só persiste se algum campo estiver preenchido - evita sobrescrever com
    // registros salvos "no modo rápido" que não tocam os campos do cliente.
    if (!cliente || (!cliente.clienteNome && !cliente.localAtendimento)) return;
    userStorage.set(LAST_CLIENT_KEY, JSON.stringify(cliente));
  } catch (_err) {
    // localStorage indisponível - ignora
  }
}

function resetEditingState() {
  sessionStorage.removeItem(EDITING_KEY);
  const formView = Utils.getEl('view-registro');
  if (formView) formView.dataset.editMode = '0';
  // Edicao terminou (save / clear / discard) - libera o guard de navegacao.
  clearRouteGuard();
}

// Guard de saida em modo edição. Bloqueia navegacao pra outra rota e mostra
// modal pedindo confirmação. Se usuário "Descartar", faz reset COMPLETO do
// form (clearRegistro) - incluindo label do botao "Finalizar serviço" - e
// libera a navegacao. Se "Continuar editando", cancela.
async function _confirmLeaveEditingGuard(_nextRoute, _nextParams) {
  const ok = await CustomConfirm.show(
    'Sair sem salvar as alterações?',
    'Você está editando um registro. Se sair agora, as alterações serão descartadas.',
    {
      confirmLabel: 'Descartar e sair',
      cancelLabel: 'Continuar editando',
      tone: 'danger',
    },
  );
  if (ok) {
    // Reset completo: limpa campos do form, foto, checklist, label do botao
    // ("Salvar alteracoes" -> "Finalizar serviço"), classes, EDITING_KEY,
    // dataset e o proprio guard (resetEditingState e chamado dentro).
    clearRegistro();
  }
  return ok;
}

// -- Checklist NBR 13971 (Fase 3 PMOC) -------------------------
// State local: snapshot do checklist em edição. Reset quando equip muda
// (template é por tipo) ou quando o registro é salvo/limpo.
let _currentChecklist = null;

function getRegistroChecklistState() {
  return _currentChecklist;
}

function setRegistroChecklistState(nextChecklist) {
  _currentChecklist = nextChecklist;
  return _currentChecklist;
}

function clearRegistroChecklistState() {
  return setRegistroChecklistState(null);
}

function buildRegistroChecklistDomProps(template) {
  const viewModel = buildRegistroReadOnlyViewModel(_currentRouteParams);

  return {
    checklist: buildRegistroChecklistViewModel(template, getRegistroChecklistState()),
    actions: viewModel.actions,
  };
}

function mountRegistroChecklist(template) {
  if (typeof document === 'undefined') return null;

  const root = document.getElementById(REGISTRO_CHECKLIST_ROOT_ID);
  if (!root) return null;

  const renderGeneration = (_registroChecklistRenderGeneration += 1);
  const props = buildRegistroChecklistDomProps(template);

  if (renderGeneration !== _registroChecklistRenderGeneration) return null;
  return mountRegistroChecklistDom(root, props);
}

export function unmountRegistroChecklist() {
  _registroChecklistRenderGeneration += 1;
  if (typeof document === 'undefined') return null;

  const root = document.getElementById(REGISTRO_CHECKLIST_ROOT_ID);
  if (!root?.dataset.registroChecklistMounted) return null;

  unmountRegistroChecklistDom(root);
  return null;
}

export function unmountRegistroPhotos() {
  return null;
}

function _hasPmocChecklistAccess() {
  return PlanCache.isCachedPlanPro?.() === true;
}

function _showPmocChecklistUnavailable(visible) {
  const unavailable = document.getElementById(REGISTRO_CHECKLIST_UPSELL_ID);
  if (unavailable) unavailable.hidden = !visible;
}

function _getRegistroChecklistServiceType() {
  const tipo = Utils.getVal('r-tipo');
  if (tipo !== 'Outro') return tipo;
  return Utils.getVal('r-tipo-custom') || tipo;
}

function isPreventiveChecklistServiceType(tipo) {
  const normalized = String(tipo || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (!normalized || normalized.includes('corretiv')) return false;

  return (
    normalized.includes('preventiv') ||
    normalized.includes('higieniz') ||
    normalized.includes('limpeza preventiva')
  );
}

function _isRegistroChecklistRecommended() {
  return (
    Boolean(Utils.getVal('r-equip')) &&
    isPreventiveChecklistServiceType(_getRegistroChecklistServiceType())
  );
}

function _applyPmocChecklistDiscoveryState() {
  const recommended = _isRegistroChecklistRecommended();
  const wrapper = document.getElementById(REGISTRO_CHECKLIST_DETAILS_ID);
  const pri = document.getElementById('r-checklist-pri');
  const unavailable = document.getElementById(REGISTRO_CHECKLIST_UPSELL_ID);
  const unavailableContext = document.getElementById('r-checklist-upsell-context');

  if (wrapper) {
    wrapper.dataset.checklistRecommended = recommended ? 'true' : 'false';
    wrapper.open = !wrapper.hidden && recommended;
  }
  if (pri) pri.hidden = !recommended;
  if (unavailable) unavailable.dataset.checklistRecommended = recommended ? 'true' : 'false';
  if (unavailableContext) {
    unavailableContext.textContent = recommended ? ' Recomendado para preventiva.' : '';
  }
}

function _redirectPmocChecklistUnavailable() {
  trackEvent('preventive_checklist_upsell_clicked', { source: 'registro_form' });
  Toast.warning('Recurso indisponivel nesta etapa.');
}

function _ensurePmocChecklistAccess({ redirect = false } = {}) {
  if (_hasPmocChecklistAccess()) return true;

  const wrapper = document.getElementById(REGISTRO_CHECKLIST_DETAILS_ID);
  if (wrapper) wrapper.hidden = true;
  unmountRegistroChecklist();
  _showPmocChecklistUnavailable(true);
  _applyPmocChecklistDiscoveryState();

  if (redirect) _redirectPmocChecklistUnavailable();
  return false;
}

function _updateChecklistSummary() {
  const summaryEl = document.getElementById('r-checklist-summary');
  if (!summaryEl) return;
  const checklist = getRegistroChecklistState();
  if (!checklist) {
    summaryEl.textContent = 'selecione o equipamento primeiro';
    return;
  }
  const s = summarizeChecklist(checklist);
  if (!s.total) {
    summaryEl.textContent = 'sem template para esse tipo';
    return;
  }
  const equip = findEquip(Utils.getVal('r-equip'));
  const periodicidade = Number(equip?.periodicidadePreventivaDias);
  const periodicidadeLabel =
    Number.isFinite(periodicidade) && periodicidade > 0
      ? `${periodicidade} dias`
      : 'periodicidade não definida';
  const tipoServico = _getRegistroChecklistServiceType() || 'Serviço';
  const filled = s.ok + s.fail + s.na;
  summaryEl.textContent = `${tipoServico} · ${periodicidadeLabel} · ${filled}/${s.total} itens preenchidos`;
}

function _refreshChecklistPriBadge() {
  _applyPmocChecklistDiscoveryState();
}

function getRegistroChecklistElements() {
  return {
    wrapper: document.getElementById(REGISTRO_CHECKLIST_DETAILS_ID),
    body: document.getElementById(REGISTRO_CHECKLIST_ROOT_ID),
  };
}

function shouldReuseRegistroChecklistTemplate(template) {
  return getRegistroChecklistState()?.tipo_template === template.tipo_template;
}

function ensureRegistroChecklistStateForTemplate(equip, template) {
  // Preserva marcacoes se template e o mesmo (user trocou de equip do mesmo tipo)
  if (!shouldReuseRegistroChecklistTemplate(template)) {
    setRegistroChecklistState(buildEmptyChecklist(equip.tipo));
  }

  return getRegistroChecklistState();
}

/**
 * Renderiza o checklist baseado no equip selecionado. Chamado quando
 * r-equip muda OU quando o accordion é aberto pela primeira vez.
 *
 * Estratégia: usa o snapshot existente em _currentChecklist se o
 * tipo_template corresponde - preserva marcações do user mesmo se
 * ele trocar de equip e voltar. Senão, reseta para checklist vazio.
 */
export function renderChecklist() {
  const { wrapper, body } = getRegistroChecklistElements();
  if (!wrapper || !body) return;

  const equipId = Utils.getVal('r-equip');
  if (!equipId) {
    wrapper.hidden = true;
    delete wrapper.dataset.checklistRecommended;
    clearRegistroChecklistState();
    unmountRegistroChecklist();
    _showPmocChecklistUnavailable(false);
    _applyPmocChecklistDiscoveryState();
    _updateChecklistSummary();
    return;
  }
  const equip = findEquip(equipId);
  if (!equip) {
    wrapper.hidden = true;
    unmountRegistroChecklist();
    _showPmocChecklistUnavailable(false);
    _applyPmocChecklistDiscoveryState();
    return;
  }

  if (!_ensurePmocChecklistAccess()) {
    clearRegistroChecklistState();
    _updateChecklistSummary();
    return;
  }

  const tpl = resolveRegistroChecklistTemplate(equip, { getChecklistTemplate });
  // Preserva marcações se template é o mesmo (user trocou de equip do mesmo tipo)
  ensureRegistroChecklistStateForTemplate(equip, tpl);

  _showPmocChecklistUnavailable(false);
  wrapper.hidden = false;
  _refreshChecklistPriBadge();

  mountRegistroChecklist(tpl);

  _updateChecklistSummary();
}

/** Atualiza status de um item - chamado pelo handler de click. */
function getRegistroChecklistItem(itemId) {
  return getRegistroChecklistState()?.items?.find((item) => item.id === itemId) || null;
}

function updateRegistroChecklistStatusDom(itemId, status) {
  const row = document.querySelector(`[data-item-id="${CSS.escape(itemId)}"]`);
  if (!row) return;

  row.querySelectorAll('.r-checklist__status').forEach((btn) => {
    const btnStatus = btn.dataset.status;
    const isActive = status === btnStatus;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

function applyRegistroChecklistItemStatus(itemId, status) {
  const item = getRegistroChecklistItem(itemId);
  if (!item) return null;

  item.status = item.status === status ? null : status;
  return item;
}

export function setChecklistItemStatus(itemId, status) {
  if (!_ensurePmocChecklistAccess({ redirect: true })) return;
  if (!getRegistroChecklistState()) return;
  const item = applyRegistroChecklistItemStatus(itemId, status);
  if (!item) return;
  // Update DOM in place - não re-renderiza pra preservar foco em textarea
  updateRegistroChecklistStatusDom(itemId, item.status);
  _updateChecklistSummary();
}

/** Atualiza obs de um item - chamado pelo handler de input do textarea. */
function applyRegistroChecklistItemObs(itemId, obs) {
  const item = getRegistroChecklistItem(itemId);
  if (item) item.obs = String(obs || '');
}

export function setChecklistItemObs(itemId, obs) {
  if (!_ensurePmocChecklistAccess({ redirect: true })) return;
  if (!getRegistroChecklistState()) return;
  applyRegistroChecklistItemObs(itemId, obs);
}

/**
 * PMOC Fase 4: atualiza medição numérica de um item measurable.
 * Vazio limpa o measure (vira null); valor numérico salva como
 * { value, unit }. Não-numéricos são ignorados (input number já
 * filtra mas defensivo aqui também).
 */
function applyRegistroChecklistItemMeasure(itemId, rawValue, unit) {
  const item = getRegistroChecklistItem(itemId);
  if (!item) return;

  item.measure = parseRegistroChecklistMeasure(rawValue, unit);
}

export function setChecklistItemMeasure(itemId, rawValue, unit) {
  if (!_ensurePmocChecklistAccess({ redirect: true })) return;
  if (!getRegistroChecklistState()) return;
  applyRegistroChecklistItemMeasure(itemId, rawValue, unit);
}

/** Snapshot atual do checklist - chamado por saveRegistro. */
export function getCurrentChecklist() {
  return collectRegistroChecklistForSave(getRegistroChecklistState());
}

/** Reset - chamado por clearRegistro. */
function resetRegistroChecklistAfterClear() {
  clearRegistroChecklistState();
  const body = document.getElementById(REGISTRO_CHECKLIST_ROOT_ID);
  unmountRegistroChecklist();
  if (body) body.textContent = '';
  const wrapper = document.getElementById(REGISTRO_CHECKLIST_DETAILS_ID);
  if (wrapper) wrapper.hidden = true;
  _showPmocChecklistUnavailable(false);
  _updateChecklistSummary();
}

export function resetChecklist() {
  resetRegistroChecklistAfterClear();
}

function restoreRegistroChecklistForEdit(checklist) {
  if (!checklist || typeof checklist !== 'object') {
    clearRegistroChecklistState();
    return;
  }
  setRegistroChecklistState(cloneRegistroChecklistForEdit(checklist));
  renderChecklist();
}

/** Carrega checklist do registro existente em modo edição. */
export function loadChecklistForEdit(checklist) {
  restoreRegistroChecklistForEdit(checklist);
}

// =======================================================
// API PÚBLICA
// =======================================================

export function initRegistro(params = {}) {
  return initRegistroFlow(params);
}

function getRegistroFormElements() {
  return {
    equipId: Utils.getEl('r-equip'),
    data: Utils.getEl('r-data'),
    tipo: Utils.getEl('r-tipo'),
    tipoCustom: Utils.getEl('r-tipo-custom'),
    obs: Utils.getEl('r-obs'),
    tecnico: Utils.getEl('r-tecnico'),
    status: Utils.getEl('r-status'),
    prioridade: Utils.getEl('r-prioridade'),
    pecas: Utils.getEl('r-pecas'),
    proxima: Utils.getEl('r-proxima'),
    custoPecas: Utils.getEl('r-custo-pecas'),
    custoMaoObra: Utils.getEl('r-custo-mao-obra'),
    clienteNome: Utils.getEl('r-cliente-nome'),
    clienteDocumento: Utils.getEl('r-cliente-documento'),
    localAtendimento: Utils.getEl('r-local-atendimento'),
    clienteContato: Utils.getEl('r-cliente-contato'),
  };
}

function readRegistroFormValues(elements = getRegistroFormElements()) {
  const valueOf = (key, id) => elements[key]?.value ?? Utils.getVal(id);
  return {
    equipId: valueOf('equipId', 'r-equip'),
    data: valueOf('data', 'r-data'),
    tipo: valueOf('tipo', 'r-tipo'),
    tipoCustom: valueOf('tipoCustom', 'r-tipo-custom'),
    obs: valueOf('obs', 'r-obs'),
    tecnico: valueOf('tecnico', 'r-tecnico'),
    status: valueOf('status', 'r-status'),
    prioridade: valueOf('prioridade', 'r-prioridade') || 'media',
    pecas: valueOf('pecas', 'r-pecas'),
    proxima: valueOf('proxima', 'r-proxima'),
    custoPecas: valueOf('custoPecas', 'r-custo-pecas'),
    custoMaoObra: valueOf('custoMaoObra', 'r-custo-mao-obra'),
    clienteNome: valueOf('clienteNome', 'r-cliente-nome'),
    clienteDocumento: valueOf('clienteDocumento', 'r-cliente-documento'),
    localAtendimento: valueOf('localAtendimento', 'r-local-atendimento'),
    clienteContato: valueOf('clienteContato', 'r-cliente-contato'),
  };
}

function normalizeRegistroServiceType(values, elements = getRegistroFormElements()) {
  const result = normalizeRegistroServiceTypeValue(values, {
    outroPrefix: TIPO_OUTRO_PREFIX,
    tipoCustomMax: TIPO_CUSTOM_MAX,
  });
  if (result.valid) return result;

  if (result.reason === 'missing-custom') {
    Toast.warning('Descreva o serviço no campo "Qual serviço?" pra continuar.');
    elements.tipoCustom?.focus();
    return { valid: false };
  }

  if (result.reason === 'custom-too-long') {
    Toast.warning(`A descricao do serviço passa do limite de ${TIPO_CUSTOM_MAX} caracteres.`);
    elements.tipoCustom?.focus();
    return { valid: false };
  }

  return { valid: false };
}

function buildRegistroSaveContext() {
  const { equipamentos } = getState();
  return {
    equipamentos,
  };
}

function validateRegistroPayloadDraft(payloadDraft, context) {
  const payloadValidation = validateRegistroPayloadDraftData(payloadDraft, {
    existingEquipamentos: context.equipamentos,
  });

  if (!payloadValidation.valid) {
    Toast.warning(payloadValidation.errors[0]);
    return null;
  }

  return payloadValidation.value;
}

function validateRegistroOperationalFields({ data, status }) {
  const validation = validateRegistroOperationalFieldsData({ data, status });
  if (!validation.valid) {
    Toast.error(validation.errors[0]);
    return false;
  }
  return true;
}

function warnRegistroChecklistSoftRequiredGaps(tipo) {
  const warning = buildRegistroChecklistSoftRequiredWarning(tipo, {
    checklist: getCurrentChecklist(),
    isPreventivaTipo: isPreventiveChecklistServiceType,
    validateChecklist,
  });
  if (warning) Toast.warning(warning);
}

function warnRegistroChecklistPayloadGaps(tipo) {
  warnRegistroChecklistSoftRequiredGaps(tipo);
}

function persistRegistroTechnicianProfile(tecnico) {
  Profile.saveLastTecnico(tecnico);

  // UX V2 audit fix #81: auto-default tecnico no Profile apos primeiro
  // registro. Se o user nao tem nome no perfil ainda (ex.: pulou
  // onboarding), assumimos o nome do tecnico do registro recem-salvo como
  // o nome dele. Salva apenas o campo .nome - outros campos (empresa,
  // CNPJ) ficam pra ele preencher em /conta. Idempotente: nao sobrescreve
  // perfil ja preenchido.
  try {
    const currentProfile = Profile.get() || {};
    if (!currentProfile.nome && tecnico) {
      Profile.save({ ...currentProfile, nome: tecnico });
    }
  } catch (_err) {
    /* storage off - nao bloqueia o save do registro */
  }
}

function getRegistroEditingId() {
  return sessionStorage.getItem(EDITING_KEY);
}

function applyRegistroEditStateMutation(editingId, persistedPayload) {
  setState((prev) =>
    buildRegistroEditStateMutation(prev, editingId, persistedPayload, {
      getCurrentChecklist,
      reconcileEquipmentStatusesAfterRegistroEdit,
    }),
  );
}

function saveRegistroLastClient({
  clienteNome,
  clienteDocumento,
  localAtendimento,
  clienteContato,
}) {
  _saveLastClient({ clienteNome, clienteDocumento, localAtendimento, clienteContato });
}

function runRegistroEditPostSaveEffects(persistedPayload) {
  persistRegistroLastClientAfterSave(persistedPayload, { saveRegistroLastClient });
  resetRegistroEditAfterSave({ resetEditingState, clearRegistro });
  notifyRegistroEditSaved({ Toast });
  runRegistroEditNavigationAfterSave({ goTo });
}

function applyRegistroCreateStateMutation({ registro, persistedPayload, operationalStatus }) {
  setState((prev) =>
    buildRegistroCreateStateMutation(prev, { registro, persistedPayload, operationalStatus }),
  );
}

async function runRegistroCreatePostSaveEffects({ registroId, persistedPayload, saveContext }) {
  const { equipId } = persistedPayload;

  applyRegistroSavedHighlight(registroId, { SavedHighlight });
  persistRegistroLastClientAfterSave(persistedPayload, { saveRegistroLastClient });
  resetRegistroCreateAfterSave({ clearRegistro });

  // Feedback pos-save simples; saidas externas serao reconstruidas em etapa propria.
  runRegistroPreventivaPromptAfterSave(registroId, {
    showProximaPreventivaPrompt,
  });
  notifyRegistroCreateSaved({ equipId, registroId, saveContext }, { PostSaveRegistroToast, Toast });

  return true;
}

export function applyQuickTemplate(templateId, triggerEl = null) {
  const template = QUICK_TEMPLATE_MAP[templateId];
  if (!template) return;

  // --- Pre-fill agressivo (UX V2 audit) ----------------------------------
  // Antes preenchia tipo, obs, prioridade, data. Agora tambem preenche
  // status=ok (assume que ficou operando), e foca o proximo campo vazio.
  Utils.setVal('r-tipo', template.tipo);
  syncTipoCustomVisibility();
  if (!Utils.getVal('r-obs').trim()) Utils.setVal('r-obs', template.descricao);
  Utils.setVal('r-prioridade', template.prioridade);
  Utils.setVal('r-data', Utils.nowDatetime());
  // Default status "Operando normalmente" - 80% dos casos preventivos
  if (!Utils.getVal('r-status')) Utils.setVal('r-status', 'ok');
  if (!Utils.getVal('r-tecnico')) {
    const def = Profile.getDefaultTecnico();
    if (def) Utils.setVal('r-tecnico', def);
  }

  // Marca chip ativo
  const quickRoot = document.querySelector('.registro-quick');
  if (quickRoot) {
    const chips = quickRoot.querySelectorAll('[data-action="quick-service-template"]');
    const active =
      triggerEl && triggerEl.closest('[data-action="quick-service-template"]')
        ? triggerEl.closest('[data-action="quick-service-template"]')
        : quickRoot.querySelector(`[data-template="${templateId}"]`);
    chips.forEach((chip) => {
      const isActive = chip === active;
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  updateProgressBar();

  // --- Smart focus + feedback contextual --------------------------------
  // Identifica o proximo required vazio e foca nele. Toast diz exatamente
  // o que falta - em vez do generico "revise e salve".
  const requiredOrder = [
    { id: 'r-equip', label: 'equipamento' },
    { id: 'r-tecnico', label: 'tecnico' },
  ];
  const nextEmpty = requiredOrder.find((f) => !Utils.getVal(f.id));
  if (nextEmpty) {
    const el = Utils.getEl(nextEmpty.id);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    Toast.success(`Modelo aplicado. Falta so o ${nextEmpty.label} pra finalizar.`);
  } else {
    // Tudo pronto pra salvar - foca no botao primario
    const saveBtn = document.querySelector('[data-action="save-registro"]');
    if (saveBtn) saveBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    Toast.success('Modelo aplicado. Toque em Salvar serviço pra finalizar.');
  }
}

export async function saveRegistro() {
  if (_isSavingRegistro) return false;

  _isSavingRegistro = true;
  setRegistroSaveButtonsLoading(true);

  try {
    const formElements = getRegistroFormElements();
    const formValues = readRegistroFormValues(formElements);
    const saveContext = buildRegistroSaveContext();
    const normalizedServiceType = normalizeRegistroServiceType(formValues, formElements);
    if (!normalizedServiceType.valid) return false;

    const payloadDraft = buildRegistroPayloadDraft(formValues, normalizedServiceType.tipo);
    const validatedPayload = validateRegistroPayloadDraft(payloadDraft, saveContext);
    if (!validatedPayload) return false;

    if (!validateRegistroOperationalFields(validatedPayload)) return false;

    const persistedPayload = buildRegistroPersistPayload(validatedPayload, formValues);
    const { tipo, tecnico, status } = persistedPayload;

    warnRegistroChecklistPayloadGaps(tipo);

    persistRegistroTechnicianProfile(tecnico);

    // Modo edição - atualiza registro existente
    const editingId = getRegistroEditingId();
    if (editingId) {
      applyRegistroEditStateMutation(editingId, persistedPayload);
      runRegistroEditPostSaveEffects(persistedPayload);
      return true;
    }

    // Modo criação - continua fluxo normal
    const novoId = resolveRegistroCreateId({ uid: () => Utils.uid() });
    const photoPayload = { fotos: [] };

    const operationalStatus = getOperationalStatus({
      status,
      lastStatus: status,
      ultimoRegistro: { status },
    });

    const registro = buildRegistroCreateRecord({
      registroId: novoId,
      persistedPayload,
      photoPayload,
      checklist: getCurrentChecklist(),
    });

    applyRegistroCreateStateMutation({
      registro,
      persistedPayload,
      operationalStatus,
    });

    return runRegistroCreatePostSaveEffects({
      registroId: novoId,
      persistedPayload,
      saveContext,
    });
  } finally {
    _isSavingRegistro = false;
    setRegistroSaveButtonsLoading(false);
  }
}

export function clearRegistro(preserveEquip = false) {
  return clearRegistroFlow(preserveEquip);
}

export function loadRegistroForEdit(id) {
  return loadRegistroForEditFlow(id);
}

// Garante que estado de edição não persista entre sessoes do app.
// pagehide cobre tanto fechamento de aba quanto navegacao pra outro
// site (mais robusto que beforeunload em mobile / Safari).
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    try {
      sessionStorage.removeItem(EDITING_KEY);
    } catch (_err) {
      /* sessionStorage indisponivel - ignora */
    }
  });
}
