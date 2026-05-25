import {
  PREVIOUS_TIPO_OUTRO_PREFIX,
  TIPO_OUTRO_PREFIX,
  hasImpactValues,
  hasMateriaisValues,
  syncImpactDetailsState,
  syncMateriaisDetailsState,
  syncTipoCustomVisibility,
  updateProgressBar,
} from './formUiController.js';

const deps = {};

export function configureRegistroEditClearController(options = {}) {
  Object.assign(deps, options);
}

function getDep(name) {
  const value = deps[name];
  if (!value) throw new Error(`[registroEditClearController] dependencia ausente: ${name}`);
  return value;
}

function resetRegistroBaseFieldsAfterClear(preserveEquip = false) {
  getDep('Utils').clearVals(...getDep('getClearRegistroFieldIds')(preserveEquip));
}

function resetRegistroDefaultFieldsAfterClear() {
  const Utils = getDep('Utils');
  Utils.setVal('r-status', getDep('defaultRegistroStatus'));
  Utils.setVal('r-prioridade', getDep('defaultRegistroPrioridade'));
  Utils.setVal('r-data', Utils.nowDatetime());
}

function resetRegistroDetailsAfterClear() {
  syncTipoCustomVisibility();
  syncMateriaisDetailsState(false);
  syncImpactDetailsState(false);
}

function resetRegistroQuickTemplateChipsAfterClear() {
  document
    .querySelectorAll('.registro-quick [data-action="quick-service-template"]')
    .forEach((chip) => {
      chip.classList.remove('is-active');
      chip.setAttribute('aria-pressed', 'false');
    });
}

function resetRegistroTechnicianDefaultAfterClear() {
  const tecnicoInput = getDep('Utils').getEl('r-tecnico');
  if (tecnicoInput) tecnicoInput.value = getDep('Profile').getDefaultTecnico();
}

function restoreRegistroLastClientAfterClear() {
  const Utils = getDep('Utils');
  const lastClient = getDep('loadLastClient')();
  if (lastClient) {
    if (lastClient.clienteNome) Utils.setVal('r-cliente-nome', lastClient.clienteNome);
    if (lastClient.clienteDocumento)
      Utils.setVal('r-cliente-documento', lastClient.clienteDocumento);
    if (lastClient.localAtendimento)
      Utils.setVal('r-local-atendimento', lastClient.localAtendimento);
    if (lastClient.clienteContato) Utils.setVal('r-cliente-contato', lastClient.clienteContato);
  }
}

function resetRegistroSaveButtonAfterClear() {
  const saveBtn = document.querySelector('[data-action="save-registro"]');
  if (saveBtn) {
    const saveLabel = saveBtn.querySelector('span');
    if (saveLabel) saveLabel.textContent = 'Salvar serviço';
    else saveBtn.textContent = 'Salvar serviço';
    saveBtn.classList.remove('btn--editing');
  }
}

function resetRegistroHeroAfterClear() {
  const heroPill = document.getElementById(getDep('heroPillTextId'));
  if (heroPill) heroPill.textContent = 'Novo registro';
  const title = document.querySelector('#view-registro .section-title');
  if (title) title.textContent = 'O que foi feito hoje?';
}

export function clearRegistroFlow(preserveEquip = false) {
  resetRegistroBaseFieldsAfterClear(preserveEquip);
  getDep('resetEditingState')();
  resetRegistroDefaultFieldsAfterClear();
  resetRegistroDetailsAfterClear();
  updateProgressBar();
  resetRegistroQuickTemplateChipsAfterClear();
  getDep('resetChecklist')();
  resetRegistroTechnicianDefaultAfterClear();
  restoreRegistroLastClientAfterClear();
  resetRegistroSaveButtonAfterClear();
  resetRegistroHeroAfterClear();
  getDep('refreshRegistroContext')();
}

function enterRegistroEditMode(id) {
  const Utils = getDep('Utils');
  sessionStorage.setItem(getDep('editingKey'), id);
  const formViewEdit = Utils.getEl('view-registro');
  if (formViewEdit) formViewEdit.dataset.editMode = '1';
  getDep('setRouteGuard')(getDep('confirmLeaveEditingGuard'));
}

function fillRegistroEditBaseFields(registro) {
  const Utils = getDep('Utils');
  Utils.setVal('r-equip', registro.equipId);
  Utils.setVal('r-data', registro.data);
}

function fillRegistroEditTypeFields(registro) {
  const Utils = getDep('Utils');
  const outroPrefix =
    typeof registro.tipo === 'string' && registro.tipo.startsWith(PREVIOUS_TIPO_OUTRO_PREFIX)
      ? PREVIOUS_TIPO_OUTRO_PREFIX
      : TIPO_OUTRO_PREFIX;
  if (typeof registro.tipo === 'string' && registro.tipo.startsWith(outroPrefix)) {
    Utils.setVal('r-tipo', 'Outro');
    Utils.setVal('r-tipo-custom', registro.tipo.slice(outroPrefix.length));
  } else {
    Utils.setVal('r-tipo', registro.tipo);
    Utils.setVal('r-tipo-custom', '');
  }
  syncTipoCustomVisibility();
}

function fillRegistroEditOperationalFields(registro) {
  const Utils = getDep('Utils');
  Utils.setVal('r-obs', registro.obs);
  Utils.setVal('r-tecnico', registro.tecnico || '');
  Utils.setVal('r-status', registro.status || getDep('defaultRegistroStatus'));
  Utils.setVal('r-prioridade', registro.prioridade || getDep('defaultRegistroPrioridade'));
  syncImpactDetailsState(hasImpactValues(registro));
  Utils.setVal('r-pecas', registro.pecas || '');
  Utils.setVal('r-custo-pecas', registro.custoPecas ?? '');
  Utils.setVal('r-custo-mao-obra', registro.custoMaoObra ?? '');
  syncMateriaisDetailsState(hasMateriaisValues(registro));
}

function fillRegistroEditClientFields(registro) {
  const Utils = getDep('Utils');
  Utils.setVal('r-cliente-nome', registro.clienteNome || '');
  Utils.setVal('r-cliente-documento', registro.clienteDocumento || '');
  Utils.setVal('r-local-atendimento', registro.localAtendimento || '');
  Utils.setVal('r-cliente-contato', registro.clienteContato || '');
}

function restoreRegistroEditChecklist(registro) {
  if (registro.checklist && typeof registro.checklist === 'object') {
    getDep('loadChecklistForEdit')(registro.checklist);
  } else {
    getDep('renderChecklist')();
  }
}

function syncRegistroEditActionState() {
  const btn = document.querySelector('[data-action="save-registro"]');
  if (btn) {
    const label = btn.querySelector('span');
    if (label) label.textContent = 'Salvar alterações';
    else btn.textContent = 'Salvar alterações';
    btn.classList.add('btn--editing');
  }
}

function syncRegistroEditHeroContext() {
  const heroPill = document.getElementById(getDep('heroPillTextId'));
  if (heroPill) heroPill.textContent = 'Editando serviço';
  const title = document.querySelector('#view-registro .section-title');
  if (title) title.textContent = 'Editar serviço';
  getDep('refreshRegistroContext')();
}

export function loadRegistroForEditFlow(id) {
  const { registros } = getDep('getState')();
  const registro = getDep('resolveRegistroEditTarget')(registros, id);
  if (!registro) return;

  enterRegistroEditMode(id);
  fillRegistroEditBaseFields(registro);
  fillRegistroEditTypeFields(registro);
  fillRegistroEditOperationalFields(registro);
  fillRegistroEditClientFields(registro);
  restoreRegistroEditChecklist(registro);
  syncRegistroEditActionState();
  syncRegistroEditHeroContext();
}
