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
import { buildRegistroViewModel } from '../viewModels/registroViewModel.js';
import {
  mountRegistroChecklistDom,
  unmountRegistroChecklistDom,
} from './registro/checklistRenderer.js';
import { renderRegistroHeader, unmountRegistroHeaderDom } from './registro/headerRenderer.js';
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
  PREVIOUS_TIPO_OUTRO_PREFIX,
  TIPO_CUSTOM_MAX,
  TIPO_OUTRO_PREFIX,
  bindEquipChangeWarning,
  bindImpactDetailsToggle,
  bindMateriaisDetailsToggle,
  bindProgressFieldHandlers,
  configureRegistroFormUiController,
  ensureProgressBar,
  hasImpactValues,
  hasMateriaisValues,
  renderHeroSub,
  syncImpactDetailsState,
  syncMateriaisDetailsState,
  syncTipoCustomVisibility,
  updateImpactCopy,
  updateProgressBar,
} from './registro/formUiController.js';

// O meter de progresso vive estático dentro do hero do template.
// Apontamos pro hero + o contador numérico ao invés de injetar markup na hora.
function asArray(value) {
  return Array.isArray(value) ? value : [];
}

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

function _setRegistroProximaPreventiva(registroId, proxima) {
  if (!registroId) return;
  // setState salva localmente imediatamente e agenda sync Supabase via Storage.
  setState((prev) => ({
    ...prev,
    registros: prev.registros.map((registro) =>
      registro.id === registroId ? { ...registro, proxima } : registro,
    ),
  }));
}

async function _showProximaPreventivaPrompt(registroId) {
  const result = await RegistroProximaPreventivaPrompt.open();
  if (!result || result.canceled === true) {
    // Dismiss (X/backdrop/Escape) é indecisão: preserva a data `proxima`
    // existente em vez de gravar uma escolha implícita.
    return result;
  }

  if (result.semRetorno === true) {
    // "Sem retorno" é uma decisão explícita do técnico: limpamos `proxima`
    // conscientemente para diferenciar de apenas fechar/ignorar o prompt.
    _setRegistroProximaPreventiva(registroId, null);
    return result;
  }

  if (result.proxima) {
    _setRegistroProximaPreventiva(registroId, result.proxima);
  }
  return result;
}

function _setRegistroSaveButtonsLoading(isLoading) {
  const actionAttr = 'data-action';
  const buttons = document.querySelectorAll(`[${actionAttr}="save-registro"]`);
  buttons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.disabled = isLoading;
    button.classList.toggle('is-loading', isLoading);
    if (isLoading) {
      button.setAttribute('aria-busy', 'true');
    } else {
      button.removeAttribute('aria-busy');
    }
  });
}

function _applyClienteDetailsContext(context) {
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

function _updateRegistroShareActions(context) {
  const otherButton = null;
  // Layout V3: o botão "Enviar pra outro destinatário" agora vive dentro de
  // uma row no .action-tray. Ocultar o botão sozinho deixaria a row vazia
  // (afetando a borda do divisor), por isso togglamos o hidden no row pai.
  const otherRow = document.getElementById('r-action-other-row');
  const clienteNome = context?.cliente?.nome?.trim();
  if (otherRow) {
    otherRow.hidden = !clienteNome;
  }
  if (otherButton) {
    otherButton.setAttribute('aria-hidden', clienteNome ? 'false' : 'true');
  }
}

function _applyResolvedContext(context) {
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

  _applyClienteDetailsContext(context);
  _updateRegistroShareActions(context);
  updateImpactCopy(context);
}

function _refreshRegistroContext() {
  const stateNow = getState();
  const equipId = Utils.getVal('r-equip') || _currentRouteParams?.equipId;
  const context = resolveRegistroContext(
    {
      ..._currentRouteParams,
      equipId: equipId || null,
    },
    stateNow,
  );
  _resolvedRegistroContext = context;
  _applyResolvedContext(context);
}

function _readRegistroFormModelSnapshot() {
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

function _buildRegistroReadOnlyViewModel(params = {}) {
  return buildRegistroViewModel({
    state: getState(),
    params,
    form: _readRegistroFormModelSnapshot(),
    editingId: sessionStorage.getItem(EDITING_KEY),
    checklist: getCurrentChecklist(),
  });
}

function ensureRegistroHeaderRoot() {
  let root = document.getElementById(REGISTRO_HEADER_ROOT_ID);
  if (root) {
    root.classList.add('registro-main-column', 'registro-main-column--header');
    root.style.display = '';
    return root;
  }

  const hero = document.getElementById(HERO_ID);
  if (!hero?.parentNode) return null;

  root = document.createElement('div');
  root.id = REGISTRO_HEADER_ROOT_ID;
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
  const state = getState() || {};
  const viewModel = _buildRegistroReadOnlyViewModel(params);
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

function mountRegistroHeader(params = {}) {
  if (typeof document === 'undefined') return null;

  const root = ensureRegistroHeaderRoot();
  if (!root) return null;

  const props = buildRegistroHeaderProps(params);

  return renderRegistroHeader(root, props);
}

export function unmountRegistroHeader() {
  if (typeof document === 'undefined') return null;

  const root = document.getElementById(REGISTRO_HEADER_ROOT_ID);
  return unmountRegistroHeaderDom(root);
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
  const viewModel = _buildRegistroReadOnlyViewModel(_currentRouteParams);

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

function _bindRegistroHeaderFieldHandlers() {
  bindProgressFieldHandlers();

  bindEquipChangeWarning();

  const equipSelForChecklist = Utils.getEl('r-equip');
  if (equipSelForChecklist && equipSelForChecklist.dataset.registroChecklistBound !== '1') {
    equipSelForChecklist.dataset.registroChecklistBound = '1';
    equipSelForChecklist.addEventListener('change', () => {
      renderChecklist();
      _refreshRegistroContext();
    });
  }

  const tipoSel = Utils.getEl('r-tipo');
  if (tipoSel && tipoSel.dataset.registroTipoBound !== '1') {
    tipoSel.dataset.registroTipoBound = '1';
    tipoSel.addEventListener('change', () => {
      syncTipoCustomVisibility({ focusOnShow: true });
      _prefillObsFromTipo(tipoSel.value);
      updateProgressBar();
      _refreshChecklistPriBadge();
    });
  }

  const tipoCustomInput = Utils.getEl('r-tipo-custom');
  if (tipoCustomInput && tipoCustomInput.dataset.registroTipoCustomBound !== '1') {
    tipoCustomInput.dataset.registroTipoCustomBound = '1';
    tipoCustomInput.addEventListener('input', () => {
      updateProgressBar();
      _refreshChecklistPriBadge();
      _updateChecklistSummary();
    });
  }
}

// =======================================================
// API PÚBLICA
// =======================================================

function resolveRegistroInitRoot() {
  return Utils.getEl('view-registro');
}

function syncRegistroInitRouteContext(params, effectiveEquipId) {
  if (effectiveEquipId) Utils.setVal('r-equip', effectiveEquipId);
  _currentRouteParams = { ...params };
  _refreshRegistroContext();
}

function mountRegistroInitHeader(params) {
  return Promise.resolve(mountRegistroHeader(params));
}

function bindRegistroInitFormOnce(formView) {
  if (formView.dataset.bound) return;

  // Smart mask no campo Telefone/contato do cliente - formata (XX) XXXXX-XXXX
  // se o usuário digitar dígitos. Se digitar email/texto livre, deixa em paz.
  bindSmartContactMaskInput(Utils.getEl('r-cliente-contato'));

  formView.dataset.bound = '1';
}

function syncRegistroInitDetailsState(formView) {
  ensureProgressBar(formView);
  _bindRegistroHeaderFieldHandlers();
  bindRegistroInitFormOnce(formView);

  // Garante o estado correto na entrada da view (inclusive vindo de edit).
  syncTipoCustomVisibility();
  bindMateriaisDetailsToggle();
  syncMateriaisDetailsState(hasMateriaisValues());
  bindImpactDetailsToggle();
  syncImpactDetailsState(hasImpactValues());
  updateProgressBar();
}

function renderRegistroInitHero() {
  renderHeroSub();
}

function applyRegistroInitDateDefault() {
  // Data padrão "Hoje agora" - UX V2 audit fix
  if (!Utils.getVal('r-data')) Utils.setVal('r-data', Utils.nowDatetime());
}

function bindRegistroInitDatetimeUX() {
  const wrap = document.getElementById('registro-datetime-wrap');
  if (!wrap || wrap.dataset.bound === '1') return;
  wrap.dataset.bound = '1';

  const input = document.getElementById('r-data');
  const nowBtn = document.getElementById('r-data-now-btn');
  const editBtn = document.getElementById('r-data-edit-btn');
  const nowLabel = document.getElementById('r-data-now-label');

  function refreshLabel() {
    if (!input || !nowLabel) return;
    const val = input.value;
    if (!val) {
      nowLabel.textContent = 'Hoje agora';
      nowBtn?.setAttribute('aria-pressed', 'true');
      return;
    }
    // Se a data é dentro de 1min do agora, é "Hoje agora"
    const ts = new Date(val).getTime();
    if (Math.abs(Date.now() - ts) < 60_000) {
      nowLabel.textContent = 'Hoje agora';
      nowBtn?.setAttribute('aria-pressed', 'true');
    } else {
      // Mostra "DD/MM HH:MM"
      const d = new Date(val);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      nowLabel.textContent = `${dd}/${mm} ${hh}:${min}`;
      nowBtn?.setAttribute('aria-pressed', 'false');
    }
  }

  nowBtn?.addEventListener('click', () => {
    // Reseta pra agora
    Utils.setVal('r-data', Utils.nowDatetime());
    refreshLabel();
    updateProgressBar();
  });

  editBtn?.addEventListener('click', () => {
    // Abre o picker nativo. Browsers modernos suportam showPicker(); fallback
    // pra focus que muitos browsers tambem abrem.
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.focus();
      }
    } catch (_e) {
      input.focus();
    }
  });

  input?.addEventListener('change', () => {
    refreshLabel();
    updateProgressBar();
  });

  refreshLabel();
}

function applyRegistroInitTechnicianDefault() {
  // H1: técnico padrão
  const rTecnico = Utils.getEl('r-tecnico');
  if (rTecnico && !rTecnico.value) {
    const def = Profile.getDefaultTecnico();
    if (def) rTecnico.value = def;
  }
}

function resetRegistroInitEditingIfCreate(params) {
  if (!params.editRegistroId) resetEditingState();
}

function applyRegistroInitPriorityDefault() {
  const rPrioridade = Utils.getEl('r-prioridade');
  if (rPrioridade && !rPrioridade.value) rPrioridade.value = 'media';
}

function runRegistroInitAfterHeaderMounted({ formView, params, effectiveEquipId }) {
  syncRegistroInitDetailsState(formView);
  renderRegistroInitHero();
  applyRegistroInitDateDefault();
  bindRegistroInitDatetimeUX();
  applyRegistroInitTechnicianDefault();

  // Pré-preenchimento vindo de fluxo contextual (equipamento/alerta).
  resetRegistroInitEditingIfCreate(params);
  syncRegistroInitRouteContext(params, effectiveEquipId);
  _buildRegistroReadOnlyViewModel(params);

  applyRegistroInitPriorityDefault();
}

export function initRegistro(params = {}) {
  const formView = resolveRegistroInitRoot();
  if (!formView) return;
  const effectiveEquipId = resolveRegistroInitEquipId(params);

  syncRegistroInitRouteContext(params, effectiveEquipId);

  withSkeleton(formView, { enabled: true, variant: 'generic', count: 3 }, () =>
    mountRegistroInitHeader(params).then(() =>
      runRegistroInitAfterHeaderMounted({ formView, params, effectiveEquipId }),
    ),
  );
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
    showProximaPreventivaPrompt: _showProximaPreventivaPrompt,
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
  _setRegistroSaveButtonsLoading(true);

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
    _setRegistroSaveButtonsLoading(false);
  }
}

function resetRegistroBaseFieldsAfterClear(preserveEquip = false) {
  Utils.clearVals(...getClearRegistroFieldIds(preserveEquip));
}

function resetRegistroDefaultFieldsAfterClear() {
  Utils.setVal('r-status', DEFAULT_REGISTRO_STATUS);
  Utils.setVal('r-prioridade', DEFAULT_REGISTRO_PRIORIDADE);
  Utils.setVal('r-data', Utils.nowDatetime());
}

function resetRegistroMediaAfterClear() {
  return null;
}

function resetRegistroDetailsAfterClear() {
  syncTipoCustomVisibility();
  syncMateriaisDetailsState(false);
  syncImpactDetailsState(false);
}

function resetRegistroProgressAfterClear() {
  updateProgressBar();
}

function resetRegistroQuickTemplateChipsAfterClear() {
  document
    .querySelectorAll('.registro-quick [data-action="quick-service-template"]')
    .forEach((chip) => {
      chip.classList.remove('is-active');
      chip.setAttribute('aria-pressed', 'false');
    });
}

function resetRegistroChecklistAfterClearClick() {
  resetChecklist();
}

function resetRegistroTechnicianDefaultAfterClear() {
  const rTecnico = Utils.getEl('r-tecnico');
  if (rTecnico) rTecnico.value = Profile.getDefaultTecnico();
}

function restoreRegistroLastClientAfterClear() {
  const lastClient = _loadLastClient();
  if (lastClient) {
    if (lastClient.clienteNome) Utils.setVal('r-cliente-nome', lastClient.clienteNome);
    if (lastClient.clienteDocumento)
      Utils.setVal('r-cliente-documento', lastClient.clienteDocumento);
    if (lastClient.localAtendimento)
      Utils.setVal('r-local-atendimento', lastClient.localAtendimento);
    if (lastClient.clienteContato) Utils.setVal('r-cliente-contato', lastClient.clienteContato);
  }
}

function resetRegistroSaveButtonAfterClear() {
  const saveBtn = document.querySelector('[data-action="save-registro"]');
  if (saveBtn) {
    const saveLabel = saveBtn.querySelector('span');
    if (saveLabel) saveLabel.textContent = 'Salvar serviço';
    else saveBtn.textContent = 'Salvar serviço';
    saveBtn.classList.remove('btn--editing');
  }
}

function resetRegistroHeroAfterClear() {
  const heroPill = document.getElementById(HERO_PILL_TEXT_ID);
  if (heroPill) heroPill.textContent = 'Novo registro';
  const title = document.querySelector('#view-registro .section-title');
  if (title) title.textContent = 'O que foi feito hoje?';
}

function finalizeClearRegistroAfterReset() {
  _refreshRegistroContext();
}

export function clearRegistro(preserveEquip = false) {
  resetRegistroBaseFieldsAfterClear(preserveEquip);
  resetEditingState();
  resetRegistroDefaultFieldsAfterClear();
  resetRegistroMediaAfterClear();

  // Garante que o campo custom volte a ficar oculto junto com o reset do tipo.
  resetRegistroDetailsAfterClear();

  // Reseta o meter do hero pra empty sem remover o markup (ele é estático no
  // template agora, diferente da v5 que injetava dinamicamente).
  resetRegistroProgressAfterClear();

  // Reset do estado ativo dos chips de ação rápida - "Recomeçar" deve zerar
  // a seleção visual pra não sugerir um template que já não se aplica ao
  // novo registro em branco.
  resetRegistroQuickTemplateChipsAfterClear();

  // PMOC Fase 3: reset do state do checklist (impede vazar marcações
  // de um registro pra outro quando o user clica "Recomeçar").
  resetRegistroChecklistAfterClearClick();
  resetRegistroTechnicianDefaultAfterClear();

  // Auto-prefill do último cliente - técnico que atende o mesmo cliente em
  // sequência (ex.: manutenção de várias unidades no mesmo prédio) não precisa
  // redigitar. O usuário pode apagar os campos se for para outro cliente.
  restoreRegistroLastClientAfterClear();
  resetRegistroSaveButtonAfterClear();

  // Hero do redesign v6: pill texto volta pra "Novo registro" quando saímos
  // do modo edição. Mantém também o fallback para .section-title.
  resetRegistroHeroAfterClear();
  finalizeClearRegistroAfterReset();
}

function enterRegistroEditMode(id) {
  sessionStorage.setItem(EDITING_KEY, id);
  const formViewEdit = Utils.getEl('view-registro');
  if (formViewEdit) formViewEdit.dataset.editMode = '1';

  // Instala guard que bloqueia navegacao pra outra aba sem confirmar
  // descarte. Limpado em resetEditingState (save / clear / descarte aprovado).
  setRouteGuard(_confirmLeaveEditingGuard);
}

function fillRegistroEditBaseFields(r) {
  Utils.setVal('r-equip', r.equipId);
  Utils.setVal('r-data', r.data);
}

function fillRegistroEditTypeFields(r) {
  // Se o tipo foi salvo com prefixo "Outro · ", separamos de volta em select=Outro
  // + input custom. Caso contrário, repopulamos normalmente e deixamos o wrap
  // escondido. O syncTipoCustomVisibility no initRegistro finaliza o estado.
  const outroPrefix =
    typeof r.tipo === 'string' && r.tipo.startsWith(PREVIOUS_TIPO_OUTRO_PREFIX)
      ? PREVIOUS_TIPO_OUTRO_PREFIX
      : TIPO_OUTRO_PREFIX;
  if (typeof r.tipo === 'string' && r.tipo.startsWith(outroPrefix)) {
    Utils.setVal('r-tipo', 'Outro');
    Utils.setVal('r-tipo-custom', r.tipo.slice(outroPrefix.length));
  } else {
    Utils.setVal('r-tipo', r.tipo);
    Utils.setVal('r-tipo-custom', '');
  }
  syncTipoCustomVisibility();
}

function fillRegistroEditOperationalFields(r) {
  Utils.setVal('r-obs', r.obs);
  Utils.setVal('r-tecnico', r.tecnico || '');
  Utils.setVal('r-status', r.status || DEFAULT_REGISTRO_STATUS);
  Utils.setVal('r-prioridade', r.prioridade || DEFAULT_REGISTRO_PRIORIDADE);
  syncImpactDetailsState(hasImpactValues(r));
  Utils.setVal('r-pecas', r.pecas || '');
  Utils.setVal('r-custo-pecas', r.custoPecas ?? '');
  Utils.setVal('r-custo-mao-obra', r.custoMaoObra ?? '');
  syncMateriaisDetailsState(hasMateriaisValues(r));
}

function fillRegistroEditClientFields(r) {
  Utils.setVal('r-cliente-nome', r.clienteNome || '');
  Utils.setVal('r-cliente-documento', r.clienteDocumento || '');
  Utils.setVal('r-local-atendimento', r.localAtendimento || '');
  Utils.setVal('r-cliente-contato', r.clienteContato || '');
}

function restoreRegistroEditChecklist(r) {
  // PMOC Fase 3: carrega checklist se existe; senão renderiza vazio
  // baseado no tipo do equip.
  if (r.checklist && typeof r.checklist === 'object') {
    loadChecklistForEdit(r.checklist);
  } else {
    renderChecklist();
  }
}

function syncRegistroEditActionState() {
  const btn = document.querySelector('[data-action="save-registro"]');
  if (btn) {
    // Mantém o SVG do ícone intocado - só troca o rótulo interno.
    const label = btn.querySelector('span');
    if (label) label.textContent = 'Salvar alterações';
    else btn.textContent = 'Salvar alterações';
    btn.classList.add('btn--editing');
  }
}

function syncRegistroEditHeroContext() {
  // No redesign v6 o hero tem a pill "Novo registro"; no modo edição trocamos
  // pra "Editando serviço". O .section-title é mantido como fallback.
  const heroPill = document.getElementById(HERO_PILL_TEXT_ID);
  if (heroPill) heroPill.textContent = 'Editando serviço';
  const title = document.querySelector('#view-registro .section-title');
  if (title) title.textContent = 'Editar serviço';
  _refreshRegistroContext();
}

export function loadRegistroForEdit(id) {
  const { registros } = getState();
  const r = resolveRegistroEditTarget(registros, id);
  if (!r) return;

  enterRegistroEditMode(id);
  fillRegistroEditBaseFields(r);
  fillRegistroEditTypeFields(r);
  fillRegistroEditOperationalFields(r);
  fillRegistroEditClientFields(r);
  restoreRegistroEditChecklist(r);
  syncRegistroEditActionState();
  syncRegistroEditHeroContext();
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
