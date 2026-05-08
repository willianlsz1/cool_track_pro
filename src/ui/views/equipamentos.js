/**
 * CoolTrack Pro - Equipamentos View v5.0
 * Funções: renderEquip, saveEquip, viewEquip, deleteEquip, populateEquipSelects
 */

import { Utils } from '../../core/utils.js';
import { getState, findEquip, setState, regsForEquip, findSetor } from '../../core/state.js';
import { Storage } from '../../core/storage.js';
import { Toast } from '../../core/toast.js';
import { OnboardingBanner } from '../components/onboarding.js';
import { withSkeleton } from '../components/skeleton.js';
import { Profile } from '../../features/profile.js';
import { updateGlobalHeader } from '../composables/header.js';
import { ErrorCodes, handleError } from '../../core/errors.js';
import { checkPlanLimit } from '../../core/planLimits.js';
import { currentRoute, goTo } from '../../core/router.js';
import { trackEvent } from '../../core/telemetry.js';
import {
  getHealthClass,
  evaluateEquipmentHealth,
  evaluateEquipmentRisk,
  getSuggestedPreventiveDays,
  normalizePeriodicidadePreventivaDias,
} from '../../domain/maintenance.js';
import { getPreventivaDueEquipmentIds } from '../../domain/alerts.js';
import { formatDadosPlacaRows } from '../../domain/dadosPlacaDisplay.js';
import { DadosPlacaValidationError, formatDecimalHint } from '../../domain/dadosPlacaValidation.js';
import { emptyStateHtml } from '../components/emptyState.js';
import { buildEquipamentosViewModel } from '../viewModels/equipamentosViewModel.js';
import { buildEquipamentosHeaderViewModel } from '../viewModels/equipamentosHeaderModel.js';
import { validateEquipamentoPayload } from '../../core/inputValidation.js';
import { EquipmentPhotos } from '../components/equipmentPhotos.js';
import { resetCamposExtrasState, setCamposExtrasState } from '../components/nameplateCapture.js';
import { Photos } from '../components/photos.js';
import { getEquipmentVisualMeta } from '../components/equipmentVisual.js';
import { normalizePhotoList } from '../../core/photoStorage.js';
import { isCachedPlanPlusOrHigher, isCachedPlanPro } from '../../core/plans/planCache.js';
import { SETOR_NOME_MAX } from '../../core/setorRules.js';
import {
  configureEquipContextState,
  getActiveQuickFilter,
  getRouteEquipCtx as _getRouteEquipCtx,
  navigateEquipCtx as _navigateEquipCtx,
  resolveEquipCtx as _resolveEquipCtx,
} from './equipamentos/contextState.js';
import {
  _createEquipRenderEvalContext,
  _resolveIdleClusterCollapsed,
} from './equipamentos/equipmentCards.js';
import { configureEquipPhotos, syncContextGroupVisibility } from './equipamentos/fotos.js';
import {
  DADOS_PLACA_INPUT_IDS,
  collectDadosPlaca,
  resetNameplateMetadata,
  setNameplateMetadata,
  restoreDadosPlaca,
} from './equipamentos/placaData.js';
import { setorCardHtml } from './equipamentos/setores.js';
import { bindEquipCardImageFallbacks as _bindEquipCardImageFallbacks } from './equipamentos/cardIconFallbacks.js';
import {
  EDIT_FOCUS_ESSENCIAIS,
  EDIT_FOCUS_ETIQUETA_MORE,
  EDIT_FOCUS_FIELD_MAP,
  SETOR_DESC_LIMIT,
  SETOR_PALETTE,
  TIPOS_COM_COMPONENTE,
} from './equipamentos/setorConstants.js';
import {
  findPaletteEntry,
  getSetorNomeValidation,
  setorContrastWithWhite,
} from './equipamentos/setorHelpers.js';
import {
  _stripRenderInternalOptions,
  buildReactListViewModel,
} from '../../features/equipamentos/utils/viewModels.js';
import {
  _eqDetailSubtitle,
  _infoRowValueOrEmpty,
  _riskFactorChipHtml,
} from '../../features/equipamentos/utils/detail.js';
import {
  getEditingEquipId,
  getEditingSetorId,
  getForcedEquipContext,
  setEditingEquipId,
  setEditingSetorId,
  setForcedEquipContext,
} from '../../features/equipamentos/state/editingState.js';
import {
  incrementRenderEquipPlanToken,
  getRenderEquipPlanNeedsRefresh,
} from '../../features/equipamentos/state/renderPlanState.js';
import {
  bindRenderEquipPlanInvalidationEvents,
  configureRenderEquipPlan,
  refreshRenderEquipPlan,
} from '../../features/equipamentos/bridges/renderPlan.js';
import {
  mountEquipamentosHeader as mountEquipamentosHeaderBridge,
  unmountEquipamentosHeader,
} from '../../features/equipamentos/bridges/headerBridge.js';
import {
  mountEquipamentosList,
  unmountEquipamentosList,
} from '../../features/equipamentos/bridges/listBridge.js';
import {
  configureSetorUI,
  renderSetorGrid,
  renderSetorGridForCliente,
} from '../../features/equipamentos/setor/setorUI.js';
import {
  configureSetorNavigation,
  setActiveSector,
} from '../../features/equipamentos/setor/setorNavigation.js';
import {
  assignEquipToSetor,
  configureSetorPersist,
  deleteSetor,
  ensureProForSetores,
  moveEquipsToSetor,
  saveSetor,
} from '../../features/equipamentos/setor/setorPersist.js';
import {
  checkSaveEquipPlanLimit,
  validateSaveEquipPayload,
} from '../../features/equipamentos/crud/validate.js';
import {
  buildSaveEquipPayload,
  collectSaveEquipBaseFormValues,
  collectSaveEquipContextFormValues,
  collectSaveEquipExtraFormValues,
} from '../../features/equipamentos/crud/payload.js';
import {
  applySaveEquipToState,
  createSaveEquipInState,
  updateSaveEquipInState,
} from '../../features/equipamentos/crud/persist.js';
import { collectSaveEquipDadosPlaca } from '../../features/equipamentos/nameplate/dadosPlaca.js';
import { finishSaveEquipSuccess } from '../../features/equipamentos/crud/postSave.js';
import { runSaveEquipPostActions } from '../../features/equipamentos/crud/postActions.js';
import { configureSaveEquip, saveEquip } from '../../features/equipamentos/crud/saveEquip.js';

configureEquipContextState({ renderEquip });
configureEquipPhotos({ viewEquip });
configureRenderEquipPlan({ renderEquip });
configureSetorUI({
  Utils,
  emptyStateHtml,
  getState,
  setorCardHtml,
  setToolbar: _setToolbar,
  unmountEquipamentosList,
});
configureSetorNavigation({
  getRouteEquipCtx: _getRouteEquipCtx,
  navigateEquipCtx: _navigateEquipCtx,
});
configureSaveEquip({
  getSaveEquipPostActionContext: _getSaveEquipPostActionContext,
  getState,
  getEditingEquipId,
  checkSaveEquipPlanLimit,
  checkPlanLimit,
  trackEvent,
  Toast,
  goTo,
  collectSaveEquipBaseFormValues,
  getValue: Utils.getVal,
  validateSaveEquipPayload,
  validateEquipamentoPayload,
  collectSaveEquipContextFormValues,
  getForcedEquipContext,
  normalizePeriodicidadePreventivaDias,
  collectSaveEquipExtraFormValues,
  collectSaveEquipDadosPlaca,
  collectDadosPlaca,
  DadosPlacaValidationError,
  formatDecimalHint,
  buildSaveEquipPayload,
  createId: Utils.uid,
  findEquip,
  normalizePhotoList,
  tiposComComponente: TIPOS_COM_COMPONENTE,
  applySaveEquipToState,
  setState,
  updateSaveEquipInState,
  createSaveEquipInState,
  finishSaveEquipSuccess,
  closeSaveEquipModal: _closeSaveEquipModal,
  resetSaveEquipForm: _resetSaveEquipForm,
  refreshSaveEquipViews: _refreshSaveEquipViews,
  toastSuccess: Toast.success,
  runSaveEquipPostActions,
  focusNameInput: () => Utils.getEl('eq-nome')?.focus(),
  requestAnimationFrameRef: (callback) => requestAnimationFrame(callback),
  documentRef: globalThis.document,
});
configureSetorPersist({
  findEquip,
  findSetor,
  setState,
  Storage,
  Toast,
  renderEquip,
  escapeHtml: Utils.escapeHtml,
  Utils,
  getSetorNomeValidation,
  setSetorNomeValidationState: _setSetorNomeValidationState,
  getEditingSetorId,
  clearSetorEditingState,
  getRouteEquipCtx: _getRouteEquipCtx,
  navigateEquipCtx: _navigateEquipCtx,
  setorNomeMax: SETOR_NOME_MAX,
  setorDescLimit: SETOR_DESC_LIMIT,
  defaultSetorColor: SETOR_PALETTE[0].hex,
});

export { equipCardHtml } from './equipamentos/equipmentCards.js';
export { getActiveQuickFilter, saveEquip, setActiveSector };
export { assignEquipToSetor, deleteSetor, ensureProForSetores, moveEquipsToSetor, saveSetor };
export { getEditingEquipId, getEditingSetorId };
export { unmountEquipamentosHeader, unmountEquipamentosList };
export { setorCardHtml } from './equipamentos/setores.js';
export { setorContrastWithWhite };
export {
  applyEquipPhotosEditorGate,
  applyEquipPhotosGate,
  clearEquipPhotosEditingState,
  getEditingPhotosEquipId,
  openEquipPhotosEditor,
  saveEquipPhotos,
} from './equipamentos/fotos.js';

// ── Tipos de climatização que tem componente (evap/cond/única) ────────────
// Lista de tipos onde o select de "componente" aparece no modal. Outros tipos
// (Geladeira, Freezer, etc) não tem split, entao o campo fica oculto.
/**
 * Mostra/esconde o select de componente baseado no tipo selecionado.
 * Idempotente — pode ser chamado a qualquer momento (open modal, change tipo,
 * edit equip).
 */
/** @sliceTarget ui/componente */
export function syncComponenteVisibility() {
  const tipo = Utils.getVal('eq-tipo');
  const wrapper = Utils.getEl('eq-componente-wrapper');
  if (!wrapper) return;
  if (TIPOS_COM_COMPONENTE.has(tipo)) {
    wrapper.style.display = '';
  } else {
    wrapper.style.display = 'none';
    // Limpa o valor pra não salvar componente em equipamento que não usa
    Utils.setVal('eq-componente', '');
  }
}

// _stripRenderInternalOptions extraído pra
// src/features/equipamentos/utils/viewModels.js (Mudança 11 / CP-B).

/** @sliceTarget ui/actionButtons */
function setEquipActionButtonVisible(button, visible) {
  if (!button) return;
  const display = visible ? '' : 'none';
  button.style.display = display;
  const row = button.closest?.('.action-tray__row');
  if (row) row.style.display = display;
}

/** @sliceTarget ui/actionButtons */
function setEquipActionFooterHintVisible(visible) {
  const hint = document.getElementById('eq-action-footer-hint');
  if (hint) hint.hidden = !visible;
}

/** @sliceTarget ui/svg */
function createActionTrayPlusIcon() {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('class', 'action-tray__icon');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M12 5v14M5 12h14');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  icon.append(path);

  return icon;
}

/** @sliceTarget ui/actionButtons */
function setEquipActionTrayButtonLabel(button, label, { plusIcon = false } = {}) {
  if (!button) return;
  button.replaceChildren();
  if (plusIcon) button.append(createActionTrayPlusIcon());
  button.append(document.createTextNode(label));
}
/**
 * @sliceSplit
 *   ui/modal: reset visual do modal-add-eq (titulos, botoes, photos)
 *   crud/clear: reset de editing state + nameplate metadata + forced context
 */
export function clearEditingState() {
  setEditingEquipId(null);
  const titleEl = Utils.getEl('modal-add-eq-title');
  if (titleEl) titleEl.textContent = 'Qual equipamento você quer monitorar?';
  const saveBtn = document.getElementById('eq-save-primary');
  if (saveBtn) saveBtn.textContent = 'Cadastrar equipamento';
  const primaryBtn = document.getElementById('eq-save-primary');
  const secondaryBtn = document.getElementById('eq-save-secondary');
  const tertiaryRow = document.getElementById('eq-save-tertiary-row');
  const tertiaryBtn = document.getElementById('eq-save-tertiary');
  if (primaryBtn) {
    primaryBtn.textContent = 'Cadastrar equipamento';
    primaryBtn.dataset.postAction = '';
  }
  setEquipActionButtonVisible(secondaryBtn, false);
  setEquipActionButtonVisible(tertiaryBtn || tertiaryRow, false);
  if (tertiaryBtn) {
    setEquipActionTrayButtonLabel(tertiaryBtn, '');
  }
  setEquipActionFooterHintVisible(false);
  const detailsPanel = Utils.getEl('eq-step-2');
  if (detailsPanel) {
    detailsPanel.style.display = '';
    detailsPanel.setAttribute('aria-hidden', 'true');
  }
  // Reset das fotos do equipamento (se o componente estiver montado)
  try {
    EquipmentPhotos.clear();
  } catch (_err) {
    /* componente pode ainda não estar inicializado */
  }
  // Reset dos extras + metadata da nameplate pra próximo cadastro começar limpo.
  try {
    resetCamposExtrasState();
  } catch (_e) {
    /* review UI ainda não renderizada */
  }
  resetNameplateMetadata();
  clearForcedEquipContext();
}

/**
 * @sliceSplit
 *   ui/modal: render plan-aware (Free/Plus/Pro) com labels, subheads e CTAs
 *   setor/context: leitura de forced context + lock UI dos triggers
 */
export function applyEquipModalExperience({ triggerEl = null } = {}) {
  const titleEl = Utils.getEl('modal-add-eq-title');
  const subtitleEl = Utils.getEl('modal-add-eq-subtitle');
  const summaryEl = Utils.getEl('eq-context-summary-banner');
  const primaryBtn = Utils.getEl('eq-save-primary');
  const secondaryBtn = Utils.getEl('eq-save-secondary');
  const tertiaryRow = Utils.getEl('eq-save-tertiary-row');
  const tertiaryBtn = Utils.getEl('eq-save-tertiary');
  const contextGroup = Utils.getEl('eq-context-group');
  const operationSubhead = document.querySelector('.eq-details-subhead__label');
  const isPro = isCachedPlanPro();
  const triggerSetorId = triggerEl?.dataset?.setorId || '';
  const triggerClienteId = triggerEl?.dataset?.clienteId || '';
  const routeCtx = _getRouteEquipCtx();
  const lockedClienteId =
    getForcedEquipContext()?.clienteId || triggerClienteId || routeCtx.clienteId || '';
  const lockedSetorId =
    getForcedEquipContext()?.setorId || triggerSetorId || routeCtx.sectorId || '';
  const hasLockedCtx = Boolean(lockedClienteId || lockedSetorId);
  const isGlobalEquipRoute = isPro && currentRoute() === 'equipamentos' && !hasLockedCtx;

  if (titleEl) titleEl.textContent = 'Qual equipamento você quer monitorar?';
  if (summaryEl) {
    summaryEl.style.display = 'none';
    summaryEl.innerHTML = '';
  }
  if (operationSubhead) {
    operationSubhead.textContent = isPro ? 'Organização do parque' : 'Operação';
  }
  if (contextGroup) {
    contextGroup.dataset.proGlobal = isGlobalEquipRoute ? '1' : '0';
  }
  if (!primaryBtn || !secondaryBtn || !tertiaryRow || !tertiaryBtn) return;

  setEquipActionButtonVisible(secondaryBtn, true);
  setEquipActionButtonVisible(tertiaryBtn || tertiaryRow, true);

  if (!isPro) {
    if (subtitleEl) {
      subtitleEl.innerHTML = 'Cadastre rápido o equipamento do atendimento.';
    }
    primaryBtn.textContent = 'Cadastrar equipamento';
    primaryBtn.dataset.postAction = '';
    secondaryBtn.textContent = 'Cadastrar e registrar serviço';
    secondaryBtn.dataset.postAction = 'register';
    setEquipActionTrayButtonLabel(tertiaryBtn, 'Cadastrar outro parecido', { plusIcon: true });
    tertiaryBtn.dataset.postAction = 'clone';
    setEquipActionFooterHintVisible(false);
    return;
  }

  if (subtitleEl) {
    subtitleEl.innerHTML =
      'Organize o parque do cliente por setor e mantenha PMOC/relatórios consistentes.';
  }

  if (hasLockedCtx) {
    const clienteNome =
      getForcedEquipContext()?.clienteNome ||
      triggerEl?.dataset?.clienteNome ||
      document.querySelector('#eq-cliente option:checked')?.textContent ||
      'Cliente selecionado';
    const setorNome =
      getForcedEquipContext()?.setorNome ||
      document.querySelector('#eq-setor option:checked')?.textContent ||
      'Setor selecionado';
    if (summaryEl) {
      summaryEl.style.display = '';
      summaryEl.innerHTML = `Cliente: <b>${Utils.escapeHtml(clienteNome)}</b> · Setor: <b>${Utils.escapeHtml(setorNome)}</b> · <button type="button" class="btn btn--ghost btn--sm" data-action="equip-unlock-context">Alterar contexto</button>`;
    }
    primaryBtn.textContent = 'Salvar no setor';
    primaryBtn.dataset.postAction = '';
    secondaryBtn.textContent = 'Cadastrar outro neste setor';
    secondaryBtn.dataset.postAction = 'clone';
    setEquipActionTrayButtonLabel(tertiaryBtn, 'Salvar e abrir PMOC');
    tertiaryBtn.dataset.postAction = 'pmoc';
    setEquipActionFooterHintVisible(false);
    return;
  }

  if (summaryEl) {
    summaryEl.style.display = '';
    summaryEl.textContent =
      'Visão global do parque: vincule cliente/setor agora ou salve sem cliente por enquanto.';
  }
  primaryBtn.textContent = 'Vincular a cliente/setor';
  primaryBtn.dataset.postAction = '';
  secondaryBtn.textContent = 'Salvar sem cliente por enquanto';
  secondaryBtn.dataset.postAction = 'save-without-client';
  setEquipActionTrayButtonLabel(tertiaryBtn, 'Cadastrar outro', { plusIcon: true });
  tertiaryBtn.dataset.postAction = 'clone';
  setEquipActionFooterHintVisible(true);
}

/** @sliceTarget setor/context */
export function clearForcedEquipContext() {
  setForcedEquipContext(null);
  const setorTrigger = document.getElementById('eq-setor-trigger');
  const clienteTrigger = document.getElementById('eq-cliente-trigger');
  const createClienteBtn = document.querySelector(
    '#eq-cliente-wrapper .eq-context-card__create-link',
  );
  const lockedSummary = document.getElementById('eq-context-locked-summary');
  if (setorTrigger) setorTrigger.disabled = false;
  if (clienteTrigger) clienteTrigger.disabled = false;
  if (createClienteBtn) createClienteBtn.style.display = '';
  if (lockedSummary) {
    lockedSummary.style.display = 'none';
    lockedSummary.textContent = '';
  }
}

/** @sliceTarget setor/context */
export function lockEquipContext({
  clienteId = null,
  clienteNome = '',
  setorId = null,
  setorNome = '',
} = {}) {
  setForcedEquipContext(
    clienteId || setorId
      ? {
          clienteId: clienteId || null,
          clienteNome: clienteNome || '',
          setorId: setorId || null,
          setorNome: setorNome || '',
        }
      : null,
  );

  const setorTrigger = document.getElementById('eq-setor-trigger');
  const clienteTrigger = document.getElementById('eq-cliente-trigger');
  const createClienteBtn = document.querySelector(
    '#eq-cliente-wrapper .eq-context-card__create-link',
  );
  const lockedSummary = document.getElementById('eq-context-locked-summary');

  if (!getForcedEquipContext()) {
    clearForcedEquipContext();
    return;
  }

  if (getForcedEquipContext().clienteId) {
    Utils.setVal('eq-cliente', getForcedEquipContext().clienteId);
    document.getElementById('eq-cliente')?.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (getForcedEquipContext().setorId) {
    Utils.setVal('eq-setor', getForcedEquipContext().setorId);
    document.getElementById('eq-setor')?.dispatchEvent(new Event('change', { bubbles: true }));
  }

  if (setorTrigger && getForcedEquipContext().setorId) setorTrigger.disabled = true;
  if (clienteTrigger && getForcedEquipContext().clienteId) clienteTrigger.disabled = true;
  if (createClienteBtn && getForcedEquipContext().clienteId)
    createClienteBtn.style.display = 'none';
  if (lockedSummary) {
    const cliente = getForcedEquipContext().clienteNome || 'Cliente definido no contexto';
    const setor = getForcedEquipContext().setorNome || 'Setor definido no contexto';
    lockedSummary.style.display = '';
    lockedSummary.textContent = `Contexto travado: Cliente ${cliente} / Setor ${setor}.`;
  }
}

/**
 * Renderiza o "bloco do ícone" do card de equipamento:
 * - Se houver foto (feature Plus+/Pro), mostra a primeira como thumbnail.
 * - Caso contrário, cai no ícone do tipo (emoji legado).
 *
 * A url cacheada na referência de foto tem TTL ~24h. Se estiver expirada,
 * o navegador mostra a img quebrada; uma chamada ao `loadFromSupabase`
 * refaz signed URLs. Fallback explícito para o ícone via `onerror`.
 */
/**
 * Badge de tendência de risco (últimos 30 dias).
 * Feedback imediato do efeito das manutenções recentes sobre o score.
 * · stable    → não renderiza (reduz ruído, V3 alinhado)
 * · improving → "↓ N" (risco caiu N pontos)
 * · worsening → "↑ N" (risco subiu N pontos)
 *
 * Decisão de design V3: badge "estável" foi removido porque não carrega
 * informação nova (o tone-pill já comunica o estado atual). Mantemos só
 * os sinais de mudança (improving/worsening), que são actionable.
 */
// Equipment card rendering lives in ./equipamentos/equipmentCards.js.

// Setor card rendering lives in ./equipamentos/setores.js.

/** @sliceTarget controller/navigation */
export function setActiveQuickFilter(id) {
  const quickFilter = id && id !== 'todos' ? id : null;
  const currentCtx = _getRouteEquipCtx();
  _navigateEquipCtx({
    sectorId: quickFilter ? null : currentCtx.sectorId,
    quickFilter,
  });
}

/** Computa os 4 KPIs do hero a partir do state atual.
 *  · semSetor: equipamentos sem setorId (órfãos)
 *  · emAtencao: priority >= ALTA (urgente + alta) + status warn
 *  · criticos: status danger
 *  · preventiva30d: preventivas vencendo em até 30 dias (ou já vencidas)
 *
 * Blindagem: cada equip é avaliado em try/catch — falha em 1 não derruba o hero.
 */
// Hero, KPIs e filtros de quick-action foram extraídos pra reduzir
// o tamanho desse arquivo (audit §1.1, step 1 da quebra incremental).
// Import local pra uso interno + re-export pra preservar imports externos.
import { computeEquipKpis, renderEquipHero, renderEquipFilters } from './equipamentos/hero.js';
export { computeEquipKpis, renderEquipHero, renderEquipFilters };

/** Atualiza a toolbar da view de equipamentos.
 *  hideDefaultCta=true suprime o "+ Novo equipamento" default (usado em
 *  contexto cliente, onde adicionar equipamento é feito via drill-down
 *  de setor — não via toolbar global). */
/** @sliceTarget ui/toolbar */
function _setToolbar({ title, extraBtn, hideDefaultCta = false } = {}) {
  const titleEl = Utils.getEl('equip-page-title');
  const subtitleEl = Utils.getEl('equip-page-subtitle');
  const actionsEl = Utils.getEl('equip-toolbar-actions');
  if (titleEl) titleEl.textContent = title || 'Equipamentos';
  if (subtitleEl) subtitleEl.textContent = '';
  if (actionsEl) {
    // CTA único "+ Novo equipamento". Antes eram 2 botões ("Cadastrar com
    // foto" primário + "Novo equipamento" outline), o que duplicava a ação
    // na toolbar — ambos abriam o mesmo modal-add-eq.
    const defaultCta = hideDefaultCta
      ? ''
      : `<button class="btn btn--primary btn--sm"
          data-action="open-modal" data-id="modal-add-eq"
          data-source="toolbar_primary"
          data-testid="equipamentos-add-equipment"
          aria-label="Cadastrar novo equipamento (manual ou via foto da etiqueta)">+ Novo equipamento</button>`;
    actionsEl.innerHTML = `
      ${extraBtn || ''}
      ${defaultCta}
    `;
  }
}

/** @sliceTarget controller/mount */
function mountEquipamentosHeader(viewModel) {
  return mountEquipamentosHeaderBridge({
    viewModel,
    root: Utils.getEl('equip-hero'),
    filtersRoot: Utils.getEl('equip-filters'),
    contextRoot: Utils.getEl('equip-context-chip'),
  });
}

/** Popula o select de setores no modal de cadastro de equipamento. */
/** @sliceTarget ui/form */
export function populateSetorSelect(isPro = false) {
  const wrapper = Utils.getEl('eq-setor-wrapper');
  const select = Utils.getEl('eq-setor');
  if (!wrapper || !select) {
    syncContextGroupVisibility();
    return;
  }

  if (!isPro) {
    wrapper.style.display = 'none';
    syncContextGroupVisibility();
    return;
  }

  const { setores } = getState();
  if (!setores.length) {
    wrapper.style.display = 'none';
    syncContextGroupVisibility();
    return;
  }

  wrapper.style.display = '';
  select.innerHTML = '<option value="">Sem setor</option>';
  setores.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.nome;
    select.appendChild(opt);
  });
  syncContextGroupVisibility();
}

// Setor UI/state leve extraído para ../../features/equipamentos/setor/ (Mudança 11 / CP-E).

// EQUIP_TONE_LABELS, buildEquipamentoListCardModel, buildReactListEmptyState,
// buildReactListViewModel extraídos pra
// src/features/equipamentos/utils/viewModels.js (Mudança 11 / CP-B).

/** Renderiza a lista flat de equipamentos (FREE ou drill-down de um setor). */
/**
 * @sliceSplit
 *   ui/list: build do reactViewModel + render skeleton + mount React
 *   controller/render: orquestra fetch state, viewModel build, generation counter
 */
function renderFlatList(filtro = '', options = {}, setorId = null) {
  const { equipamentos, registros, clientes, setores } = getState();
  const evalCtx = _createEquipRenderEvalContext();

  // Filtro por cliente vindo da view /clientes ("Ver equipamentos"). Se
  // setado em options.clienteId, restringe a lista a equipamentos vinculados.
  const filterClienteId = options.clienteId || null;
  const viewModel = buildEquipamentosViewModel({
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

  const el = Utils.getEl('lista-equip');
  if (!el) return;

  // PR4 §12.3 · Particiona idle vs ativo pra decidir sobre idle-cluster.
  //  · Cluster coleta idles quando ≥5 (histerese solta ≤2).
  //  · Posição: cluster sempre acima dos cards ativos — mas só se houver
  //    ao menos 1 card ativo pra contrastar. Em lista só-de-idle o cluster
  //    perde valor (nada pra "esconder") e volta a render linear.
  const idleList = viewModel.idleItems;
  const activeList = viewModel.activeItems;
  const clusterActive =
    _resolveIdleClusterCollapsed(idleList.length) && idleList.length > 0 && activeList.length > 0;
  const reactViewModel = buildReactListViewModel(viewModel, {
    evalCtx,
    clusterActive,
    filterClienteId,
    isPro: isCachedPlanPro(),
  });

  return withSkeleton(
    el,
    { enabled: true, variant: 'equipment', count: viewModel.skeletonCount },
    () =>
      mountEquipamentosList({
        root: el,
        viewModel: reactViewModel,
        onMounted: () => _bindEquipCardImageFallbacks(el),
      }),
  );
}

/**
 * @sliceSplit
 *   controller/render: entrypoint principal, route resolution, plan refresh, gate logic
 *   ui/hero: subtitle + searchBar visibility + toolbar + header mount
 *   ui/list: chamadas a renderFlatList/renderSetorGrid em cada branch
 * @sliceObs god-function central — alvo prioritario de pre-split em CP-G
 */
export async function renderEquip(filtro = '', options = {}) {
  bindRenderEquipPlanInvalidationEvents();
  const renderToken = incrementRenderEquipPlanToken();
  const renderOptions = _stripRenderInternalOptions(options);
  const equipCtx = _resolveEquipCtx(renderOptions);
  const activeSectorId = equipCtx.sectorId;
  const activeQuickFilter = equipCtx.quickFilter;
  const activeClienteId = equipCtx.clienteId;
  const activeClienteNome = equipCtx.clienteNome;
  // Spread opcional pra propagar o filtro de cliente nas renderFlatList calls.
  const renderOptionsWithClient = activeClienteId
    ? { ...renderOptions, clienteId: activeClienteId, clienteNome: activeClienteNome }
    : renderOptions;

  // Renderiza imediatamente com snapshot local do plano (não bloqueia a tela).
  // O refresh assíncrono corrige drift e evita fetch repetido em cada render.
  const isPro = isCachedPlanPro();
  const subtitleEl = Utils.getEl('equip-page-subtitle');
  if (subtitleEl) {
    subtitleEl.textContent = isPro
      ? 'Ação rápida em todos os clientes e setores.'
      : 'Acompanhe seus equipamentos e registre serviços rápido.';
  }
  populateSetorSelect(isPro);
  if (!options?.__skipPlanRefresh && getRenderEquipPlanNeedsRefresh()) {
    refreshRenderEquipPlan({
      filtro,
      options: renderOptions,
      renderToken,
      isProAtRender: isPro,
    });
  }

  const headerState = getState();
  const headerRegistros = Array.isArray(headerState.registros) ? headerState.registros : [];
  const headerPreventivaVencidaIds = getPreventivaDueEquipmentIds(headerRegistros, 0);
  const headerRender = mountEquipamentosHeader({
    ...buildEquipamentosHeaderViewModel({
      equipamentos: headerState.equipamentos,
      activeQuickFilter,
      activeClienteId,
      activeClienteNome: activeClienteNome || '',
      activeSectorId,
      kpis: computeEquipKpis(headerState),
      preventivaVencidaIds: headerPreventivaVencidaIds,
    }),
  });

  // Quick filter ativo sobrescreve o fluxo normal: vai pra flat list com
  // statusFilter correspondente. Sempre rende com a toolbar "← Todos" pra dar
  // caminho de volta claro.
  if (activeQuickFilter) {
    const searchBar = Utils.getEl('equip-search-bar');
    if (searchBar) searchBar.style.display = '';
    const titleMap = {
      'sem-setor': 'Sem setor',
      'em-atencao': 'Em atenção',
      criticos: 'Críticos',
      'preventiva-vencida': 'Preventiva vencida',
    };
    _setToolbar({
      title: titleMap[activeQuickFilter] || 'Equipamentos',
      extraBtn: `<button class="btn btn--outline btn--sm" data-action="equip-quickfilter" data-id="todos">← Todos</button>`,
    });

    if (activeQuickFilter === 'sem-setor') {
      const listRender = renderFlatList(filtro, renderOptionsWithClient, '__sem_setor__');
      return Promise.all([headerRender, listRender]).then(([, result]) => result);
    }
    const listRender = renderFlatList(
      filtro,
      { ...renderOptionsWithClient, statusFilter: activeQuickFilter },
      null,
    );
    return Promise.all([headerRender, listRender]).then(([, result]) => result);
  }

  const searchBar = Utils.getEl('equip-search-bar');

  if (isPro && activeSectorId === null && searchBar) searchBar.style.display = '';

  // Vista Pro padrão: grade de setores (global ou filtrada por cliente).
  // Regressão pós-revert: esse branch tinha se perdido e caía sempre na lista
  // flat, ocultando a feature de Setores (cards, Novo setor, Ver/Editar).
  if (isPro && activeSectorId === null) {
    if (activeClienteId) {
      const setorial = Promise.resolve(
        renderSetorGridForCliente(activeClienteId, activeClienteNome),
      );
      return Promise.all([headerRender, setorial]).then(([, result]) => result);
    }
    const setorial = Promise.resolve(renderSetorGrid());
    return Promise.all([headerRender, setorial]).then(([, result]) => result);
  }

  // Vista lista (FREE ou drill-down de setor)
  if (searchBar) searchBar.style.display = '';

  if (activeSectorId) {
    // Drill-down: mostra equipamentos do setor
    const setor =
      activeSectorId === '__sem_setor__' ? { nome: 'Sem setor' } : findSetor(activeSectorId);
    const nome = setor?.nome ?? 'Setor';
    // Contexto cliente: titulo "Setor X · Cliente Y" e back vai pra grid do cliente
    const titlePrefix = activeClienteNome
      ? `${Utils.truncate(nome, 22)} - ${Utils.truncate(activeClienteNome, 18)}`
      : Utils.truncate(nome, 28);
    const backLabel = activeClienteNome ? '<- Setores do cliente' : '<- Setores';
    // Bug fix #103: "+ Novo equipamento" precisa carregar o contexto atual.
    // Sem isso, user navega Cliente -> Setor -> + Novo equipamento e o form
    // abre vazio, perdendo a hierarquia que ele acabou de percorrer.
    // data-setor-id + data-cliente-id sao lidos pelo handler open-modal pra
    // pre-preencher os dropdowns Setor e Cliente no modal-add-eq.
    const novoEquipBtn =
      activeSectorId !== '__sem_setor__'
        ? `<button class="btn btn--primary btn--sm"
              data-action="open-modal" data-id="modal-add-eq"
              data-setor-id="${Utils.escapeAttr(activeSectorId)}"
              ${activeClienteId ? `data-cliente-id="${Utils.escapeAttr(activeClienteId)}"` : ''}
              data-source="setor_drill">+ Novo equipamento</button>`
        : '';
    _setToolbar({
      title: titlePrefix,
      extraBtn: `${novoEquipBtn}<button class="btn btn--outline btn--sm" data-action="back-to-setores">${backLabel}</button>`,
      hideDefaultCta: true,
    });
  } else {
    // Vista FREE/Plus: toolbar SEM "+ Novo setor". Setores depende de
    // Clientes (Pro-only) — sem clientes cadastrados, o botão vira ruído.
    // O upgrade aparece naturalmente no hero/empty state quando o user
    // já tem 5+ equipamentos sem setor (ver hero.js).
    _setToolbar({
      title: 'Equipamentos',
    });
  }

  // O filtro de cliente já foi tratado mais cedo via early-return — aqui
  // segue o flow normal de drill-down em setor ou lista flat default.
  const listRender = renderFlatList(filtro, renderOptionsWithClient, activeSectorId);
  return Promise.all([headerRender, listRender]).then(([, result]) => result);
}

// ── Setor modal: paleta curada, live preview, validation ─────────────────
//
// Paleta de 10 cores (expandida de 6) pra dar mais identidade visual aos
// setores sem virar arco-íris. Default = --primary (#00c8e8, Ciano).
/** @sliceTarget ui/modal */
function _setSaveBtnLabel(text) {
  const btn = Utils.getEl('setor-save-btn');
  if (!btn) return;
  const label = btn.querySelector('.setor-modal__btn-label');
  if (label) label.textContent = text;
}

/** @sliceTarget ui/validation */
function _setSetorNomeValidationState({ showError, focus = false, markTouched = false } = {}) {
  const err = Utils.getEl('setor-nome-err');
  const nomeInput = Utils.getEl('setor-nome');
  if (err) err.hidden = !showError;
  if (nomeInput) {
    if (markTouched) nomeInput.dataset.touched = '1';
    nomeInput.setAttribute('aria-invalid', showError ? 'true' : 'false');
    if (focus) nomeInput.focus();
  }
}

/** @sliceTarget ui/validation */
function _syncSetorSaveButtonState() {
  const saveBtn = Utils.getEl('setor-save-btn');
  if (!saveBtn) return;
  const { isValid } = getSetorNomeValidation(Utils.getVal('setor-nome') || '');
  saveBtn.disabled = !isValid;
  saveBtn.setAttribute('aria-disabled', isValid ? 'false' : 'true');
}

/** Reseta todo o form do modal e volta pra modo "criar". */
/** @sliceTarget ui/modal */
export function clearSetorEditingState() {
  setEditingSetorId(null);
  const titleEl = Utils.getEl('modal-add-setor-title');
  if (titleEl) titleEl.textContent = 'Novo setor';
  _setSaveBtnLabel('Criar setor →');

  // Limpa os 4 campos do form
  Utils.setVal('setor-nome', '');
  Utils.setVal('setor-descricao', '');
  Utils.setVal('setor-responsavel', '');
  const hiddenInput = Utils.getEl('setor-cor');
  if (hiddenInput) hiddenInput.value = SETOR_PALETTE[0].hex;
  // Reseta clienteId hidden + esconde o badge de contexto
  const clienteHidden = Utils.getEl('setor-cliente-id');
  if (clienteHidden) clienteHidden.value = '';
  const clienteBadge = Utils.getEl('setor-cliente-badge');
  if (clienteBadge) clienteBadge.hidden = true;

  // Reseta picker pra primeira cor
  const picker = Utils.getEl('setor-color-picker');
  if (picker) {
    picker.querySelectorAll('.setor-modal__swatch').forEach((btn) => {
      const cell = btn.closest('.setor-modal__swatch-cell');
      const isFirst = btn.dataset.cor === SETOR_PALETTE[0].hex;
      btn.classList.toggle('setor-modal__swatch--selected', isFirst);
      btn.setAttribute('aria-checked', isFirst ? 'true' : 'false');
      if (cell) cell.classList.toggle('setor-modal__swatch-cell--selected', isFirst);
    });
  }

  // Esconde erro inline
  _setSetorNomeValidationState({ showError: false });
  const nomeInput = Utils.getEl('setor-nome');
  if (nomeInput) {
    delete nomeInput.dataset.touched;
    delete nomeInput.dataset.interacted;
  }

  _syncSetorModalPreview();
  _syncSetorModalCounters();
  _syncSetorSaveButtonState();
}

/** @sliceTarget ui/modal */
export function openEditSetor(id) {
  const setor = findSetor(id);
  if (!setor) {
    Toast.warning('Setor não encontrado.');
    return;
  }
  setEditingSetorId(id);

  Utils.setVal('setor-nome', setor.nome || '');
  Utils.setVal('setor-descricao', setor.descricao || '');
  Utils.setVal('setor-responsavel', setor.responsavel || '');

  const hiddenInput = Utils.getEl('setor-cor');
  const cor = setor.cor || SETOR_PALETTE[0].hex;
  if (hiddenInput) hiddenInput.value = cor;

  // Marca a cor atual no picker (ou deseleciona tudo se for cor custom)
  const picker = Utils.getEl('setor-color-picker');
  if (picker) {
    picker.querySelectorAll('.setor-modal__swatch').forEach((btn) => {
      const cell = btn.closest('.setor-modal__swatch-cell');
      const isMatch = btn.dataset.cor === cor;
      btn.classList.toggle('setor-modal__swatch--selected', isMatch);
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      if (cell) cell.classList.toggle('setor-modal__swatch-cell--selected', isMatch);
    });
  }

  const titleEl = Utils.getEl('modal-add-setor-title');
  if (titleEl) titleEl.textContent = 'Editar setor';
  _setSaveBtnLabel('Salvar alterações');

  // Esconde erro inline
  _setSetorNomeValidationState({ showError: false });
  const nomeInput = Utils.getEl('setor-nome');
  if (nomeInput) {
    delete nomeInput.dataset.touched;
    delete nomeInput.dataset.interacted;
  }

  _syncSetorModalPreview();
  _syncSetorModalCounters();
  _syncSetorSaveButtonState();

  import('../../core/modal.js').then(({ Modal: M }) => M.open('modal-add-setor'));
}

/**
 * Atualiza o card de prévia lendo o estado atual do form (nome + cor).
 * Roda síncrono e barato: altera textContent + CSS custom property.
 * Também pulsa o card por 350ms pra sinalizar troca de cor.
 */
/** @sliceTarget ui/preview */
function _syncSetorModalPreview() {
  const card = Utils.getEl('setor-modal-preview-card');
  if (!card) return;

  const nome = (Utils.getVal('setor-nome') || '').trim();
  const cor = Utils.getEl('setor-cor')?.value || SETOR_PALETTE[0].hex;
  const entry = findPaletteEntry(cor, SETOR_PALETTE);

  // Nome do card (placeholder "Novo setor" quando vazio)
  const nameEl = Utils.getEl('setor-modal-preview-name');
  if (nameEl) nameEl.textContent = nome || 'Novo setor';

  // Cor: CSS custom property no card raiz + readout do nome/hex
  card.style.setProperty('--setor-cor', cor);
  const nameReadout = Utils.getEl('setor-color-name');
  if (nameReadout) nameReadout.textContent = entry?.nome || 'Custom';
  const hexReadout = Utils.getEl('setor-color-hex');
  if (hexReadout) hexReadout.textContent = cor;

  // Contraste AA (branco sobre a cor de acento — serve só de guia visual)
  const contrastEl = Utils.getEl('setor-contrast');
  if (contrastEl) {
    const ratio = setorContrastWithWhite(cor);
    const pass = ratio >= 4.5;
    contrastEl.dataset.aa = pass ? 'pass' : 'warn';
    contrastEl.textContent = `${pass ? 'AA ✓' : 'AA ⚠'} · ${ratio.toFixed(1)}:1`;
  }

  const statusLabelEl = Utils.getEl('setor-modal-preview-status-label');
  const statusMetaEl = Utils.getEl('setor-modal-preview-status-meta');
  if (statusLabelEl) {
    statusLabelEl.textContent = nome
      ? 'Pronto para receber equipamentos'
      : 'Este setor começará vazio';
  }
  if (statusMetaEl) {
    statusMetaEl.textContent = nome
      ? 'Você poderá mover equipamentos para cá a qualquer momento'
      : 'Você poderá adicionar equipamentos depois';
  }

  // Pulso visual quando muda
  card.classList.remove('is-pulsing');
  // Force reflow to restart animation
  void card.offsetWidth;
  card.classList.add('is-pulsing');
}

/** Atualiza contadores (0/40, 0/120) + marca como over quando passa do limite. */
/** @sliceTarget ui/validation */
function _syncSetorModalCounters() {
  const nome = Utils.getVal('setor-nome') || '';
  const desc = Utils.getVal('setor-descricao') || '';
  const nomeCounter = Utils.getEl('setor-nome-counter');
  if (nomeCounter) {
    nomeCounter.textContent = `${nome.length}/${SETOR_NOME_MAX}`;
    nomeCounter.classList.toggle('setor-modal__counter--over', nome.length > SETOR_NOME_MAX);
  }
  const descCounter = Utils.getEl('setor-descricao-counter');
  if (descCounter) {
    descCounter.textContent = `${desc.length}/${SETOR_DESC_LIMIT}`;
    descCounter.classList.toggle('setor-modal__counter--over', desc.length > SETOR_DESC_LIMIT);
  }
  _syncSetorSaveButtonState();
}

/**
 * Inicializa o color picker + live preview do modal de setor. Idempotente:
 * Se já foi wirado, apenas sincroniza o preview sem rebindar listeners.
 */
/** @sliceTarget ui/colorPicker */
export function initSetorColorPicker() {
  const picker = Utils.getEl('setor-color-picker');
  const hiddenInput = Utils.getEl('setor-cor');
  if (!picker || !hiddenInput) return;

  // Bind único: marca com data attr pra não duplicar listeners em reabertura.
  if (!picker.dataset.setorModalBound) {
    picker.dataset.setorModalBound = '1';

    picker.querySelectorAll('.setor-modal__swatch').forEach((btn) => {
      btn.addEventListener('click', () => {
        picker.querySelectorAll('.setor-modal__swatch').forEach((b) => {
          const cell = b.closest('.setor-modal__swatch-cell');
          b.classList.remove('setor-modal__swatch--selected');
          b.setAttribute('aria-checked', 'false');
          if (cell) cell.classList.remove('setor-modal__swatch-cell--selected');
        });
        btn.classList.add('setor-modal__swatch--selected');
        btn.setAttribute('aria-checked', 'true');
        const cell = btn.closest('.setor-modal__swatch-cell');
        if (cell) cell.classList.add('setor-modal__swatch-cell--selected');
        hiddenInput.value = btn.dataset.cor;
        _syncSetorModalPreview();
      });
    });

    // Inputs do form → sincroniza preview + counters + gerencia erro inline
    // Regra: depois que o usuário já foi avisado uma vez (data-touched=1), o
    // erro some ao digitar e volta ao esvaziar o campo. Antes do primeiro
    // aviso o campo fica "limpo" enquanto o usuário não tenta salvar.
    const nomeInput = Utils.getEl('setor-nome');
    if (nomeInput) {
      nomeInput.addEventListener('input', () => {
        nomeInput.dataset.interacted = '1';
        const { empty, tooLong } = getSetorNomeValidation(nomeInput.value);
        const wasTouched = nomeInput.dataset.touched === '1';
        _setSetorNomeValidationState({ showError: wasTouched && (empty || tooLong) });
        _syncSetorModalPreview();
        _syncSetorModalCounters();
      });
      nomeInput.addEventListener('blur', () => {
        const { empty, tooLong } = getSetorNomeValidation(nomeInput.value);
        const wasTouched = nomeInput.dataset.touched === '1';
        const interacted = nomeInput.dataset.interacted === '1';
        if ((!empty && !tooLong) || (!wasTouched && !interacted)) return;
        _setSetorNomeValidationState({
          showError: true,
          markTouched: true,
        });
      });
    }
    const descInput = Utils.getEl('setor-descricao');
    if (descInput) descInput.addEventListener('input', _syncSetorModalCounters);
  }

  _syncSetorModalPreview();
  _syncSetorModalCounters();
  _syncSetorSaveButtonState();
}

// Nameplate data helpers live in ./equipamentos/placaData.js.

/**
 * Mapa: focusField slug → DOM id do input no modal-add-eq.
 * Centraliza pra triggers passarem só o nome lógico, sem acoplar com IDs.
 * Quando adicionar campo novo, basta estender aqui.
 */

/**
 * Lista de fieldKeys que vivem dentro de #eq-etiqueta-more (progressive
 * disclosure dos campos avançados da etiqueta). Quando o foco for em um
 * desses, o painel precisa ser aberto antes do scroll.
 */

/**
 * fieldKeys que vivem fora do accordion "Detalhes técnicos" (#eq-step-2):
 * são os campos da seção Essenciais + Contexto, sempre visíveis.
 * Os demais exigem expandir o accordion antes do scroll.
 */

/**
 * Abre o modal-add-eq em modo edição e, opcionalmente, foca um campo
 * específico — expandindo accordions intermediários se necessário.
 *
 * Pedido UX (abr/2026): o técnico clica em "Adicionar TAG" no detail view
 * e o modal abre já posicionado no campo correspondente, com highlight
 * temporário pra ser fácil achar visualmente. Antes só abria o modal
 * inteiro e o usuário tinha que rolar/expandir até achar o campo.
 *
 * @param {string} id - id do equipamento
 * @param {object} [opts]
 * @param {string} [opts.focusField] - slug do campo a focar (ex: 'tag')
 */
/**
 * @sliceSplit
 *   ui/modal: pre-popula form fields, abre modal-add-eq, sync nameplate UI
 *   nameplate: aplica nameplate metadata + restore dados placa
 * @sliceObs depende de fetchMyProfileBillingCached (async billing) — ver CP-F
 */
export async function openEditEquip(id, opts = {}) {
  const eq = findEquip(id);
  if (!eq) return;

  setEditingEquipId(id);
  const focusField = typeof opts?.focusField === 'string' ? opts.focusField : null;

  // Pre-popula os campos do modal com os dados do equipamento
  Utils.setVal('eq-nome', eq.nome || '');
  Utils.setVal('eq-local', eq.local || '');
  Utils.setVal('eq-tag', eq.tag || '');
  Utils.setVal('eq-tipo', eq.tipo || 'Split Hi-Wall');
  Utils.setVal('eq-fluido', eq.fluido || 'R-410A');
  // Componente (so faz sentido se tipo for de climatização). Sync logo apos
  // pra mostrar/esconder o wrapper. setVal é no-op se o wrapper estiver oculto.
  syncComponenteVisibility();
  if (eq.componente) Utils.setVal('eq-componente', eq.componente);
  Utils.setVal('eq-modelo', eq.modelo || '');
  Utils.setVal('eq-criticidade', eq.criticidade || 'media');
  Utils.setVal('eq-prioridade', eq.prioridadeOperacional || 'normal');
  Utils.setVal('eq-periodicidade', String(eq.periodicidadePreventivaDias || 90));
  restoreDadosPlaca(eq.dadosPlaca);
  // Seed review UI dos extras + metadata a partir do payload salvo. Se o
  // equipamento foi cadastrado antes desta feature, eq.dadosPlaca?.camposExtras
  // é undefined e a lista fica vazia — comportamento retrocompatível.
  try {
    const extras = Array.isArray(eq.dadosPlaca?.camposExtras) ? eq.dadosPlaca.camposExtras : [];
    setCamposExtrasState(extras);
    setNameplateMetadata({
      source: eq.dadosPlaca?._source === 'ai' ? 'ai' : 'manual',
      notas: eq.dadosPlaca?.notas || null,
    });
  } catch (_e) {
    /* review UI pode ainda não ter montado — ok, ficará vazia */
  }

  // Marca periodicidade como manual para não ser sobrescrita pelo auto-sugestão
  const periodicidadeInput = Utils.getEl('eq-periodicidade');
  if (periodicidadeInput) periodicidadeInput.dataset.manual = '1';

  // Abre o painel de detalhes direto (pula o step 1 de escolha de tipo)
  const detailsPanel = Utils.getEl('eq-step-2');
  if (detailsPanel) {
    detailsPanel.style.display = 'block';
    detailsPanel.setAttribute('aria-hidden', 'false');
  }

  // Popula o select de setor (apenas Pro) e aplica gate do hero CTA de placa.
  // V4: bloco de fotos saiu daqui — agora é via detail view.
  // V4.1: gate agora tem 3 estados (active / trial / locked) — pra Free,
  // busca a quota mensal e passa `trialRemaining` pro state 'trial' quando
  // o user ainda tem teste grátis disponível no mês.
  try {
    const [monetization, plans, capture, usageLimits] = await Promise.all([
      import('../../core/plans/monetization.js'),
      import('../../core/plans/subscriptionPlans.js'),
      import('../components/nameplateCapture.js'),
      import('../../core/usageLimits.js'),
    ]);
    const { fetchMyProfileBilling } = monetization;
    const { hasProAccess, hasPlusAccess } = plans;
    const { applyNameplateCtaGate } = capture;
    const { getMonthlyUsageSnapshot, USAGE_RESOURCE_NAMEPLATE_ANALYSIS, getMonthlyLimitForPlan } =
      usageLimits;
    const { profile } = await fetchMyProfileBilling();
    populateSetorSelect(hasProAccess(profile));

    const isPlusOrPro = hasPlusAccess(profile);
    if (isPlusOrPro) {
      applyNameplateCtaGate({ isPlusOrPro: true, trialRemaining: null });
    } else {
      try {
        const { supabase } = await import('../../core/supabase.js');
        const {
          data: { user },
        } = await supabase.auth.getUser();
        let trialRemaining = null;
        if (user?.id) {
          const snap = await getMonthlyUsageSnapshot(user.id);
          const used = Number(snap?.[USAGE_RESOURCE_NAMEPLATE_ANALYSIS] ?? 0) || 0;
          const limit = getMonthlyLimitForPlan(
            profile?.plan_code ?? 'free',
            USAGE_RESOURCE_NAMEPLATE_ANALYSIS,
          );
          trialRemaining = Number.isFinite(limit) ? Math.max(0, limit - used) : 0;
        }
        applyNameplateCtaGate({ isPlusOrPro: false, trialRemaining });
      } catch (_) {
        applyNameplateCtaGate({ isPlusOrPro: false, trialRemaining: null });
      }
    }
  } catch {
    populateSetorSelect(false);
    try {
      const { applyNameplateCtaGate } = await import('../components/nameplateCapture.js');
      applyNameplateCtaGate({ isPlusOrPro: false, trialRemaining: null });
    } catch (_) {
      /* noop */
    }
  }
  if (eq.setorId) Utils.setVal('eq-setor', eq.setorId);
  // PMOC Fase 2: pre-popula select de cliente no edit. populateClienteSelect()
  // é chamado em open-modal handler, mas aqui setamos o value após o populate.
  // Como populate é async, usamos requestAnimationFrame pra esperar o render.
  if (eq.clienteId) {
    requestAnimationFrame(() => {
      const select = document.getElementById('eq-cliente');
      if (select) Utils.setVal('eq-cliente', eq.clienteId);
    });
  }

  // Atualiza textos do modal
  const titleEl = Utils.getEl('modal-add-eq-title');
  if (titleEl) titleEl.textContent = 'Editar equipamento';
  const saveBtn = document.getElementById('eq-save-primary');
  if (saveBtn) saveBtn.textContent = 'Salvar alterações →';
  const secondaryBtn = document.getElementById('eq-save-secondary');
  const tertiaryRow = document.getElementById('eq-save-tertiary-row');
  const tertiaryBtn = document.getElementById('eq-save-tertiary');
  setEquipActionButtonVisible(secondaryBtn, false);
  setEquipActionButtonVisible(tertiaryBtn || tertiaryRow, false);
  if (tertiaryBtn) setEquipActionTrayButtonLabel(tertiaryBtn, '');
  setEquipActionFooterHintVisible(false);

  // Fecha o modal de detalhes e abre o de edição
  try {
    const { Modal: M } = await import('../../core/modal.js');
    M.close('modal-eq-det');
    M.open('modal-add-eq');
  } catch (error) {
    handleError(error, {
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Não foi possível abrir o modal de edição.',
      context: { action: 'equipamentos.openEditEquip', id },
    });
    return;
  }

  // Foco em campo específico (focusField). Roda DEPOIS do M.open pra
  // garantir que o DOM está visível e mensurável. requestAnimationFrame
  // dá um tick pro browser pintar antes do scroll/focus — evita o
  // scroll cair em (0,0) num modal que ainda não terminou a transição.
  if (focusField) _focusEditField(focusField);
}

/**
 * Encontra o campo no modal-add-eq pelo slug, expande accordions
 * necessários, faz scroll suave até o centro do campo, foca o input
 * e aplica a classe `is-focus-target` por 2s pra um ring visual.
 *
 * Tolerante: se o slug não existir no mapa ou se o input não for
 * encontrado no DOM (ex: feature flag escondendo o accordion), apenas
 * loga warning e segue — o modal já abriu e o usuário pode editar
 * normalmente.
 */
/** @sliceTarget ui/modal */
function _focusEditField(fieldKey) {
  const targetId = EDIT_FOCUS_FIELD_MAP[fieldKey];
  if (!targetId) {
    console.warn(`[equipamentos] focusField desconhecido: "${fieldKey}"`);
    return;
  }

  // Step 1: garante que a seção "Detalhes técnicos" (#eq-step-2) está aberta
  // se o campo não é um dos Essenciais/Contexto. Isso porque o accordion
  // fica fechado por default e o input nem está renderizado-visível antes.
  const needsTechExpand = !EDIT_FOCUS_ESSENCIAIS.has(fieldKey);
  if (needsTechExpand) {
    const expandBtn = document.getElementById('eq-expand-details');
    const expandPanel = document.getElementById('eq-step-2');
    if (expandBtn && expandPanel) {
      expandBtn.setAttribute('aria-expanded', 'true');
      expandPanel.classList.add('is-open');
      expandPanel.setAttribute('aria-hidden', 'false');
      expandPanel.style.display = 'block';
    }
  }

  // Step 2: se for um campo avançado da etiqueta, expande o sub-painel
  // #eq-etiqueta-more (progressive disclosure dentro de #eq-step-2).
  if (EDIT_FOCUS_ETIQUETA_MORE.has(fieldKey)) {
    const moreToggle = document.getElementById('eq-etiqueta-more-toggle');
    const morePanel = document.getElementById('eq-etiqueta-more');
    if (moreToggle && morePanel) {
      moreToggle.setAttribute('aria-expanded', 'true');
      morePanel.hidden = false;
      morePanel.setAttribute('aria-hidden', 'false');
    }
  }

  // Step 3: aguarda paint, depois scroll + focus + highlight.
  // 2 RAFs garantem que o reflow das expansões acima foi aplicado antes
  // de medir position pro scrollIntoView. Em devices lentos 1 RAF basta;
  // o segundo é blindagem barata contra "scroll caiu na posição errada".
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target) {
        console.warn(`[equipamentos] focusField target #${targetId} não encontrado no DOM`);
        return;
      }

      try {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        target.scrollIntoView();
      }

      // Pequeno delay no focus pra não competir com o scroll smooth
      // (alguns browsers cancelam o scroll quando recebem focus durante).
      setTimeout(() => {
        try {
          target.focus({ preventScroll: true });
        } catch {
          target.focus();
        }
      }, 280);

      // Highlight temporário 2s. Aplica na FormGroup wrapper pra o ring
      // englobar o label + input juntos (mais óbvio do que ring só no
      // input). Fallback: aplica direto no input se o wrapper não existir.
      const host = target.closest('.form-group') || target;
      host.classList.add('is-focus-target');
      setTimeout(() => host.classList.remove('is-focus-target'), 2200);
    });
  });
}

/**
 * @sliceTarget ui/form
 */
function _getSaveEquipPostActionContext(options = {}) {
  const postAction = String(options?.postAction || '').trim();
  return {
    postAction,
    keepOpen: postAction === 'clone',
    openRegistro: postAction === 'register',
    openPmoc: postAction === 'pmoc',
    saveWithoutClient: postAction === 'save-without-client',
  };
}

/**
 * @sliceTarget ui/modal
 */
async function _closeSaveEquipModal(keepOpen) {
  if (!keepOpen) {
    try {
      const { Modal: M } = await import('../../core/modal.js');
      M.close('modal-add-eq');
    } catch (error) {
      handleError(error, {
        code: ErrorCodes.NETWORK_ERROR,
        message: 'Não foi possível fechar o modal de cadastro.',
        context: { action: 'equipamentos.saveEquip.closeModal' },
        severity: 'warning',
      });
    }
  }
}

/**
 * @sliceTarget ui/form
 */
function _resetSaveEquipForm(keepOpen) {
  const fieldsToClear = ['eq-nome', 'eq-tag'];
  if (!keepOpen) fieldsToClear.push('eq-local', 'eq-modelo', 'eq-periodicidade');
  Utils.clearVals(...fieldsToClear);
  // Limpa os 12 inputs da etiqueta pra não "vazar" valor entre cadastros.
  Utils.clearVals(...DADOS_PLACA_INPUT_IDS);
  if (!keepOpen) {
    Utils.setVal('eq-tipo', 'Split Hi-Wall');
    Utils.setVal('eq-fluido', 'R-410A');
    Utils.setVal('eq-componente', '');
  }
  syncComponenteVisibility();
  if (!keepOpen) {
    Utils.setVal('eq-criticidade', 'media');
    Utils.setVal('eq-prioridade', 'normal');
    Utils.setVal('eq-frequencia', '60');
    Utils.setVal('eq-periodicidade', String(getSuggestedPreventiveDays('Split Hi-Wall', 'media')));
  }
  const periodicidadeInput = Utils.getEl('eq-periodicidade');
  if (periodicidadeInput) periodicidadeInput.dataset.manual = '0';

  // Reset do estado de edição e UI do modal
  if (!keepOpen) {
    clearEditingState();
  }
}

/**
 * @sliceTarget controller/render
 */
async function _refreshSaveEquipViews() {
  OnboardingBanner.remove();
  try {
    const { renderDashboard } = await import('./dashboard.js');
    renderDashboard();
  } catch (error) {
    handleError(error, {
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Equipamento salvo, mas houve falha ao atualizar o painel.',
      context: { action: 'equipamentos.saveEquip.renderDashboard' },
      severity: 'warning',
    });
  }
  renderEquip();
  updateGlobalHeader();
}

// _eqDetailSubtitle, _infoRowValueOrEmpty, _riskFactorChipHtml extraídos
// pra src/features/equipamentos/utils/detail.js (Mudança 11 / CP-B).

/** @sliceTarget ui/detail */
function _resolveViewEquipTarget(id) {
  return findEquip(id);
}

/** @sliceSplit ui/detail-model */
function _buildViewEquipDetailModel(id, eq) {
  const regs = regsForEquip(id).sort((a, b) => b.data.localeCompare(a.data));
  const health = evaluateEquipmentHealth(eq, regs);
  const score = health.score;
  const cls = getHealthClass(score);
  const safeId = Utils.escapeAttr(id);
  const context = health.context;
  const risk = evaluateEquipmentRisk(eq, regs);
  const proximaPreventiva = context?.proximaPreventiva
    ? Utils.formatDate(context.proximaPreventiva)
    : 'Sem agenda';
  const healthSummary = health.reasons.length
    ? Utils.escapeHtml(health.reasons.slice(0, 2).join(' | '))
    : 'Histórico dentro da rotina prevista';

  // SVG ring progress
  const ringR = 30;
  const ringC = +(2 * Math.PI * ringR).toFixed(1);
  const ringOffset = +(ringC * (1 - score / 100)).toFixed(1);

  return {
    id,
    eq,
    regs,
    health,
    score,
    cls,
    safeId,
    context,
    risk,
    proximaPreventiva,
    healthSummary,
    ringR,
    ringC,
    ringOffset,
  };
}

/** @sliceSplit ui/detail-setor */
function _renderViewEquipSetorInfoRow(eq) {
  // Setor como info-row READONLY (não editável inline). Antes era um <select>
  // embutido mas quebrava o padrão visual (todos os outros campos são só
  // label + valor) e não tinha feedback de "quando salva?". Edição completa
  // vai pro modal "Editar" no footer. Clique no "Alterar" leva pra lá.
  const { setores: _setores } = getState();
  const setorObj = _setores.find((s) => s.id === eq.setorId);
  const setorNome = setorObj ? setorObj.nome : 'Sem setor';
  const setorVisual = setorObj ? '' : 'info-row__value--muted';
  return `<div class="info-row info-row--setor">
      <span class="info-row__label">Setor</span>
      <span class="info-row__value ${setorVisual}">${Utils.escapeHtml(setorNome)}</span>
    </div>`;
}

/** @sliceSplit ui/detail-services */
function _renderViewEquipServiceTimeline(regs) {
  // Timeline de serviços
  return regs.length === 0
    ? `<div class="eq-svc-empty">Nenhum serviço registrado ainda.</div>`
    : `<div class="eq-svc-timeline">
        ${regs
          .slice(0, 5)
          .map(
            (r) => `
          <div class="eq-svc-item">
            <div class="eq-svc-item__dot"></div>
            <div class="eq-svc-item__content">
              <span class="eq-svc-item__tipo">${Utils.escapeHtml(r.tipo)}</span>
              <span class="eq-svc-item__data">${Utils.formatDatetime(r.data)}</span>
            </div>
          </div>`,
          )
          .join('')}
        ${regs.length > 5 ? `<div class="eq-svc-more">+${regs.length - 5} serviços anteriores</div>` : ''}
      </div>`;
}

/** @sliceSplit ui/detail-photos */
function _renderViewEquipCoverBlock(model) {
  const { eq, safeId } = model;
  // ── Cover block (V4.1) ──
  // Foto "de capa" edge-to-edge no topo do modal de detalhes. Dá identidade
  // visual imediata (o técnico reconhece o equipamento antes de ler o nome).
  // Se não houver foto: placeholder com gradiente + emoji do tipo +
  // CTA centralizado "Adicionar foto". Se houver foto: img cobre o espaço
  // todo e o CTA "Gerenciar fotos" fica overlay no canto inferior direito.
  // Na listagem, o card continua com avatar/thumb redondo (equipCardIconBlock).
  const visual = getEquipmentVisualMeta(eq);
  // tipoEmoji removido em V7 (avatar usa só iniciais).
  // visual.icon ainda é usado por outros consumidores (ex: PDF cover).
  const firstPhotoUrl = visual.photoUrl;
  const photosCount = Array.isArray(eq.fotos)
    ? eq.fotos.filter((p) => p && (typeof p === 'string' ? p : p.url || p.path)).length
    : 0;
  const canEditPhotos = isCachedPlanPlusOrHigher();
  // Copy do CTA muda por plano pra deixar claro que Free é um gate (antes
  // dizia "Adicionar foto PLUS", confundindo — parecia que o clique abriria
  // a câmera, quando na verdade abre a tela de pricing).
  //   Free  : "Desbloquear com Plus" + ícone de cadeado
  //   Plus+ : "Adicionar foto" / "Gerenciar fotos" + ícone de câmera
  const photoCtaLabel = canEditPhotos
    ? photosCount === 0
      ? 'Adicionar foto'
      : 'Gerenciar fotos'
    : 'Desbloquear com Plus';
  // Pra Free o CTA vira upsell (abre pricing). Pro/Plus abre o editor.
  const photoCtaAction = canEditPhotos ? 'open-eq-photos-editor' : 'open-upgrade';
  const photoCtaExtra = canEditPhotos
    ? ''
    : ' data-upgrade-source="equip_detail_photos" data-highlight-plan="plus"';
  const photoCtaBadge = canEditPhotos
    ? ''
    : '<span class="plus-badge plus-badge--inline" aria-hidden="true">PLUS</span>';
  const photoCtaVariantCls = canEditPhotos ? '' : ' eq-detail-cover__cta--locked';
  const photoCameraIcon = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/>
      <circle cx="12" cy="13" r="3.5"/>
    </svg>`;
  const photoLockIcon = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2"/>
      <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>`;
  const photoCtaIcon = canEditPhotos ? photoCameraIcon : photoLockIcon;
  // Nota: o fallback de erro no <img> (quando firstPhotoUrl falha) é anexado
  // via addEventListener('error') logo depois que o innerHTML é aplicado
  // (busca por _wireEqDetailCoverFallback abaixo). Antes usávamos `onerror=`
  // inline, mas isso viola CSP `script-src 'self'` (sem 'unsafe-inline').
  // Decisão UX (V4.3): quando há foto, o CTA NÃO fica mais sobreposto a ela
  // (era "Gerenciar fotos" flutuando no canto inferior direito do img e
  // obstruía a etiqueta). Agora a foto fica limpa e o CTA vira uma linha
  // dedicada logo abaixo — ação separada, visível, sem interferir na leitura.
  // Quando NÃO há foto (placeholder), o CTA continua centralizado sobre o
  // gradiente porque nesse caso ele É o próprio conteúdo convidando à ação.
  // V7: emoji do tipo (floquinho/raio/etc) removido do cover fallback —
  // mesmo princípio do avatar do card da listagem. Avatar usa só iniciais,
  // identificação visual fina é responsabilidade da foto real.
  const coverFallback = `<div class="eq-detail-cover__fallback eq-detail-cover__fallback--tone-${visual.tone}">
      <span class="eq-detail-cover__fallback-initials">${Utils.escapeHtml(visual.initials)}</span>
    </div>`;
  const coverInner = firstPhotoUrl
    ? `<img class="eq-detail-cover__img" src="${Utils.escapeAttr(firstPhotoUrl)}" alt="Foto de ${Utils.escapeAttr(eq.nome)}" loading="lazy" />
       ${coverFallback}
       <button type="button" class="eq-detail-cover__preview-hit" aria-label="Ampliar foto de ${Utils.escapeAttr(eq.nome)}"></button>
       <!-- Pill "ampliar" (V7): sinaliza explicitamente que clicar abre
            a foto em fullscreen. Antes só o cursor zoom-in dava a dica;
            usuário mobile/touch nem via cursor, então a pill resolve. -->
       <span class="eq-detail-cover__zoom-hint" aria-hidden="true">
         <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <circle cx="11" cy="11" r="7"/><path d="M11 8v6M8 11h6M20 20l-3.5-3.5"/>
         </svg>
         ampliar
       </span>`
    : `${coverFallback}
       <button type="button" class="eq-detail-cover__cta eq-detail-cover__cta--center${photoCtaVariantCls}"
         data-action="${photoCtaAction}" data-id="${safeId}"${photoCtaExtra}
         aria-label="${canEditPhotos ? 'Adicionar foto' : 'Fotos bloqueadas — desbloqueie com o plano Plus'}">
         ${photoCtaIcon}
         <span>${photoCtaLabel}</span>
         ${photoCtaBadge}
       </button>`;
  const coverHasPhotoClass = firstPhotoUrl
    ? ' eq-detail-cover--has-photo'
    : ' eq-detail-cover--empty';
  const coverLockedClass = canEditPhotos ? '' : ' eq-detail-cover--locked';
  // Linha de ação logo abaixo da foto — só renderizada quando existe foto.
  // No caso empty, o CTA já tá dentro do placeholder (centralizado).
  const coverActionsBlock = firstPhotoUrl
    ? `<div class="eq-detail-cover-actions">
        <button type="button" class="eq-detail-cover-action${photoCtaVariantCls}"
          data-action="${photoCtaAction}" data-id="${safeId}"${photoCtaExtra}
          aria-label="${canEditPhotos ? 'Gerenciar fotos' : 'Fotos bloqueadas — desbloqueie com o plano Plus'}">
          ${photoCtaIcon}
          <span>${photoCtaLabel}</span>
          ${photoCtaBadge}
        </button>
      </div>`
    : '';
  return {
    html: `
    <div class="eq-detail-cover${coverHasPhotoClass}${coverLockedClass}">
      ${coverInner}
    </div>
    ${coverActionsBlock}`,
    firstPhotoUrl,
  };
}

/** @sliceSplit ui/detail-nameplate */
function _renderViewEquipDadosPlacaSections(eq) {
  // ── Seção "Dados da etiqueta" (V5) ──
  // Renderiza os 12 campos extraídos da etiqueta (via IA no cadastro ou
  // digitados manualmente). Se o equip foi cadastrado antes da feature OU
  // o usuário não preencheu, a seção é omitida inteira — evita ruído visual
  // com uma lista de "—".
  //
  // Decisão UX: não exibimos CTA "Adicionar dados da etiqueta" aqui porque o
  // botão "Editar" do footer já abre o modal de edição completo com a seção
  // da etiqueta visível. Adicionar outro CTA duplicaria caminhos e confundiria.
  //
  // Nomenclatura: user-facing usa "etiqueta" (menos ambíguo que "placa", que
  // remete a PCB/componente eletrônico). Internamente a column e os identifiers
  // continuam como `dados_placa`/`dadosPlaca` pra não quebrar schema + tests.
  const dadosPlacaRows = formatDadosPlacaRows(eq.dadosPlaca);
  // Separa campos fixos (FIELD_ORDER) de extras dinâmicos. Extras ficam em
  // UMA seção simples "Outras informações da etiqueta" — preservamos os
  // dados mas sem insights automáticos (phase-out/disjuntor) pra não criar
  // ruído visual nem prometer análise que exige validação humana.
  const dadosPlacaFixedRows = dadosPlacaRows.filter((r) => !r.extra);
  const dadosPlacaExtraRows = dadosPlacaRows.filter((r) => r.extra);

  const rowHtml = (row) => `
            <div class="info-row">
              <span class="info-row__label">${Utils.escapeHtml(row.label)}</span>
              <span class="info-row__value${row.mono ? ' info-row__value--mono' : ''}">${Utils.escapeHtml(row.value)}</span>
            </div>`;

  const dadosPlacaSectionHtml = dadosPlacaFixedRows.length
    ? `
      <div class="eq-tech-sheet__section">
        <div class="eq-tech-sheet__title">Dados da etiqueta</div>
        <div class="info-list info-list--spaced info-list--soft">
          ${dadosPlacaFixedRows.map(rowHtml).join('')}
        </div>
      </div>`
    : '';

  const dadosPlacaExtrasSectionHtml = dadosPlacaExtraRows.length
    ? `
      <div class="eq-tech-sheet__section">
        <div class="eq-tech-sheet__title">Outras informações da etiqueta</div>
        <div class="info-list info-list--spaced info-list--soft">
          ${dadosPlacaExtraRows.map(rowHtml).join('')}
        </div>
      </div>`
    : '';

  return { dadosPlacaSectionHtml, dadosPlacaExtrasSectionHtml };
}

/** @sliceSplit ui/detail-html */
function _renderViewEquipDetailHtml(model) {
  const {
    eq,
    regs,
    score,
    cls,
    safeId,
    context,
    risk,
    proximaPreventiva,
    healthSummary,
    ringR,
    ringC,
    ringOffset,
  } = model;
  const setorSelectHtml = _renderViewEquipSetorInfoRow(eq);
  const svcTimeline = _renderViewEquipServiceTimeline(regs);
  const coverBlock = _renderViewEquipCoverBlock(model);
  const { dadosPlacaSectionHtml, dadosPlacaExtrasSectionHtml } =
    _renderViewEquipDadosPlacaSections(eq);

  return {
    html: `
    <div class="eq-detail-view">

      ${coverBlock.html}

      <!--
        Title block consolidado (V7 refino UX): nome em h1 + subtítulo
        muted "Local · TAG". Antes a TAG só aparecia dentro do accordion
        e o local mostrava como info-row separado, exigindo scroll ou
        expansão pra info que o técnico precisa de cara. Agora tudo
        identificador essencial fica visível logo após a foto.
      -->
      <div class="eq-detail-title-block">
        <div class="modal__title" id="eq-det-title">${Utils.escapeHtml(eq.nome)}</div>
        <div class="eq-detail-title-block__sub">${_eqDetailSubtitle(eq)}</div>
      </div>

      <!-- ── Hero: score + status. Ring usa linearGradient cyan→success
           (V7) pra dar identidade visual ao score saudável. Tones --warn
           e --danger continuam usando cor sólida via classe-modifier. -->
      <div class="eq-detail-hero eq-detail-hero--${cls}">
        <div class="eq-detail-hero__body">
          <div class="eq-hero-score">
            <div class="eq-score-ring-wrap">
              <svg class="eq-score-ring" viewBox="0 0 72 72" aria-hidden="true">
                <defs>
                  <linearGradient id="eq-score-grad-${safeId}" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#00c8e8"/>
                    <stop offset="100%" stop-color="#00c853"/>
                  </linearGradient>
                </defs>
                <circle class="eq-score-ring__track" cx="36" cy="36" r="${ringR}"/>
                <circle class="eq-score-ring__fill eq-score-ring__fill--${cls}" cx="36" cy="36" r="${ringR}"
                  stroke-dasharray="${ringC}" stroke-dashoffset="${ringOffset}"
                  ${cls === 'ok' ? `stroke="url(#eq-score-grad-${safeId})"` : ''}/>
              </svg>
              <div class="eq-score-ring__num eq-score-ring__num--${cls}" aria-label="Score ${score}%">${score}%</div>
            </div>
            <div class="eq-hero-score__info">
              <div class="eq-hero-score__summary">${healthSummary}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- V4: galeria/lightbox saíram daqui. Fotos agora são editadas via
           modal-eq-photos aberto pelo avatar CTA. -->

      <!-- ── Painel de risco (V3: sem fórmula exposta) ──
           A fórmula do score saiu deste painel; agora existe apenas um
           botão "?" pequeno no cabeçalho que abre o modal explicativo
           (modal-score-info) com as faixas e fatores.
           O resumo/explicação do risco foi removido também, ficando só:
           label + botão ajuda + classificação+score + chip + factors. -->
      <div class="eq-risk-panel eq-risk-panel--${risk.classification}">
        <div class="eq-risk-panel__header">
          <div>
            <div class="eq-risk-panel__label-row">
              <span class="eq-risk-panel__label">Fatores de risco</span>
              <button type="button" class="eq-risk-panel__help" data-action="open-modal"
                      data-id="modal-score-info" title="Como calculamos o score"
                      aria-label="Como calculamos o score de risco">?</button>
            </div>
          </div>
        </div>
        <div class="eq-risk-panel__factors">
          ${(risk.factors.length ? risk.factors : ['rotina estável'])
            .map((f) => _riskFactorChipHtml(f, safeId))
            .join('')}
        </div>
      </div>

      <!-- ── Ficha técnica (V6: accordion colapsável) ──
           Todos os detalhes técnicos (Identificação, Operação, Dados da
           etiqueta) ficam dentro de um único <details> fechado por default.
           Reduz scroll do modal em ~60% — o técnico no campo quase sempre
           quer só ver a foto + registrar serviço, não reler a ficha toda.
           Summary mostra preview curto dos 2 campos mais essenciais
           (Rotina + Próxima preventiva) pra não precisar expandir em 90% dos
           casos. Click no summary expande tudo. -->
      <details class="eq-tech-sheet-wrap" id="eq-tech-sheet-${safeId}">
        <summary class="eq-tech-sheet-wrap__summary">
          <div class="eq-tech-sheet-wrap__summary-head">
            <span class="eq-tech-sheet-wrap__summary-title">Detalhes técnicos</span>
            <svg class="eq-tech-sheet-wrap__chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
          <div class="eq-tech-sheet-wrap__summary-preview">
            <span class="eq-tech-sheet-wrap__summary-chip">
              <b>${Utils.escapeHtml(`${context?.periodicidadeDias || eq.periodicidadePreventivaDias}`)}</b> dias
            </span>
            <span class="eq-tech-sheet-wrap__summary-chip">
              Próx.: <b>${Utils.escapeHtml(proximaPreventiva)}</b>
            </span>
            <span class="eq-tech-sheet-wrap__summary-hint">toque pra ver tudo</span>
          </div>
        </summary>
        <div class="eq-tech-sheet">
          <div class="eq-tech-sheet__section">
            <div class="eq-tech-sheet__title">Identificação</div>
            <div class="info-list info-list--spaced info-list--soft">
              <div class="info-row"><span class="info-row__label">TAG</span>${_infoRowValueOrEmpty(eq.tag, 'Adicionar TAG', safeId, 'mono', 'tag')}</div>
              <div class="info-row"><span class="info-row__label">Tipo</span><span class="info-row__value">${Utils.escapeHtml(eq.tipo)}</span></div>
              <div class="info-row"><span class="info-row__label">Fluido</span>${_infoRowValueOrEmpty(eq.fluido, 'Adicionar fluido', safeId, '', 'fluido')}</div>
              <div class="info-row"><span class="info-row__label">Modelo</span>${_infoRowValueOrEmpty(eq.modelo, 'Adicionar modelo', safeId, '', 'modelo')}</div>
              <div class="info-row"><span class="info-row__label">Local</span><span class="info-row__value">${Utils.escapeHtml(eq.local)}</span></div>
              ${setorSelectHtml}
            </div>
          </div>
          <div class="eq-tech-sheet__section">
            <div class="eq-tech-sheet__title">Operação</div>
            <div class="info-list info-list--spaced info-list--soft">
              <div class="info-row"><span class="info-row__label">Rotina preventiva</span><span class="info-row__value">${Utils.escapeHtml(`${context?.periodicidadeDias || eq.periodicidadePreventivaDias} dias`)}</span></div>
              <div class="info-row"><span class="info-row__label">Próxima preventiva</span><span class="info-row__value">${Utils.escapeHtml(proximaPreventiva)}</span></div>
            </div>
          </div>
          ${dadosPlacaSectionHtml}
          ${dadosPlacaExtrasSectionHtml}
        </div>
      </details>

      <!-- ── Histórico de serviços ── -->
      <div class="eq-svc-section">
        <div class="eq-svc-section__header">
          <span class="eq-svc-section__title">Histórico de serviços</span>
          <button class="btn ${regs.length === 0 ? 'btn--primary' : 'btn--outline'} btn--sm eq-svc-section__cta" data-action="go-register-equip" data-id="${safeId}">
            + Registrar ${regs.length === 0 ? 'primeiro ' : ''}serviço
          </button>
        </div>
        ${svcTimeline}
      </div>

      <!-- ── Footer (V3: 3-ações) ──
           Hierarquia nova:
           · "Registrar serviço" (primary, 60% da largura) — ação mais frequente
           · "Editar" (outline, flex 1) — ação rotineira secundária
           · "Excluir" (danger icon 36×36) — ação irreversível reduzida
           Antes só tinha Editar + Excluir; a primary "Registrar" estava escondida
           no header da seção de histórico (fora do modal). Promovê-la aqui
           alinha a UI com o fluxo real: abrir detalhes → registrar serviço. -->
      <div class="eq-modal-footer eq-modal-footer--tri">
        <button class="btn btn--primary btn--sm eq-modal-footer__btn eq-modal-footer__btn--primary eq-modal-footer__btn--register"
                data-action="go-register-equip" data-id="${safeId}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Registrar serviço
        </button>
        <button class="btn btn--outline btn--sm eq-modal-footer__btn eq-modal-footer__btn--edit"
                data-action="edit-equip" data-id="${safeId}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Editar
        </button>
        <!--
          Kebab "Mais ações" substitui a lixeira vermelha que ficava direto
          no footer. Risco de click acidental era real (botão destrutivo a 1
          toque de distância da ação mais comum). Agora a exclusão fica
          atrás de ⋯ → "Excluir" — padrão consistente com o setor-card V3.
        -->
        <div class="eq-modal-footer__more">
          <button class="eq-modal-footer__more-btn" type="button"
            data-action="toggle-eq-detail-menu" data-id="${safeId}"
            aria-haspopup="menu" aria-expanded="false" aria-controls="eq-detail-menu-${safeId}"
            aria-label="Mais ações para ${Utils.escapeAttr(eq.nome)}"
            title="Mais ações">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </button>
          <div class="eq-modal-footer__menu" id="eq-detail-menu-${safeId}" role="menu" hidden>
            <button type="button" class="eq-modal-footer__menu-item eq-modal-footer__menu-item--danger"
              role="menuitem" data-action="delete-equip" data-id="${safeId}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
              <span>Excluir equipamento</span>
            </button>
          </div>
        </div>
      </div>

    </div>`,
    firstPhotoUrl: coverBlock.firstPhotoUrl,
  };
}

/** @sliceSplit ui/detail-modal */
function _mountViewEquipDetail(html) {
  Utils.getEl('eq-det-corpo').innerHTML = html;
}

/** @sliceSplit ui/detail-photos */
function _bindViewEquipDetailCoverActions(firstPhotoUrl) {
  // Setor agora é readonly no detail view (listener inline removido).
  // `assignEquipToSetor` continua exportada pra uso programático (drag-drop).

  // V4: listener das fotos do hero/gallery removido — o bloco foi substituído
  // pelo avatar CTA, que abre `modal-eq-photos`. Lightbox continua sendo
  // útil para abrir a foto em grande a partir do editor, se necessário.

  // Fallback da foto de capa quebrada: se a URL expira ou falha (offline,
  // 404), aplica `eq-detail-cover--fallback` pra o emoji do tipo aparecer
  // no lugar do img quebrado. Anexado via addEventListener em vez de
  // `onerror=` inline por causa do CSP `script-src 'self'`.
  const coverImg = document.querySelector('.eq-detail-cover__img');
  if (coverImg instanceof HTMLImageElement) {
    coverImg.addEventListener(
      'load',
      () => {
        coverImg.closest('.eq-detail-cover')?.classList.add('eq-detail-cover--loaded');
      },
      { once: true },
    );
    coverImg.addEventListener(
      'error',
      () => {
        coverImg.closest('.eq-detail-cover')?.classList.add('eq-detail-cover--fallback');
        coverImg.remove();
      },
      { once: true },
    );
  }
  const coverPreviewHit = document.querySelector('.eq-detail-cover__preview-hit');
  if (coverPreviewHit && firstPhotoUrl) {
    coverPreviewHit.addEventListener('click', () => {
      Photos.openLightbox(firstPhotoUrl);
    });
  }
}

/** @sliceSplit ui/detail-modal */
async function _openViewEquipDetailModal(id) {
  try {
    const { Modal: M } = await import('../../core/modal.js');
    M.open('modal-eq-det');
  } catch (error) {
    handleError(error, {
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Não foi possível abrir os detalhes do equipamento.',
      context: { action: 'equipamentos.viewEquip.openModal', id },
    });
  }
}

/**
 * @sliceSplit
 *   ui/detail: HTML strings (cover, hero, risk panel, tech sheet, timeline, footer)
 *   risco: avaliacao de risk + classification + factors + suggested action
 * @sliceObs pre-split in-place em CP-G.0; manter adapter até CP-G.1.
 */
export async function viewEquip(id) {
  const eq = _resolveViewEquipTarget(id);
  if (!eq) return;

  const model = _buildViewEquipDetailModel(id, eq);
  const detail = _renderViewEquipDetailHtml(model);
  _mountViewEquipDetail(detail.html);
  _bindViewEquipDetailCoverActions(detail.firstPhotoUrl);
  await _openViewEquipDetailModal(id);
}

/** @sliceTarget crud/equip */
export async function deleteEquip(id) {
  const { registros } = getState();
  const linkedRegistros = registros.filter((r) => r.equipId === id).map((r) => r.id);
  Storage.markEquipDeleted(id, linkedRegistros);

  setState((prev) => ({
    ...prev,
    equipamentos: prev.equipamentos.filter((e) => e.id !== id),
    registros: prev.registros.filter((r) => r.equipId !== id),
  }));
  try {
    const { Modal: M } = await import('../../core/modal.js');
    M.close('modal-eq-det');
  } catch (error) {
    handleError(error, {
      code: ErrorCodes.NETWORK_ERROR,
      message: 'Equipamento removido, mas não foi possível fechar o modal.',
      context: { action: 'equipamentos.deleteEquip.closeModal', id },
      severity: 'warning',
    });
  }
  renderEquip();
  updateGlobalHeader();
  Toast.info('Equipamento removido.');
}

/** @sliceTarget ui/form */
export function populateEquipSelects() {
  const { equipamentos, técnicos } = getState();
  const selectConfigs = [
    { id: 'r-equip', placeholder: 'Selecione o equipamento...' },
    { id: 'hist-equip', placeholder: 'Todos os equipamentos' },
    { id: 'rel-equip', placeholder: 'Todos' },
  ];

  selectConfigs.forEach(({ id, placeholder }) => {
    const el = Utils.getEl(id);
    if (!el) return;

    el.textContent = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.value = '';
    defaultOption.textContent = placeholder;
    el.appendChild(defaultOption);

    equipamentos.forEach((equipamento) => {
      const option = document.createElement('option');
      option.value = String(equipamento.id || '');
      option.textContent = `${equipamento.nome || '—'} — ${equipamento.local || '—'}`;
      el.appendChild(option);
    });
  });

  const tecDatalist = Utils.getEl('tec-datalist');
  if (tecDatalist) {
    tecDatalist.textContent = '';
    (técnicos || []).forEach((técnico) => {
      const option = document.createElement('option');
      option.value = String(técnico || '');
      tecDatalist.appendChild(option);
    });
  }

  const rTecnico = Utils.getEl('r-tecnico');
  if (rTecnico && !rTecnico.value) {
    const def = Profile.getDefaultTecnico();
    if (def) rTecnico.value = def;
  }
}
