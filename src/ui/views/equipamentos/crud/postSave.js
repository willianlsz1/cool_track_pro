export async function finishSaveEquipSuccess({
  keepOpen,
  wasEditing,
  closeModal,
  resetForm,
  refreshViews,
  toastSuccess,
}) {
  await closeModal(keepOpen);
  resetForm(keepOpen);
  await refreshViews();
  toastSuccess(wasEditing ? 'Equipamento atualizado.' : 'Equipamento cadastrado.');
}
