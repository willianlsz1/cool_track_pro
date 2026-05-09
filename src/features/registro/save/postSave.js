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

export async function runRegistroDirectShareAfterSave(
  { equipId, registroId } = {},
  { Toast, shareWhatsAppFlow, goTo, showProximaPreventivaPrompt } = {},
) {
  Toast?.success?.('Serviço salvo. Abrindo WhatsApp...');
  try {
    const filters = { equipId, registroId };
    const ok = await shareWhatsAppFlow?.({ filters });
    // Se share falhou/cancelado, cai pro fallback indo pra /relatorio.
    // Sem mostrar toast extra - shareWhatsAppFlow ja exibe feedback.
    if (!ok) {
      goTo?.('relatorio', { equipId, intent: 'whatsapp', registroId });
    }
  } catch (_error) {
    // Erro inesperado - leva pro relatorio com intent pra user retentar.
    goTo?.('relatorio', { equipId, intent: 'whatsapp', registroId });
  }
  runRegistroPreventivaPromptAfterSave(registroId, { showProximaPreventivaPrompt });
  return true;
}

export function notifyRegistroCreateSaved(
  { equipId, registroId, saveContext } = {},
  { PostSaveRegistroToast, exportPdfFlow, shareWhatsAppFlow, goTo, Toast } = {},
) {
  // Feedback pos-save padrao (botao "So salvar" / fluxo legado): toast rico
  // com CTAs PDF/WhatsApp. Os CTAs executam acoes diretas mantendo as
  // mesmas regras de quota/validacao do fluxo de relatorio.
  const eqForToast = saveContext.equipamentos.find((e) => e.id === equipId) || null;
  const toastShown = PostSaveRegistroToast?.show?.({
    equipId,
    registroId,
    equipName: eqForToast?.nome || null,
    onAction: async ({ destination, equipId: targetEquipId, registroId }) => {
      const filters = { equipId: targetEquipId, registroId };
      if (destination === 'pdf') return exportPdfFlow?.({ filters });
      return shareWhatsAppFlow?.({ filters });
    },
    onFallback: ({ destination, equipId: targetEquipId, registroId }) => {
      goTo?.('relatorio', {
        equipId: targetEquipId,
        intent: destination,
        ...(registroId ? { registroId } : {}),
      });
    },
  });
  // Fallback: se nao tinha equipId (edge case) ou o toast recusou renderizar,
  // volta pro feedback simples - user ainda precisa saber que salvou.
  if (!toastShown) {
    Toast?.success?.('Serviço registrado com sucesso.');
  }
}
