export function runSaveEquipPostActions({
  keepOpen,
  openRegistro,
  payload,
  focusNameInput,
  goTo,
  startServiceRegistration,
}) {
  const equipId = payload?.equipId;

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
}
