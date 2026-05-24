export function persistRegistroLastClientAfterSave(
  persistedPayload,
  { saveRegistroLastClient } = {},
) {
  saveRegistroLastClient?.(persistedPayload);
}

export function applyRegistroSavedHighlight(registroId, { SavedHighlight } = {}) {
  SavedHighlight?.markForHighlight?.(registroId);
}

export function resetRegistroEditAfterSave({ resetEditingState, clearRegistro } = {}) {
  resetEditingState?.();
  clearRegistro?.();
}

export function resetRegistroCreateAfterSave({ clearRegistro } = {}) {
  clearRegistro?.();
}

export function notifyRegistroEditSaved({ Toast } = {}) {
  Toast?.success?.('Registro atualizado.');
}

export function runRegistroEditNavigationAfterSave({ goTo } = {}) {
  goTo?.('historico');
}

export function runRegistroPreventivaPromptAfterSave(
  registroId,
  { showProximaPreventivaPrompt } = {},
) {
  void showProximaPreventivaPrompt?.(registroId);
}

export function notifyRegistroCreateSaved(
  { equipId, registroId, saveContext } = {},
  { PostSaveRegistroToast, Toast } = {},
) {
  // Feedback pos-save padrao. CTAs externos foram aposentados no CP54C1.
  const eqForToast = saveContext.equipamentos.find((e) => e.id === equipId) || null;
  const toastShown = PostSaveRegistroToast?.show?.({
    equipId,
    registroId,
    equipName: eqForToast?.nome || null,
  });
  // Fallback: se nao tinha equipId (edge case) ou o toast recusou renderizar,
  // volta pro feedback simples - user ainda precisa saber que salvou.
  if (!toastShown) {
    Toast?.success?.('Serviço registrado com sucesso.');
  }
}
