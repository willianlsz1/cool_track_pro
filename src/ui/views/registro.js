/**
 * CoolTrack Pro - Registro View v5.0
 * FunÃ§Ãµes: initRegistro, saveRegistro, clearRegistro
 */

import { Utils } from '../../core/utils.js';
import { getState, findEquip, setState, lastRegForEquip } from '../../core/state.js';
import { migrateLegacyKey, userStorage } from '../../core/userStorage.js';
import { Toast } from '../../core/toast.js';
import { goTo, setRouteGuard, clearRouteGuard } from '../../core/router.js';
import { CustomConfirm } from '../../core/modal.js';
import { Photos } from '../components/photos.js';
import { SavedHighlight } from '../components/onboarding.js';
import { Profile } from '../../core/profile.js';
import { ErrorCodes, handleError } from '../../core/errors.js';
import { uploadPendingPhotos } from '../../core/photoStorage.js';
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
import { isSafeRegistroPhotoSrc } from '../viewModels/registroPhotosModel.js';
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
  buildRegistroPhotoPayload,
  getRegistroPhotoState,
  persistRegistroPhotosForSave,
} from './registro/save/photos.js';
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
import { isPreventivaOrPmocServiceType } from '../../domain/pmoc/serviceType.js';

// O meter de progresso vive estÃ¡tico dentro do hero do template.
// Apontamos pro hero + o contador numÃ©rico ao invÃ©s de injetar markup na hora.
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
      'Limpeza preventiva realizada no equipamento. Filtros higienizados e operaÃ§Ã£o validada em funcionamento normal.',
  },
  recarga_gas: {
    tipo: 'Carga de GÃ¡s Refrigerante',
    prioridade: 'alta',
    descricao:
      'Recarga de gÃ¡s refrigerante aplicada apÃ³s verificaÃ§Ã£o de pressÃ£o e vedaÃ§Ã£o. Sistema estabilizado para operaÃ§Ã£o.',
  },
  troca_filtro: {
    tipo: 'Limpeza de Filtros',
    prioridade: 'media',
    descricao:
      'Troca de filtro executada para restabelecer vazÃ£o de ar e qualidade da operaÃ§Ã£o. Equipamento testado apÃ³s a substituiÃ§Ã£o.',
  },
  inspecao: {
    tipo: 'InspeÃ§Ã£o Geral',
    prioridade: 'baixa',
    descricao:
      'InspeÃ§Ã£o tÃ©cnica geral concluÃ­da com checklist visual e funcional. Sem anomalias crÃ­ticas no momento.',
  },
  manutencao_corretiva: {
    tipo: 'ManutenÃ§Ã£o Corretiva',
    prioridade: 'alta',
    descricao:
      'Atendimento corretivo realizado para falha reportada em campo. CorreÃ§Ã£o aplicada e equipamento reavaliado em funcionamento.',
  },
};

// DescriÃ§Ãµes padrÃ£o por tipo do dropdown r-tipo. Quando o usuÃ¡rio seleciona uma
// opÃ§Ã£o (via select nativo, nÃ£o via chip de aÃ§Ã£o rÃ¡pida), o textarea
// "Detalhes pro cliente" Ã© preenchido com a frase abaixo â€” mesma lÃ³gica dos
// chips, pra evitar dois caminhos com comportamento diferente.
// Reusa as descriÃ§Ãµes do QUICK_TEMPLATE_MAP onde hÃ¡ correspondÃªncia, e
// adiciona frases novas pros tipos que nÃ£o tÃªm aÃ§Ã£o rÃ¡pida equivalente.
// "Outro" fica fora â€” nesse caso o user digita um rÃ³tulo prÃ³prio no campo
// "Qual serviÃ§o?" e escreve os detalhes manualmente.
const DESCRIPTION_BY_TIPO = {
  'ManutenÃ§Ã£o Preventiva':
    'ManutenÃ§Ã£o preventiva realizada conforme plano do equipamento. Componentes verificados, limpeza geral executada e operaÃ§Ã£o validada em funcionamento normal.',
  'ManutenÃ§Ã£o Corretiva': QUICK_TEMPLATE_MAP.manutencao_corretiva.descricao,
  'Limpeza de Filtros': QUICK_TEMPLATE_MAP.limpeza.descricao,
  'Carga de GÃ¡s Refrigerante': QUICK_TEMPLATE_MAP.recarga_gas.descricao,
  'Troca de Compressor':
    'Compressor substituÃ­do por unidade compatÃ­vel. Sistema recarregado, isolamento tÃ©rmico reconstituÃ­do e funcionamento validado apÃ³s o procedimento.',
  'Troca de Capacitor':
    'Capacitor substituÃ­do por componente equivalente. Partida do motor testada e parÃ¢metros elÃ©tricos dentro do esperado.',
  'Limpeza de Condensador':
    'Limpeza do condensador executada com desobstruÃ§Ã£o das aletas. Troca tÃ©rmica restabelecida e operaÃ§Ã£o validada.',
  'Limpeza de Evaporador':
    'Limpeza do evaporador realizada com higienizaÃ§Ã£o das aletas. Temperatura de operaÃ§Ã£o verificada apÃ³s o procedimento.',
  'VerificaÃ§Ã£o ElÃ©trica':
    'VerificaÃ§Ã£o elÃ©trica realizada: mediÃ§Ãµes de corrente, tensÃ£o e isolamento dentro dos parÃ¢metros normais. Sem anomalias registradas.',
  'Ajuste de Dreno':
    'Dreno desobstruÃ­do e testado. Escoamento do condensado normalizado, sem retorno de Ã¡gua no equipamento.',
  'InspeÃ§Ã£o Geral': QUICK_TEMPLATE_MAP.inspecao.descricao,
};

// Set com todas as descriÃ§Ãµes conhecidas (quick templates + por-tipo). Serve
// pro prefill do dropdown saber se pode sobrescrever o textarea â€” se o texto
// atual for uma frase auto-preenchida, Ã© seguro trocar; se o user editou, a
// gente respeita o que ele escreveu. Inclui as duas descriÃ§Ãµes de tipo
// 'Limpeza de Filtros' (limpeza preventiva vs troca de filtro) porque ambas
// vÃªm dos chips de aÃ§Ã£o rÃ¡pida e ainda representam texto auto-gerado.
const KNOWN_AUTO_DESCRIPTIONS = new Set([
  ...Object.values(QUICK_TEMPLATE_MAP).map((t) => t.descricao),
  ...Object.values(DESCRIPTION_BY_TIPO),
]);

function _prefillObsFromTipo(tipo) {
  const desc = DESCRIPTION_BY_TIPO[tipo];
  if (!desc) return; // tipo sem template (ex.: "Outro") â€” nada a fazer
  const currentObs = Utils.getVal('r-obs').trim();
  // Sobrescreve sÃ³ quando o textarea estÃ¡ vazio OU quando o conteÃºdo atual Ã©
  // uma frase auto-gerada (aÃ§Ã£o rÃ¡pida anterior ou outro tipo do dropdown).
  // Assim, trocar de tipo atualiza os detalhes, mas texto digitado Ã  mÃ£o
  // continua intocado.
  if (currentObs && !KNOWN_AUTO_DESCRIPTIONS.has(currentObs)) return;
  Utils.setVal('r-obs', desc);
}

const EDITING_KEY = 'cooltrack-editing-id';
let _registroChecklistRenderGeneration = 0;
let _isSavingRegistro = false;
// Persiste o Ãºltimo cliente preenchido para auto-prefill no prÃ³ximo registro â€”
// tÃ©cnico que atende o mesmo cliente em sequÃªncia nÃ£o precisa digitar de novo.
const LAST_CLIENT_KEY = 'cooltrack-last-client';
let _currentRouteParams = {};
let _resolvedRegistroContext = null;

function _loadLastClient() {
  try {
    migrateLegacyKey(LAST_CLIENT_KEY);
    return JSON.parse(userStorage.get(LAST_CLIENT_KEY) || 'null');
  } catch (_err) {
    return null;
  }
}

function _saveLastClient(cliente) {
  try {
    // SÃ³ persiste se algum campo estiver preenchido â€” evita sobrescrever com
    // registros salvos "no modo rÃ¡pido" que nÃ£o tocam os campos do cliente.
    if (!cliente || (!cliente.clienteNome && !cliente.localAtendimento)) return;
    userStorage.set(LAST_CLIENT_KEY, JSON.stringify(cliente));
  } catch (_err) {
    // localStorage indisponÃ­vel â€” ignora
  }
}

function _updateImpactCopy(context) {
  const subtitle = document.getElementById('registro-impact-subtitle');
  const hint = document.getElementById('registro-impact-hint');
  if (!subtitle || !hint) return;

  if (context?.hasCompanyContext) {
    subtitle.textContent = 'opcional â€” status final e prioridade para PMOC';
    hint.textContent =
      'Se houve falha, risco ou pendÃªncia, ajuste o impacto para o acompanhamento do cliente.';
    return;
  }

  subtitle.textContent = 'opcional â€” status final e prioridade';
  hint.textContent = 'Se algo saiu do normal, ajuste o status e a prioridade.';
}

function _isFilledMaterialValue(value) {
  const normalized = String(value ?? '').trim();
  return normalized !== '' && normalized !== '0' && normalized !== '0.00' && normalized !== '0,00';
}

function _hasMateriaisValues(source = null) {
  if (source) {
    return (
      _isFilledMaterialValue(source.pecas) ||
      _isFilledMaterialValue(source.custoPecas) ||
      _isFilledMaterialValue(source.custoMaoObra)
    );
  }

  return (
    _isFilledMaterialValue(Utils.getVal('r-pecas')) ||
    _isFilledMaterialValue(Utils.getVal('r-custo-pecas')) ||
    _isFilledMaterialValue(Utils.getVal('r-custo-mao-obra'))
  );
}

function _syncMateriaisDetailsState(expanded = null) {
  const details = document.getElementById(REGISTRO_MATERIAIS_DETAILS_ID);
  if (!details) return;

  if (typeof expanded === 'boolean') {
    if (expanded) details.setAttribute('open', '');
    else details.removeAttribute('open');
  }

  const isExpanded = details.hasAttribute('open');
  details.querySelector('summary')?.setAttribute('aria-expanded', String(isExpanded));
}

function _bindMateriaisDetailsToggle() {
  const details = document.getElementById(REGISTRO_MATERIAIS_DETAILS_ID);
  if (!details || details.dataset.bound === '1') return;

  details.dataset.bound = '1';
  const summary = details.querySelector('summary');
  summary?.addEventListener('click', () => {
    queueMicrotask(() => _syncMateriaisDetailsState());
  });
  details.addEventListener('toggle', () => _syncMateriaisDetailsState());
  _syncMateriaisDetailsState(details.hasAttribute('open'));
}

function _hasImpactValues(source = null) {
  const status = String(source?.status ?? Utils.getVal('r-status') ?? '').trim();
  const prioridade = String(source?.prioridade ?? Utils.getVal('r-prioridade') ?? '').trim();
  return (
    (status && status !== DEFAULT_REGISTRO_STATUS) ||
    (prioridade && prioridade !== DEFAULT_REGISTRO_PRIORIDADE)
  );
}

function _syncImpactDetailsState(expanded = null) {
  const details = document.getElementById(REGISTRO_IMPACT_DETAILS_ID);
  if (!details) return;

  if (typeof expanded === 'boolean') {
    if (expanded) details.setAttribute('open', '');
    else details.removeAttribute('open');
  }

  const isExpanded = details.hasAttribute('open');
  details.querySelector('summary')?.setAttribute('aria-expanded', String(isExpanded));
}

function _bindImpactDetailsToggle() {
  const details = document.getElementById(REGISTRO_IMPACT_DETAILS_ID);
  if (!details || details.dataset.bound === '1') return;

  details.dataset.bound = '1';
  const summary = details.querySelector('summary');
  summary?.addEventListener('click', () => {
    queueMicrotask(() => _syncImpactDetailsState());
  });
  details.addEventListener('toggle', () => _syncImpactDetailsState());
  _syncImpactDetailsState(details.hasAttribute('open'));
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
    // Dismiss (X/backdrop/Escape) Ã© indecisÃ£o: preserva a data `proxima`
    // existente em vez de gravar uma escolha implÃ­cita.
    return result;
  }

  if (result.semRetorno === true) {
    // "Sem retorno" Ã© uma decisÃ£o explÃ­cita do tÃ©cnico: limpamos `proxima`
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
      context.cliente.documento ? ` Â· ${Utils.escapeHtml(context.cliente.documento)}` : ''
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
  // Layout V3: o botÃ£o "Enviar pra outro destinatÃ¡rio" agora vive dentro de
  // uma row no .action-tray. Ocultar o botÃ£o sozinho deixaria a row vazia
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
    if (clienteText) clienteText.textContent = context.cliente?.nome || 'NÃ£o informado';
    if (setorText) setorText.textContent = context.setor?.nome || 'NÃ£o informado';
    if (equipText) {
      const eq = context.equipamento;
      const suffix = eq?.tag ? ` Â· TAG ${eq.tag}` : '';
      equipText.textContent = eq?.nome ? `${eq.nome}${suffix}` : 'NÃ£o informado';
    }
  } else if (contextCard) {
    contextCard.hidden = true;
  }

  if (contextHint) {
    if (context?.missingEquipFromParams) {
      contextHint.hidden = false;
      contextHint.textContent =
        'Equipamento nÃ£o encontrado. Confira o cadastro ou escolha outro equipamento.';
    } else if (context?.shouldWarnEquipmentOnly) {
      contextHint.hidden = false;
      contextHint.textContent = 'Este serviÃ§o ficarÃ¡ apenas no histÃ³rico do equipamento.';
    } else {
      contextHint.hidden = true;
      contextHint.textContent = '';
    }
  }

  _applyClienteDetailsContext(context);
  _updateRegistroShareActions(context);
  _updateImpactCopy(context);
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
    label: `${equipamento?.nome || 'â€”'} â€” ${equipamento?.local || 'â€”'}`,
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
  // Edicao terminou (save / clear / discard) â€” libera o guard de navegacao.
  clearRouteGuard();
}

// Guard de saida em modo ediÃ§Ã£o. Bloqueia navegacao pra outra rota e mostra
// modal pedindo confirmaÃ§Ã£o. Se usuÃ¡rio "Descartar", faz reset COMPLETO do
// form (clearRegistro) â€” incluindo label do botao "Finalizar serviÃ§o" â€” e
// libera a navegacao. Se "Continuar editando", cancela.
async function _confirmLeaveEditingGuard(_nextRoute, _nextParams) {
  const ok = await CustomConfirm.show(
    'Sair sem salvar as alteraÃ§Ãµes?',
    'VocÃª estÃ¡ editando um registro. Se sair agora, as alteraÃ§Ãµes serÃ£o descartadas.',
    {
      confirmLabel: 'Descartar e sair',
      cancelLabel: 'Continuar editando',
      tone: 'danger',
    },
  );
  if (ok) {
    // Reset completo: limpa campos do form, foto, checklist, label do botao
    // ("Salvar alteracoes" -> "Finalizar serviÃ§o"), classes, EDITING_KEY,
    // dataset e o proprio guard (resetEditingState e chamado dentro).
    clearRegistro();
  }
  return ok;
}

// Prefixo usado quando o usuÃ¡rio escolhe "Outro" e descreve o serviÃ§o num campo
// livre. O valor final persistido em `registro.tipo` fica tipo "Outro Â· Teste
// de estanqueidade" â€” Ã© sÃ³ uma string Ãºnica, sem coluna extra no Supabase. Para
// ediÃ§Ã£o, o loadRegistroForEdit detecta o prefixo e repopula o select + o input
// custom automaticamente.
const TIPO_OUTRO_PREFIX = 'Outro Â· ';
const TIPO_CUSTOM_MAX = 40;

// â”€â”€ Barra de progresso do formulÃ¡rio â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// O campo r-tipo-custom Ã© condicional: sÃ³ conta como "preenchido" quando o tipo
// = "Outro". Nos outros tipos ele fica oculto e nem Ã© considerado na barra.
const _fields = [
  { id: 'r-equip', validate: (v) => v !== '' },
  { id: 'r-data', validate: (v) => v !== '' },
  {
    id: 'r-tipo',
    validate: (v) => {
      if (v === '') return false;
      if (v === 'Outro') {
        // Quando "Outro", sÃ³ consideramos o tipo "preenchido" se o custom label
        // tambÃ©m estiver vÃ¡lido (>=1 char, sem exceder o limite). Sem isso, a
        // barra de progresso marcaria Outro como ok mesmo com o label em branco.
        const custom = (Utils.getEl('r-tipo-custom')?.value || '').trim();
        return custom.length >= 1 && custom.length <= TIPO_CUSTOM_MAX;
      }
      return true;
    },
  },
  { id: 'r-tecnico', validate: (v) => v.trim() !== '' },
  { id: 'r-obs', validate: (v) => v.trim().length >= 10 },
];

// Mostra/esconde o input custom conforme a seleÃ§Ã£o do tipo. TambÃ©m gerencia o
// atributo `required` e o foco automÃ¡tico quando o usuÃ¡rio escolhe "Outro" â€”
// assim a UX flui: escolheu Outro â†’ cursor jÃ¡ no campo pra descrever.
function _syncTipoCustomVisibility({ focusOnShow = false } = {}) {
  const sel = Utils.getEl('r-tipo');
  const wrap = document.getElementById('r-tipo-custom-wrap');
  const input = Utils.getEl('r-tipo-custom');
  if (!sel || !wrap || !input) return;

  const isOutro = sel.value === 'Outro';
  wrap.hidden = !isOutro;
  if (isOutro) {
    input.setAttribute('required', '');
    input.setAttribute('aria-required', 'true');
    if (focusOnShow) {
      // pequeno delay pra evitar quebra de foco quando o change vem de click
      // no select nativo em alguns browsers mobile (iOS Safari especialmente)
      setTimeout(() => input.focus(), 30);
    }
  } else {
    input.removeAttribute('required');
    input.removeAttribute('aria-required');
    input.value = '';
  }
}

// â”€â”€ Meter de progresso no hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
// Desde o redesign (v6), o meter estÃ¡ inline no template (.registro-hero__meter
// com 5 .registro-hero__seg). A funÃ§Ã£o "ensure" virou sÃ³ uma garantia de que o
// hero existe e tÃ¡ sincronizado; a "update" pinta cada segmento conforme os
// campos vÃ£o sendo preenchidos e troca o data-state do hero pra empty/partial/
// complete â€” CSS muda a cor do meter e dos indicadores a partir disso.
function _ensureProgressBar(_formView) {
  // No-op mantido pra compatibilidade com o contrato anterior. O markup jÃ¡ vem
  // do template; se alguma view legado perder o hero, o _updateProgressBar
  // simplesmente nÃ£o faz nada (guard clauses abaixo).
}

function _updateProgressBar() {
  const total = _fields.length;
  const filled = _fields.filter((f) => {
    const i = Utils.getEl(f.id);
    return i && f.validate(i.value);
  }).length;

  const hero = document.getElementById(HERO_ID);
  const meter = document.getElementById(METER_ID);
  const cnt = document.getElementById(PROGRESS_COUNT_ID);

  if (cnt) cnt.textContent = String(filled);

  if (meter) {
    const segs = meter.querySelectorAll('.registro-hero__seg');
    segs.forEach((seg, idx) => {
      seg.classList.toggle('is-filled', idx < filled);
    });
    meter.setAttribute('aria-valuenow', String(filled));
    meter.setAttribute('aria-valuemax', String(total));
  }

  if (hero) {
    hero.dataset.state = filled === 0 ? 'empty' : filled === total ? 'complete' : 'partial';
  }
}

// â”€â”€ Sub do hero (meta "Domingo Â· 19 abr Â· 20:55") â”€â”€â”€â”€â”€â”€
// Renderiza o sub do hero em portuguÃªs com 3 dots separadores. Se no futuro
// quisermos atualizar "ao vivo" (ex.: relÃ³gio), basta chamar de novo. Hoje sÃ³
// roda no initRegistro â€” data Ã© a da abertura do formulÃ¡rio.
function _renderHeroSub() {
  const sub = document.getElementById(HERO_SUB_ID);
  if (!sub) return;
  const now = new Date();
  const dias = ['Domingo', 'Segunda', 'TerÃ§a', 'Quarta', 'Quinta', 'Sexta', 'SÃ¡bado'];
  const meses = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const parts = [
    dias[now.getDay()],
    `${now.getDate()} ${meses[now.getMonth()]} ${now.getFullYear()}`,
    `${hh}:${mm}`,
  ];
  sub.innerHTML = parts
    .map(
      (p, i) =>
        `<span>${p}</span>${i < parts.length - 1 ? '<span class="registro-hero__sub-dot" aria-hidden="true"></span>' : ''}`,
    )
    .join('');
}

// â”€â”€ Aviso de manutenÃ§Ã£o agendada â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function _bindEquipChangeWarning() {
  const sel = Utils.getEl('r-equip');
  if (!sel) return;
  if (sel.dataset.registroEquipWarningBound === '1') return;
  sel.dataset.registroEquipWarningBound = '1';
  sel.addEventListener('change', () => {
    const id = sel.value;
    const currentEditingId = sessionStorage.getItem(EDITING_KEY);
    if (currentEditingId) {
      resetEditingState();
      clearRegistro();
      if (id) Utils.setVal('r-equip', id);
    }
    document.getElementById('reg-pending-warning')?.remove();
    if (!id) return;
    const lastReg = lastRegForEquip(id);
    if (lastReg && Utils.daysDiff(lastReg.proxima) >= 0) {
      const w = document.createElement('div');
      w.id = 'reg-pending-warning';
      w.className = 'reg-pending-warning';
      w.textContent = 'âš  ManutenÃ§Ã£o preventiva agendada. Registre apenas em emergÃªncia.';
      sel.parentNode.parentNode.insertBefore(w, sel.parentNode.nextSibling);
    }
  });
}

// â”€â”€ Checklist NBR 13971 (Fase 3 PMOC) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// State local: snapshot do checklist em ediÃ§Ã£o. Reset quando equip muda
// (template Ã© por tipo) ou quando o registro Ã© salvo/limpo.
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
  return Photos.unmount?.();
}

function _hasPmocChecklistAccess() {
  return PlanCache.isCachedPlanPro?.() === true;
}

function _showPmocChecklistUpsell(visible) {
  const upsell = document.getElementById(REGISTRO_CHECKLIST_UPSELL_ID);
  if (upsell) upsell.hidden = !visible;
}

function _getRegistroChecklistServiceType() {
  const tipo = Utils.getVal('r-tipo');
  if (tipo !== 'Outro') return tipo;
  return Utils.getVal('r-tipo-custom') || tipo;
}

function _isRegistroChecklistRecommended() {
  return (
    Boolean(Utils.getVal('r-equip')) &&
    isPreventivaOrPmocServiceType(_getRegistroChecklistServiceType())
  );
}

function _applyPmocChecklistDiscoveryState() {
  const recommended = _isRegistroChecklistRecommended();
  const wrapper = document.getElementById(REGISTRO_CHECKLIST_DETAILS_ID);
  const pri = document.getElementById('r-checklist-pri');
  const upsell = document.getElementById(REGISTRO_CHECKLIST_UPSELL_ID);
  const upsellContext = document.getElementById('r-checklist-upsell-context');

  if (wrapper) {
    wrapper.dataset.pmocRecommended = recommended ? 'true' : 'false';
    wrapper.open = !wrapper.hidden && recommended;
  }
  if (pri) pri.hidden = !recommended;
  if (upsell) upsell.dataset.pmocRecommended = recommended ? 'true' : 'false';
  if (upsellContext) {
    upsellContext.textContent = recommended ? ' Recomendado para preventiva/PMOC.' : '';
  }
}

function _redirectPmocChecklistUpsell() {
  trackEvent('pmoc_checklist_upsell_clicked', { source: 'registro_form' });
  Toast.warning('Recurso indisponivel nesta etapa.');
}

function _ensurePmocChecklistAccess({ redirect = false } = {}) {
  if (_hasPmocChecklistAccess()) return true;

  const wrapper = document.getElementById(REGISTRO_CHECKLIST_DETAILS_ID);
  if (wrapper) wrapper.hidden = true;
  unmountRegistroChecklist();
  _showPmocChecklistUpsell(true);
  _applyPmocChecklistDiscoveryState();

  if (redirect) _redirectPmocChecklistUpsell();
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
      : 'periodicidade nÃ£o definida';
  const tipoServico = _getRegistroChecklistServiceType() || 'ServiÃ§o';
  const filled = s.ok + s.fail + s.na;
  summaryEl.textContent = `${tipoServico} Â· ${periodicidadeLabel} Â· ${filled}/${s.total} itens preenchidos`;
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
 * r-equip muda OU quando o accordion Ã© aberto pela primeira vez.
 *
 * EstratÃ©gia: usa o snapshot existente em _currentChecklist se o
 * tipo_template corresponde â€” preserva marcaÃ§Ãµes do user mesmo se
 * ele trocar de equip e voltar. SenÃ£o, reseta para checklist vazio.
 */
export function renderChecklist() {
  const { wrapper, body } = getRegistroChecklistElements();
  if (!wrapper || !body) return;

  const equipId = Utils.getVal('r-equip');
  if (!equipId) {
    wrapper.hidden = true;
    delete wrapper.dataset.pmocRecommended;
    clearRegistroChecklistState();
    unmountRegistroChecklist();
    _showPmocChecklistUpsell(false);
    _applyPmocChecklistDiscoveryState();
    _updateChecklistSummary();
    return;
  }
  const equip = findEquip(equipId);
  if (!equip) {
    wrapper.hidden = true;
    unmountRegistroChecklist();
    _showPmocChecklistUpsell(false);
    _applyPmocChecklistDiscoveryState();
    return;
  }

  if (!_ensurePmocChecklistAccess()) {
    clearRegistroChecklistState();
    _updateChecklistSummary();
    return;
  }

  const tpl = resolveRegistroChecklistTemplate(equip, { getChecklistTemplate });
  // Preserva marcaÃ§Ãµes se template Ã© o mesmo (user trocou de equip do mesmo tipo)
  ensureRegistroChecklistStateForTemplate(equip, tpl);

  _showPmocChecklistUpsell(false);
  wrapper.hidden = false;
  _refreshChecklistPriBadge();

  mountRegistroChecklist(tpl);

  _updateChecklistSummary();
}

/** Atualiza status de um item â€” chamado pelo handler de click. */
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
  // Update DOM in place â€” nÃ£o re-renderiza pra preservar foco em textarea
  updateRegistroChecklistStatusDom(itemId, item.status);
  _updateChecklistSummary();
}

/** Atualiza obs de um item â€” chamado pelo handler de input do textarea. */
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
 * PMOC Fase 4: atualiza mediÃ§Ã£o numÃ©rica de um item measurable.
 * Vazio limpa o measure (vira null); valor numÃ©rico salva como
 * { value, unit }. NÃ£o-numÃ©ricos sÃ£o ignorados (input number jÃ¡
 * filtra mas defensivo aqui tambÃ©m).
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

/** Snapshot atual do checklist â€” chamado por saveRegistro. */
export function getCurrentChecklist() {
  return collectRegistroChecklistForSave(getRegistroChecklistState());
}

/** Reset â€” chamado por clearRegistro. */
function resetRegistroChecklistAfterClear() {
  clearRegistroChecklistState();
  const body = document.getElementById(REGISTRO_CHECKLIST_ROOT_ID);
  unmountRegistroChecklist();
  if (body) body.textContent = '';
  const wrapper = document.getElementById(REGISTRO_CHECKLIST_DETAILS_ID);
  if (wrapper) wrapper.hidden = true;
  _showPmocChecklistUpsell(false);
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

/** Carrega checklist do registro existente em modo ediÃ§Ã£o. */
export function loadChecklistForEdit(checklist) {
  restoreRegistroChecklistForEdit(checklist);
}

function _bindRegistroHeaderFieldHandlers() {
  _fields.forEach((f) => {
    const i = Utils.getEl(f.id);
    if (!i || i.dataset.registroProgressBound === '1') return;
    i.dataset.registroProgressBound = '1';
    i.addEventListener('input', _updateProgressBar);
    i.addEventListener('change', _updateProgressBar);
  });

  _bindEquipChangeWarning();

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
      _syncTipoCustomVisibility({ focusOnShow: true });
      _prefillObsFromTipo(tipoSel.value);
      _updateProgressBar();
      _refreshChecklistPriBadge();
    });
  }

  const tipoCustomInput = Utils.getEl('r-tipo-custom');
  if (tipoCustomInput && tipoCustomInput.dataset.registroTipoCustomBound !== '1') {
    tipoCustomInput.dataset.registroTipoCustomBound = '1';
    tipoCustomInput.addEventListener('input', () => {
      _updateProgressBar();
      _refreshChecklistPriBadge();
      _updateChecklistSummary();
    });
  }
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// API PÃšBLICA
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

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

  // Smart mask no campo Telefone/contato do cliente â€” formata (XX) XXXXX-XXXX
  // se o usuÃ¡rio digitar dÃ­gitos. Se digitar email/texto livre, deixa em paz.
  bindSmartContactMaskInput(Utils.getEl('r-cliente-contato'));

  formView.dataset.bound = '1';
}

function syncRegistroInitDetailsState(formView) {
  _ensureProgressBar(formView);
  _bindRegistroHeaderFieldHandlers();
  bindRegistroInitFormOnce(formView);

  // Garante o estado correto na entrada da view (inclusive vindo de edit).
  _syncTipoCustomVisibility();
  _bindMateriaisDetailsToggle();
  _syncMateriaisDetailsState(_hasMateriaisValues());
  _bindImpactDetailsToggle();
  _syncImpactDetailsState(_hasImpactValues());
  _updateProgressBar();
}

function renderRegistroInitHeroAndPhotos() {
  _renderHeroSub();
  Photos.render?.();
}

function applyRegistroInitDateDefault() {
  // Data padrÃ£o "Hoje agora" â€” UX V2 audit fix
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
    // Se a data Ã© dentro de 1min do agora, Ã© "Hoje agora"
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
    _updateProgressBar();
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
    _updateProgressBar();
  });

  refreshLabel();
}

function applyRegistroInitTechnicianDefault() {
  // H1: tÃ©cnico padrÃ£o
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
  renderRegistroInitHeroAndPhotos();
  applyRegistroInitDateDefault();
  bindRegistroInitDatetimeUX();
  applyRegistroInitTechnicianDefault();

  // PrÃ©-preenchimento vindo de fluxo (dashboard/equipamento/alerta)
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
    Toast.warning('Descreva o serviÃ§o no campo "Qual serviÃ§o?" pra continuar.');
    elements.tipoCustom?.focus();
    return { valid: false };
  }

  if (result.reason === 'custom-too-long') {
    Toast.warning(`A descricao do serviÃ§o passa do limite de ${TIPO_CUSTOM_MAX} caracteres.`);
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
    isPreventivaTipo: isPreventivaOrPmocServiceType,
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
  // o nome dele. Salva apenas o campo .nome â€” outros campos (empresa,
  // CNPJ) ficam pra ele preencher em /conta. Idempotente: nao sobrescreve
  // perfil ja preenchido.
  try {
    const currentProfile = Profile.get() || {};
    if (!currentProfile.nome && tecnico) {
      Profile.save({ ...currentProfile, nome: tecnico });
    }
  } catch (_err) {
    /* storage off â€” nao bloqueia o save do registro */
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

  // Feedback pos-save simples; PDF/WhatsApp serao reconstruidos em etapa propria.
  runRegistroPreventivaPromptAfterSave(registroId, {
    showProximaPreventivaPrompt: _showProximaPreventivaPrompt,
  });
  notifyRegistroCreateSaved({ equipId, registroId, saveContext }, { PostSaveRegistroToast, Toast });

  return true;
}

export function applyQuickTemplate(templateId, triggerEl = null) {
  const template = QUICK_TEMPLATE_MAP[templateId];
  if (!template) return;

  // â”€â”€â”€ Pre-fill agressivo (UX V2 audit) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Antes preenchia tipo, obs, prioridade, data. Agora tambem preenche
  // status=ok (assume que ficou operando), e foca o proximo campo vazio.
  Utils.setVal('r-tipo', template.tipo);
  _syncTipoCustomVisibility();
  if (!Utils.getVal('r-obs').trim()) Utils.setVal('r-obs', template.descricao);
  Utils.setVal('r-prioridade', template.prioridade);
  Utils.setVal('r-data', Utils.nowDatetime());
  // Default status "Operando normalmente" â€” 80% dos casos preventivos
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

  _updateProgressBar();

  // â”€â”€â”€ Smart focus + feedback contextual â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Identifica o proximo required vazio e foca nele. Toast diz exatamente
  // o que falta â€” em vez do generico "revise e salve".
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
    // Tudo pronto pra salvar â€” foca no botao primario
    const saveBtn = document.querySelector('[data-action="save-registro"]');
    if (saveBtn) saveBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    Toast.success('Modelo aplicado. Toque em Salvar serviÃ§o pra finalizar.');
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

    // Modo ediÃ§Ã£o â€” atualiza registro existente
    const editingId = getRegistroEditingId();
    if (editingId) {
      applyRegistroEditStateMutation(editingId, persistedPayload);
      runRegistroEditPostSaveEffects(persistedPayload);
      return true;
    }

    // Modo criaÃ§Ã£o â€” continua fluxo normal
    const novoId = resolveRegistroCreateId({ uid: () => Utils.uid() });
    const photoState = getRegistroPhotoState({ Photos, isSafeRegistroPhotoSrc });

    const photoPayload = buildRegistroPhotoPayload(
      await persistRegistroPhotosForSave(photoState, {
        registroId: novoId,
        uploadPendingPhotos,
        Toast,
        handleError,
        ErrorCodes,
      }),
    );

    const operationalStatus = getOperationalStatus({
      status,
      lastStatus: status,
      ultimoRegistro: { status },
    });

    const registro = buildRegistroCreateRecord({
      registroId: novoId,
      persistedPayload,
      photoPayload,
      assinaturaPayload: false,
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
  Photos.clear();
}

function resetRegistroDetailsAfterClear() {
  _syncTipoCustomVisibility();
  _syncMateriaisDetailsState(false);
  _syncImpactDetailsState(false);
}

function resetRegistroProgressAfterClear() {
  _updateProgressBar();
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
    if (saveLabel) saveLabel.textContent = 'Salvar serviÃ§o';
    else saveBtn.textContent = 'Salvar serviÃ§o';
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

  // Reseta o meter do hero pra empty sem remover o markup (ele Ã© estÃ¡tico no
  // template agora, diferente da v5 que injetava dinamicamente).
  resetRegistroProgressAfterClear();

  // Reset do estado ativo dos chips de aÃ§Ã£o rÃ¡pida â€” "RecomeÃ§ar" deve zerar
  // a seleÃ§Ã£o visual pra nÃ£o sugerir um template que jÃ¡ nÃ£o se aplica ao
  // novo registro em branco.
  resetRegistroQuickTemplateChipsAfterClear();

  // PMOC Fase 3: reset do state do checklist (impede vazar marcaÃ§Ãµes
  // de um registro pra outro quando o user clica "RecomeÃ§ar").
  resetRegistroChecklistAfterClearClick();
  resetRegistroTechnicianDefaultAfterClear();

  // Auto-prefill do Ãºltimo cliente â€” tÃ©cnico que atende o mesmo cliente em
  // sequÃªncia (ex.: manutenÃ§Ã£o de vÃ¡rias unidades no mesmo prÃ©dio) nÃ£o precisa
  // redigitar. O usuÃ¡rio pode apagar os campos se for para outro cliente.
  restoreRegistroLastClientAfterClear();
  resetRegistroSaveButtonAfterClear();

  // Hero do redesign v6: pill texto volta pra "Novo registro" quando saÃ­mos
  // do modo ediÃ§Ã£o. MantÃ©m tambÃ©m o fallback pro legado .section-title.
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
  // Se o tipo foi salvo com prefixo "Outro Â· ", separamos de volta em select=Outro
  // + input custom. Caso contrÃ¡rio, repopulamos normalmente e deixamos o wrap
  // escondido. O _syncTipoCustomVisibility no initRegistro finaliza o estado.
  if (typeof r.tipo === 'string' && r.tipo.startsWith(TIPO_OUTRO_PREFIX)) {
    Utils.setVal('r-tipo', 'Outro');
    Utils.setVal('r-tipo-custom', r.tipo.slice(TIPO_OUTRO_PREFIX.length));
  } else {
    Utils.setVal('r-tipo', r.tipo);
    Utils.setVal('r-tipo-custom', '');
  }
  _syncTipoCustomVisibility();
}

function fillRegistroEditOperationalFields(r) {
  Utils.setVal('r-obs', r.obs);
  Utils.setVal('r-tecnico', r.tecnico || '');
  Utils.setVal('r-status', r.status || DEFAULT_REGISTRO_STATUS);
  Utils.setVal('r-prioridade', r.prioridade || DEFAULT_REGISTRO_PRIORIDADE);
  _syncImpactDetailsState(_hasImpactValues(r));
  Utils.setVal('r-pecas', r.pecas || '');
  Utils.setVal('r-custo-pecas', r.custoPecas ?? '');
  Utils.setVal('r-custo-mao-obra', r.custoMaoObra ?? '');
  _syncMateriaisDetailsState(_hasMateriaisValues(r));
}

function fillRegistroEditClientFields(r) {
  Utils.setVal('r-cliente-nome', r.clienteNome || '');
  Utils.setVal('r-cliente-documento', r.clienteDocumento || '');
  Utils.setVal('r-local-atendimento', r.localAtendimento || '');
  Utils.setVal('r-cliente-contato', r.clienteContato || '');
}

function restoreRegistroEditChecklist(r) {
  // PMOC Fase 3: carrega checklist se existe; senÃ£o renderiza vazio
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
    // MantÃ©m o SVG do Ã­cone intocado â€” sÃ³ troca o rÃ³tulo interno.
    const label = btn.querySelector('span');
    if (label) label.textContent = 'Salvar alteraÃ§Ãµes';
    else btn.textContent = 'Salvar alteraÃ§Ãµes';
    btn.classList.add('btn--editing');
  }
}

function syncRegistroEditHeroContext() {
  // No redesign v6 o hero tem a pill "Novo registro"; no modo ediÃ§Ã£o trocamos
  // pra "Editando serviÃ§o". O .section-title legado Ã© mantido como fallback.
  const heroPill = document.getElementById(HERO_PILL_TEXT_ID);
  if (heroPill) heroPill.textContent = 'Editando serviÃ§o';
  const title = document.querySelector('#view-registro .section-title');
  if (title) title.textContent = 'Editar serviÃ§o';
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

// Garante que estado de ediÃ§Ã£o nÃ£o persista entre sessoes do app.
// pagehide cobre tanto fechamento de aba quanto navegacao pra outro
// site (mais robusto que beforeunload em mobile / Safari).
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    try {
      sessionStorage.removeItem(EDITING_KEY);
    } catch (_err) {
      /* sessionStorage indisponivel â€” ignora */
    }
  });
}
