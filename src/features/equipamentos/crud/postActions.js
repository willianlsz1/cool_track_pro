export function runSaveEquipPostActions({
  keepOpen,
  openRegistro,
  openPmoc,
  payload,
  focusNameInput,
  goTo,
  startServiceRegistration,
  requestAnimationFrameRef,
  documentRef,
}) {
  const equipId = payload?.equipId;
  const clienteId = payload?.clienteId;

  if (keepOpen) {
    focusNameInput?.();
    return;
  }

  if (openRegistro && equipId) {
    if (typeof startServiceRegistration === 'function') {
      startServiceRegistration({ equipId });
    } else {
      goTo('registro', { equipId });
    }
  }

  if (openPmoc) {
    goTo('relatorio');
    requestAnimationFrameRef(() => {
      requestAnimationFrameRef(() => {
        const pmocBtn = documentRef.querySelector('[data-action="open-pmoc-modal"]');
        if (!pmocBtn) return;
        if (clienteId) pmocBtn.dataset.clienteId = clienteId;
        pmocBtn.click();
      });
    });
  }
}
