const openEditEquipDeps = {
  findEquip: null,
  Utils: null,
  setEditingEquipId: null,
  syncComponenteVisibility: null,
  restoreDadosPlaca: null,
  setCamposExtrasState: null,
  setNameplateMetadata: null,
  populateSetorSelect: null,
  setEquipActionButtonVisible: null,
  setEquipActionTrayButtonLabel: null,
  setEquipActionFooterHintVisible: null,
  focusEditField: null,
  handleError: null,
  ErrorCodes: null,
  loadOperationalGateDeps: null,
  loadSupabase: null,
  loadNameplateCapture: null,
  loadModal: null,
  documentRef: null,
  requestAnimationFrameRef: null,
};

export function configureOpenEditEquip(deps = {}) {
  Object.assign(openEditEquipDeps, deps);
}

function getRequiredOpenEditEquipDep(name) {
  const dep = openEditEquipDeps[name];
  if (!dep) {
    throw new Error(`openEditEquip dependency not configured: ${name}`);
  }
  return dep;
}

function resolveOpenEditEquipTarget(id, opts = {}) {
  const eq = getRequiredOpenEditEquipDep('findEquip')(id);
  const focusField = typeof opts?.focusField === 'string' ? opts.focusField : null;

  return { eq, focusField };
}

function fillOpenEditEquipBaseForm(eq) {
  const Utils = getRequiredOpenEditEquipDep('Utils');
  Utils.setVal('eq-nome', eq.nome || '');
  Utils.setVal('eq-local', eq.local || '');
  Utils.setVal('eq-tag', eq.tag || '');
  Utils.setVal('eq-tipo', eq.tipo || 'Split Hi-Wall');
  Utils.setVal('eq-fluido', eq.fluido || 'R-410A');
}

function syncOpenEditEquipComponentFields(eq) {
  const Utils = getRequiredOpenEditEquipDep('Utils');
  getRequiredOpenEditEquipDep('syncComponenteVisibility')();
  if (eq.componente) Utils.setVal('eq-componente', eq.componente);
}

function fillOpenEditEquipTechnicalForm(eq) {
  const Utils = getRequiredOpenEditEquipDep('Utils');
  Utils.setVal('eq-modelo', eq.modelo || '');
  Utils.setVal('eq-criticidade', eq.criticidade || 'media');
  Utils.setVal('eq-prioridade', eq.prioridadeOperacional || 'normal');
  Utils.setVal('eq-periodicidade', String(eq.periodicidadePreventivaDias || 90));
}

function restoreOpenEditEquipNameplate(eq) {
  getRequiredOpenEditEquipDep('restoreDadosPlaca')(eq.dadosPlaca);
  try {
    const extras = Array.isArray(eq.dadosPlaca?.camposExtras) ? eq.dadosPlaca.camposExtras : [];
    getRequiredOpenEditEquipDep('setCamposExtrasState')(extras);
    getRequiredOpenEditEquipDep('setNameplateMetadata')({
      source: eq.dadosPlaca?._source === 'ai' ? 'ai' : 'manual',
      notas: eq.dadosPlaca?.notas || null,
    });
  } catch (_e) {
    /* review UI pode ainda nao ter montado - ok, ficara vazia */
  }
}

function markOpenEditEquipManualPeriodicity() {
  const periodicidadeInput = getRequiredOpenEditEquipDep('Utils').getEl('eq-periodicidade');
  if (periodicidadeInput) periodicidadeInput.dataset.manual = '1';
}

function expandOpenEditEquipDetailsPanel() {
  const detailsPanel = getRequiredOpenEditEquipDep('Utils').getEl('eq-step-2');
  if (detailsPanel) {
    detailsPanel.style.display = 'block';
    detailsPanel.setAttribute('aria-hidden', 'false');
  }
}

async function applyOpenEditEquipOperationalGates() {
  try {
    const { applyNameplateCtaGate } =
      await getRequiredOpenEditEquipDep('loadOperationalGateDeps')();
    getRequiredOpenEditEquipDep('populateSetorSelect')(true);
    applyNameplateCtaGate({ isPlusOrPro: true, trialRemaining: null });
  } catch {
    getRequiredOpenEditEquipDep('populateSetorSelect')(true);
    try {
      const { applyNameplateCtaGate } = await getRequiredOpenEditEquipDep('loadNameplateCapture')();
      applyNameplateCtaGate({ isPlusOrPro: true, trialRemaining: null });
    } catch (_) {
      /* noop */
    }
  }
}

function syncOpenEditEquipContextFields(eq) {
  const Utils = getRequiredOpenEditEquipDep('Utils');
  if (eq.setorId) Utils.setVal('eq-setor', eq.setorId);
  if (eq.clienteId) {
    getRequiredOpenEditEquipDep('requestAnimationFrameRef')(() => {
      const select = getRequiredOpenEditEquipDep('documentRef').getElementById('eq-cliente');
      if (select) Utils.setVal('eq-cliente', eq.clienteId);
    });
  }
}

function syncOpenEditEquipActionTray() {
  const Utils = getRequiredOpenEditEquipDep('Utils');
  const documentRef = getRequiredOpenEditEquipDep('documentRef');
  const titleEl = Utils.getEl('modal-add-eq-title');
  if (titleEl) titleEl.textContent = 'Editar equipamento';
  const saveBtn = documentRef.getElementById('eq-save-primary');
  if (saveBtn) saveBtn.textContent = 'Salvar alterações →';
  const secondaryBtn = documentRef.getElementById('eq-save-secondary');
  const tertiaryRow = documentRef.getElementById('eq-save-tertiary-row');
  const tertiaryBtn = documentRef.getElementById('eq-save-tertiary');
  getRequiredOpenEditEquipDep('setEquipActionButtonVisible')(secondaryBtn, false);
  getRequiredOpenEditEquipDep('setEquipActionButtonVisible')(tertiaryBtn || tertiaryRow, false);
  if (tertiaryBtn) getRequiredOpenEditEquipDep('setEquipActionTrayButtonLabel')(tertiaryBtn, '');
  getRequiredOpenEditEquipDep('setEquipActionFooterHintVisible')(false);
}

async function openOpenEditEquipModal(id) {
  try {
    const { Modal: M } = await getRequiredOpenEditEquipDep('loadModal')();
    M.close('modal-eq-det');
    M.open('modal-add-eq');
  } catch (error) {
    getRequiredOpenEditEquipDep('handleError')(error, {
      code: getRequiredOpenEditEquipDep('ErrorCodes').NETWORK_ERROR,
      message: 'Não foi possível abrir o modal de edição.',
      context: { action: 'equipamentos.openEditEquip', id },
    });
    return false;
  }

  return true;
}

function focusOpenEditEquipField(focusField) {
  if (focusField) getRequiredOpenEditEquipDep('focusEditField')(focusField);
}

export async function openEditEquip(id, opts = {}) {
  const { eq, focusField } = resolveOpenEditEquipTarget(id, opts);
  if (!eq) return;

  getRequiredOpenEditEquipDep('setEditingEquipId')(id);
  fillOpenEditEquipBaseForm(eq);
  syncOpenEditEquipComponentFields(eq);
  fillOpenEditEquipTechnicalForm(eq);
  restoreOpenEditEquipNameplate(eq);
  markOpenEditEquipManualPeriodicity();
  expandOpenEditEquipDetailsPanel();
  await applyOpenEditEquipOperationalGates();
  syncOpenEditEquipContextFields(eq);
  syncOpenEditEquipActionTray();

  const modalOpened = await openOpenEditEquipModal(id);
  if (!modalOpened) return;

  focusOpenEditEquipField(focusField);
}
