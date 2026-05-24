const deleteEquipDeps = {
  getState: null,
  setState: null,
  markEquipDeleted: null,
  loadModal: null,
  handleError: null,
  ErrorCodes: null,
  renderEquip: null,
  updateGlobalHeader: null,
  Toast: null,
};

export function configureDeleteEquip(deps = {}) {
  Object.assign(deleteEquipDeps, deps);
}

function getDeleteEquipDep(name) {
  const dep = deleteEquipDeps[name];
  if (!dep) {
    throw new Error(`deleteEquip dependency not configured: ${name}`);
  }
  return dep;
}

function collectDeleteEquipRelatedRecords(id) {
  const { registros } = getDeleteEquipDep('getState')();
  return registros.filter((r) => r.equipId === id).map((r) => r.id);
}

function persistDeleteEquipRemoval(id, linkedRegistros) {
  getDeleteEquipDep('markEquipDeleted')(id, linkedRegistros);
}

function applyDeleteEquipStateMutation(id) {
  getDeleteEquipDep('setState')((prev) => ({
    ...prev,
    equipamentos: prev.equipamentos.filter((e) => e.id !== id),
    registros: prev.registros.filter((r) => r.equipId !== id),
  }));
}

async function closeDeleteEquipDetailModal(id) {
  try {
    const { Modal: M } = await getDeleteEquipDep('loadModal')();
    M.close('modal-eq-det');
  } catch (error) {
    getDeleteEquipDep('handleError')(error, {
      code: getDeleteEquipDep('ErrorCodes').NETWORK_ERROR,
      message: 'Equipamento removido, mas não foi possível fechar o modal.',
      context: { action: 'equipamentos.deleteEquip.closeModal', id },
      severity: 'warning',
    });
  }
}

function refreshDeleteEquipViews() {
  getDeleteEquipDep('renderEquip')();
  getDeleteEquipDep('updateGlobalHeader')();
}

function notifyDeleteEquipSuccess() {
  getDeleteEquipDep('Toast').info('Equipamento removido.');
}

export async function deleteEquip(id) {
  const linkedRegistros = collectDeleteEquipRelatedRecords(id);
  persistDeleteEquipRemoval(id, linkedRegistros);
  applyDeleteEquipStateMutation(id);
  await closeDeleteEquipDetailModal(id);
  refreshDeleteEquipViews();
  notifyDeleteEquipSuccess();
}
