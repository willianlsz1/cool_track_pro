let saveEquipDeps = null;

export function configureSaveEquip(deps) {
  saveEquipDeps = deps;
}

function getConfiguredSaveEquipDeps() {
  if (!saveEquipDeps) {
    throw new Error('saveEquip não configurado. Chame configureSaveEquip antes de salvar.');
  }
  return saveEquipDeps;
}

/**
 * @sliceSplit
 *   crud/equip: validacao + persistencia (state + storage + Supabase) + plan limit
 *   ui/modal: clearEditingState + closeModal + Toast feedback
 *   controller/post: dispatch das post-actions (clone, register, pmoc, save-without-client)
 * @sliceObs orquestrador movido do adapter em CP-F.4; dependências de UI seguem injetadas.
 */
export async function saveEquip(options = {}) {
  const {
    getSaveEquipPostActionContext,
    getState,
    getEditingEquipId,
    checkSaveEquipPlanLimit,
    checkPlanLimit,
    trackEvent,
    Toast,
    goTo,
    collectSaveEquipBaseFormValues,
    getValue,
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
    createId,
    findEquip,
    normalizePhotoList,
    tiposComComponente,
    applySaveEquipToState,
    setState,
    updateSaveEquipInState,
    createSaveEquipInState,
    finishSaveEquipSuccess,
    closeSaveEquipModal,
    resetSaveEquipForm,
    refreshSaveEquipViews,
    toastSuccess,
    runSaveEquipPostActions,
    focusNameInput,
    requestAnimationFrameRef,
    documentRef,
  } = getConfiguredSaveEquipDeps();

  const postActionContext = getSaveEquipPostActionContext(options);
  const { equipamentos } = getState();

  const isPlanLimitAllowed = await checkSaveEquipPlanLimit({
    equipamentos,
    editingId: getEditingEquipId(),
    checkPlanLimit,
    trackEvent,
    Toast,
    goTo,
  });
  if (!isPlanLimitAllowed) return false;

  const baseFormValues = collectSaveEquipBaseFormValues({ getValue });
  const payloadValidation = validateSaveEquipPayload({
    equipamentos,
    editingId: getEditingEquipId(),
    getValue,
    validateEquipamentoPayload,
    Toast,
  });
  if (!payloadValidation) return false;

  const contextFormValues = collectSaveEquipContextFormValues({
    baseFormValues,
    saveWithoutClient: postActionContext.saveWithoutClient,
    getValue,
    getForcedEquipContext,
    normalizePeriodicidadePreventivaDias,
  });
  const extraFormValues = collectSaveEquipExtraFormValues({ getValue });
  const formValues = { ...contextFormValues, ...extraFormValues };
  const dadosPlacaResult = collectSaveEquipDadosPlaca({
    collectDadosPlaca,
    DadosPlacaValidationError,
    formatDecimalHint,
    Toast,
  });
  if (!dadosPlacaResult.ok) return false;

  const payload = buildSaveEquipPayload({
    formValues,
    payloadValidation,
    dadosPlaca: dadosPlacaResult.dadosPlaca,
    editingId: getEditingEquipId(),
    createId,
    findEquip,
    normalizePhotoList,
    tiposComComponente,
  });
  applySaveEquipToState({
    setState,
    editingId: getEditingEquipId(),
    payload,
    updateMutation: updateSaveEquipInState,
    createMutation: createSaveEquipInState,
  });

  const wasEditing = Boolean(getEditingEquipId());
  await finishSaveEquipSuccess({
    keepOpen: postActionContext.keepOpen,
    wasEditing,
    closeModal: closeSaveEquipModal,
    resetForm: resetSaveEquipForm,
    refreshViews: refreshSaveEquipViews,
    toastSuccess,
  });
  runSaveEquipPostActions({
    keepOpen: postActionContext.keepOpen,
    openRegistro: postActionContext.openRegistro,
    openPmoc: postActionContext.openPmoc,
    payload,
    focusNameInput,
    goTo,
    requestAnimationFrameRef,
    documentRef,
  });

  return true;
}
