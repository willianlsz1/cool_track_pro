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
import { Profile } from '../../core/profile.js';
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
import { DadosPlacaValidationError, formatDecimalHint } from '../../domain/dadosPlacaValidation.js';
import { emptyStateHtml } from '../components/emptyState.js';
import { buildEquipamentosViewModel } from '../viewModels/equipamentosViewModel.js';
import { buildEquipamentosHeaderViewModel } from '../viewModels/equipamentosHeaderModel.js';
import { validateEquipamentoPayload } from '../../core/inputValidation.js';
import { EquipmentPhotos } from '../components/equipmentPhotos.js';
import { resetCamposExtrasState, setCamposExtrasState } from '../components/nameplateCapture.js';
import { normalizePhotoList } from '../../core/photoStorage.js';
import { isCachedPlanPro } from '../../core/plans/planCache.js';
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
} from './equipamentos/utils/viewModels.js';
import {
  getEditingEquipId,
  getEditingSetorId,
  getForcedEquipContext,
  setEditingEquipId,
  setEditingSetorId,
  setForcedEquipContext,
} from './equipamentos/state/editingState.js';
import {
  incrementRenderEquipPlanToken,
  getRenderEquipPlanNeedsRefresh,
} from './equipamentos/state/renderPlanState.js';
import {
  bindRenderEquipPlanInvalidationEvents,
  configureRenderEquipPlan,
  refreshRenderEquipPlan,
} from './equipamentos/bridges/renderPlan.js';
import {
  mountEquipamentosHeader as mountEquipamentosHeaderBridge,
  unmountEquipamentosHeader,
} from './equipamentos/bridges/headerBridge.js';
import {
  mountEquipamentosList,
  unmountEquipamentosList,
} from './equipamentos/bridges/listBridge.js';
import {
  configureSetorUI,
  renderSetorGrid,
  renderSetorGridForCliente,
} from './equipamentos/setor/setorUI.js';
import { configureSetorNavigation, setActiveSector } from './equipamentos/setor/setorNavigation.js';
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
import { collectSaveEquipDadosPlaca } from './equipamentos/nameplate/dadosPlaca.js';
import { finishSaveEquipSuccess } from '../../features/equipamentos/crud/postSave.js';
import { runSaveEquipPostActions } from '../../features/equipamentos/crud/postActions.js';
import { configureSaveEquip, saveEquip } from '../../features/equipamentos/crud/saveEquip.js';
import {
  bindViewEquipDetailCoverActions,
  mountViewEquipDetail,
  openViewEquipDetailModal,
} from './equipamentos/ui/detailController.js';
import { renderViewEquipDetailHtml } from './equipamentos/ui/detail.js';
import { buildViewEquipDetailModel } from './equipamentos/ui/detailModel.js';
import { configureDeleteEquip, deleteEquip } from './equipamentos/ui/deleteEquip.js';
import { configureOpenEditEquip, openEditEquip } from './equipamentos/ui/openEditEquip.js';
import { startServiceRegistration } from '../controller/serviceRegistrationEntry.js';
import { configureRenderFlatList, renderFlatList } from './equipamentos/ui/renderFlatList.js';
import { configureRenderEquip, renderEquip } from './equipamentos/ui/renderEquip.js';
import { configureHeaderMount, mountEquipamentosHeader } from './equipamentos/ui/headerMount.js';
import { configureToolbar, setToolbar as _setToolbar } from './equipamentos/ui/toolbar.js';
import { configureViewEquip, viewEquip } from './equipamentos/ui/viewEquip.js';

configureEquipContextState({ renderEquip });
configureToolbar({ Utils });
configureHeaderMount({
  Utils,
  mountHeaderBridge: mountEquipamentosHeaderBridge,
});
configureRenderFlatList({
  getState,
  Utils,
  createEquipRenderEvalContext: _createEquipRenderEvalContext,
  getPreventivaDueEquipmentIds,
  buildEquipamentosViewModel,
  buildReactListViewModel,
  resolveIdleClusterCollapsed: _resolveIdleClusterCollapsed,
  isCachedPlanPro,
  withSkeleton,
  mountEquipamentosList,
  bindEquipCardImageFallbacks: _bindEquipCardImageFallbacks,
});
configureRenderEquip({
  Utils,
  resolveEquipCtx: _resolveEquipCtx,
  stripRenderInternalOptions: _stripRenderInternalOptions,
  isCachedPlanPro,
  bindRenderEquipPlanInvalidationEvents,
  incrementRenderEquipPlanToken,
  getRenderEquipPlanNeedsRefresh,
  refreshRenderEquipPlan,
  populateSetorSelect,
  getState,
  getPreventivaDueEquipmentIds,
  buildEquipamentosHeaderViewModel,
  computeEquipKpis,
  mountEquipamentosHeader,
  setToolbar: _setToolbar,
  renderFlatList,
  renderSetorGrid,
  renderSetorGridForCliente,
  findSetor,
});
configureViewEquip({
  resolveViewEquipTarget: _resolveViewEquipTarget,
  buildViewEquipDetailModel,
  renderViewEquipDetailHtml,
  mountViewEquipDetail,
  bindViewEquipDetailCoverActions,
  openViewEquipDetailModal,
  regsForEquip,
  evaluateEquipmentHealth: (...args) => evaluateEquipmentHealth(...args),
  evaluateEquipmentRisk: (...args) => evaluateEquipmentRisk(...args),
  getHealthClass: (...args) => getHealthClass(...args),
  Utils,
  getSetores: () => getState().setores,
});
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
  startServiceRegistration,
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
configureOpenEditEquip({
  findEquip,
  Utils,
  setEditingEquipId,
  syncComponenteVisibility,
  restoreDadosPlaca,
  setCamposExtrasState,
  setNameplateMetadata,
  populateSetorSelect,
  setEquipActionButtonVisible,
  setEquipActionTrayButtonLabel,
  setEquipActionFooterHintVisible,
  focusEditField: _focusEditField,
  handleError,
  ErrorCodes,
  loadOperationalGateDeps: async () => {
    const [operationalPlan, plans, capture, usageLimits] = await Promise.all([
      import('../../core/plans/operationalPlan.js'),
      import('../../core/plans/subscriptionPlans.js'),
      import('../components/nameplateCapture.js'),
      import('../../core/usageLimits.js'),
    ]);
    return {
      ...operationalPlan,
      ...plans,
      ...capture,
      ...usageLimits,
    };
  },
  loadSupabase: () => import('../../core/supabase.js'),
  loadNameplateCapture: () => import('../components/nameplateCapture.js'),
  loadModal: () => import('../../core/modal.js'),
  documentRef: globalThis.document,
  requestAnimationFrameRef: (callback) => requestAnimationFrame(callback),
});
configureDeleteEquip({
  getState,
  setState,
  markEquipDeleted: (id, linkedRegistros) => Storage.markEquipDeleted(id, linkedRegistros),
  loadModal: () => import('../../core/modal.js'),
  handleError,
  ErrorCodes,
  renderEquip,
  updateGlobalHeader,
  Toast,
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
export {
  deleteEquip,
  getActiveQuickFilter,
  openEditEquip,
  renderEquip,
  saveEquip,
  setActiveSector,
  viewEquip,
};
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
// src/ui/views/equipamentos/utils/viewModels.js (Mudança 11 / CP-B).

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
// pra src/ui/views/equipamentos/utils/detail.js (Mudança 11 / CP-B).

/** @sliceTarget ui/detail */
function _resolveViewEquipTarget(id) {
  return findEquip(id);
}

/**
 * @sliceSplit
 *   ui/detail: HTML strings (cover, hero, risk panel, tech sheet, timeline, footer)
 *   risco: avaliacao de risk + classification + factors + suggested action
 * @sliceObs pre-split in-place em CP-G.0; manter adapter até CP-G.1.
 */
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
