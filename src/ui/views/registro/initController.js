import {
  bindEquipChangeWarning,
  bindImpactDetailsToggle,
  bindMateriaisDetailsToggle,
  bindProgressFieldHandlers,
  ensureProgressBar,
  hasImpactValues,
  hasMateriaisValues,
  renderHeroSub,
  syncImpactDetailsState,
  syncMateriaisDetailsState,
  syncTipoCustomVisibility,
  updateProgressBar,
} from './formUiController.js';

const deps = {};

export function configureRegistroInitController(options = {}) {
  Object.assign(deps, options);
}

function getDep(name) {
  const value = deps[name];
  if (!value) throw new Error(`[registroInitController] dependencia ausente: ${name}`);
  return value;
}

function bindRegistroHeaderFieldHandlers() {
  const Utils = getDep('Utils');
  const renderChecklist = getDep('renderChecklist');
  const refreshRegistroContext = getDep('refreshRegistroContext');
  const prefillObsFromTipo = getDep('prefillObsFromTipo');
  const refreshChecklistPriBadge = getDep('refreshChecklistPriBadge');
  const updateChecklistSummary = getDep('updateChecklistSummary');

  bindProgressFieldHandlers();
  bindEquipChangeWarning();

  const equipSelForChecklist = Utils.getEl('r-equip');
  if (equipSelForChecklist && equipSelForChecklist.dataset.registroChecklistBound !== '1') {
    equipSelForChecklist.dataset.registroChecklistBound = '1';
    equipSelForChecklist.addEventListener('change', () => {
      renderChecklist();
      refreshRegistroContext();
    });
  }

  const tipoSel = Utils.getEl('r-tipo');
  if (tipoSel && tipoSel.dataset.registroTipoBound !== '1') {
    tipoSel.dataset.registroTipoBound = '1';
    tipoSel.addEventListener('change', () => {
      syncTipoCustomVisibility({ focusOnShow: true });
      prefillObsFromTipo(tipoSel.value);
      updateProgressBar();
      refreshChecklistPriBadge();
    });
  }

  const tipoCustomInput = Utils.getEl('r-tipo-custom');
  if (tipoCustomInput && tipoCustomInput.dataset.registroTipoCustomBound !== '1') {
    tipoCustomInput.dataset.registroTipoCustomBound = '1';
    tipoCustomInput.addEventListener('input', () => {
      updateProgressBar();
      refreshChecklistPriBadge();
      updateChecklistSummary();
    });
  }
}

function resolveRegistroInitRoot() {
  return getDep('Utils').getEl('view-registro');
}

function syncRegistroInitRouteContext(params, effectiveEquipId) {
  const Utils = getDep('Utils');
  const setCurrentRouteParams = getDep('setCurrentRouteParams');
  const refreshRegistroContext = getDep('refreshRegistroContext');

  if (effectiveEquipId) Utils.setVal('r-equip', effectiveEquipId);
  setCurrentRouteParams({ ...params });
  refreshRegistroContext();
}

function mountRegistroInitHeader(params) {
  return Promise.resolve(getDep('mountRegistroHeader')(params));
}

function bindRegistroInitFormOnce(formView) {
  const Utils = getDep('Utils');
  const bindSmartContactMaskInput = getDep('bindSmartContactMaskInput');
  if (formView.dataset.bound) return;

  bindSmartContactMaskInput(Utils.getEl('r-cliente-contato'));
  formView.dataset.bound = '1';
}

function syncRegistroInitDetailsState(formView) {
  ensureProgressBar(formView);
  bindRegistroHeaderFieldHandlers();
  bindRegistroInitFormOnce(formView);

  syncTipoCustomVisibility();
  bindMateriaisDetailsToggle();
  syncMateriaisDetailsState(hasMateriaisValues());
  bindImpactDetailsToggle();
  syncImpactDetailsState(hasImpactValues());
  updateProgressBar();
}

function applyRegistroInitDateDefault() {
  const Utils = getDep('Utils');
  if (!Utils.getVal('r-data')) Utils.setVal('r-data', Utils.nowDatetime());
}

function bindRegistroInitDatetimeUX() {
  const Utils = getDep('Utils');
  const wrap = document.getElementById('registro-datetime-wrap');
  if (!wrap || wrap.dataset.bound === '1') return;
  wrap.dataset.bound = '1';

  const input = document.getElementById('r-data');
  const nowBtn = document.getElementById('r-data-now-btn');
  const editBtn = document.getElementById('r-data-edit-btn');
  const nowLabel = document.getElementById('r-data-now-label');

  function refreshLabel() {
    if (!input || !nowLabel) return;
    const val = input.value;
    if (!val) {
      nowLabel.textContent = 'Hoje agora';
      nowBtn?.setAttribute('aria-pressed', 'true');
      return;
    }
    const ts = new Date(val).getTime();
    if (Math.abs(Date.now() - ts) < 60_000) {
      nowLabel.textContent = 'Hoje agora';
      nowBtn?.setAttribute('aria-pressed', 'true');
    } else {
      const date = new Date(val);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      nowLabel.textContent = `${day}/${month} ${hour}:${minute}`;
      nowBtn?.setAttribute('aria-pressed', 'false');
    }
  }

  nowBtn?.addEventListener('click', () => {
    Utils.setVal('r-data', Utils.nowDatetime());
    refreshLabel();
    updateProgressBar();
  });

  editBtn?.addEventListener('click', () => {
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.focus();
      }
    } catch (_error) {
      input.focus();
    }
  });

  input?.addEventListener('change', () => {
    refreshLabel();
    updateProgressBar();
  });

  refreshLabel();
}

function applyRegistroInitTechnicianDefault() {
  const Utils = getDep('Utils');
  const Profile = getDep('Profile');
  const tecnicoInput = Utils.getEl('r-tecnico');
  if (tecnicoInput && !tecnicoInput.value) {
    const defaultTecnico = Profile.getDefaultTecnico();
    if (defaultTecnico) tecnicoInput.value = defaultTecnico;
  }
}

function resetRegistroInitEditingIfCreate(params) {
  if (!params.editRegistroId) getDep('resetEditingState')();
}

function applyRegistroInitPriorityDefault() {
  const prioridadeInput = getDep('Utils').getEl('r-prioridade');
  if (prioridadeInput && !prioridadeInput.value) prioridadeInput.value = 'media';
}

function runRegistroInitAfterHeaderMounted({ formView, params, effectiveEquipId }) {
  syncRegistroInitDetailsState(formView);
  renderHeroSub();
  applyRegistroInitDateDefault();
  bindRegistroInitDatetimeUX();
  applyRegistroInitTechnicianDefault();

  resetRegistroInitEditingIfCreate(params);
  syncRegistroInitRouteContext(params, effectiveEquipId);
  getDep('buildRegistroReadOnlyViewModel')(params);

  applyRegistroInitPriorityDefault();
}

export function initRegistroFlow(params = {}) {
  const formView = resolveRegistroInitRoot();
  if (!formView) return;
  const effectiveEquipId = getDep('resolveRegistroInitEquipId')(params);

  syncRegistroInitRouteContext(params, effectiveEquipId);

  getDep('withSkeleton')(formView, { enabled: true, variant: 'generic', count: 3 }, () =>
    mountRegistroInitHeader(params).then(() =>
      runRegistroInitAfterHeaderMounted({ formView, params, effectiveEquipId }),
    ),
  );
}
