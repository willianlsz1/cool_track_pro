import { REGISTRO_MODES } from '../../viewModels/registroContracts.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = text(value);
}

function setHidden(id, hidden) {
  const el = document.getElementById(id);
  if (el) el.hidden = Boolean(hidden);
}

function setValue(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null) el.value = String(value);
}

function syncHero(viewModel) {
  const progress = viewModel?.progress || {};
  const total = Number(progress.total || 5) || 5;
  const filled = Math.max(0, Math.min(total, Number(progress.filled || 0) || 0));
  const state = text(
    progress.state,
    filled === 0 ? 'empty' : filled === total ? 'complete' : 'partial',
  );
  const hero = document.getElementById('registro-hero');
  const meter = document.getElementById('registro-hero-meter');

  if (hero) hero.dataset.state = state;
  if (meter) {
    meter.setAttribute('aria-valuemax', String(total));
    meter.setAttribute('aria-valuenow', String(filled));
    const segments = Array.from(meter.querySelectorAll('.registro-hero__seg'));
    segments.forEach((segment, index) => {
      segment.classList.toggle('is-filled', index < filled);
    });
  }

  setText('form-progress-count', filled);
  setText(
    'registro-hero-pill-text',
    viewModel?.mode === REGISTRO_MODES.edit ? 'Editando serviço' : 'Novo registro',
  );
}

function syncEquipmentOptions(equipmentOptions, selectedEquipamento, form) {
  const select = document.getElementById('r-equip');
  if (!select) return;

  const currentValue = text(form?.equipId || select.value);
  select.replaceChildren();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Selecione o equipamento...';
  select.append(placeholder);

  asArray(equipmentOptions).forEach((option) => {
    const item = document.createElement('option');
    item.value = text(option?.id);
    item.textContent = text(option?.label);
    select.append(item);
  });

  select.value = currentValue;

  const selectedName = text(selectedEquipamento?.nome, 'Selecione o equipamento...');
  const selectedMeta = text(selectedEquipamento?.meta);
  setText('r-equip-name', selectedName);
  document
    .getElementById('r-equip-name')
    ?.classList.toggle('registro-equip-trigger__name--placeholder', !currentValue);
  setText('r-equip-meta', selectedMeta);
  setHidden('r-equip-meta', !selectedMeta);
}

function syncTechnicians(technicianOptions) {
  const tecnico = document.getElementById('r-tecnico');
  const datalist = document.getElementById('lista-tecnicos');
  tecnico?.setAttribute('list', 'lista-tecnicos');
  if (!datalist) return;

  datalist.replaceChildren(
    ...asArray(technicianOptions).map((option) => {
      const item = document.createElement('option');
      item.value = text(option);
      return item;
    }),
  );
}

function syncFields(viewModel) {
  const form = viewModel?.form || {};
  setValue('r-equip', form.equipId);
  setValue('r-data', form.data);
  setValue('r-tipo', form.tipo);
  setValue('r-tipo-custom', form.tipoCustom);
  setValue('r-obs', form.obs);
  setValue('r-tecnico', form.tecnico);

  const customWrap = document.getElementById('r-tipo-custom-wrap');
  const customInput = document.getElementById('r-tipo-custom');
  const customVisible = text(form.tipo) === 'Outro';
  if (customWrap) customWrap.hidden = !customVisible;
  if (customInput) {
    customInput.required = customVisible;
    if (customVisible) customInput.setAttribute('aria-required', 'true');
    else customInput.removeAttribute('aria-required');
  }
}

function syncContext(context) {
  const data = context || {};
  const hasContext = Boolean(data.hasCompanyContext);
  const equipamento = data.equipamento || {};
  const equipName = text(equipamento.nome, 'Não informado');
  const equipTag = text(equipamento.tag);
  const equipLabel = equipTag ? `${equipName} · TAG ${equipTag}` : equipName;
  const showHint = Boolean(data.missingEquipFromParams || data.shouldWarnEquipmentOnly);
  const hint = data.missingEquipFromParams
    ? 'Equipamento não encontrado. Confira o cadastro ou escolha outro equipamento.'
    : data.shouldWarnEquipmentOnly
      ? 'Este serviço ficará apenas no histórico do equipamento.'
      : '';

  setHidden('registro-context-card', !hasContext);
  setText('registro-context-cliente', text(data.cliente?.nome, 'Não informado'));
  setText('registro-context-setor', text(data.setor?.nome, 'Não informado'));
  setText('registro-context-equip', equipLabel);
  setHidden('registro-context-hint', !showHint);
  setText('registro-context-hint', hint);
}

export function renderRegistroHeader(
  root = document.getElementById('registro-header-root'),
  props = {},
) {
  if (!root) return null;

  const viewModel = props.viewModel || {};
  root.dataset.registroHeaderMounted = 'true';

  syncHero(viewModel);
  syncEquipmentOptions(props.equipmentOptions, viewModel.selectedEquipamento, viewModel.form);
  syncTechnicians(props.technicianOptions);
  syncFields(viewModel);
  syncContext(viewModel.context);

  return root;
}

export function unmountRegistroHeaderDom(root = document.getElementById('registro-header-root')) {
  if (!root?.dataset.registroHeaderMounted) return null;
  delete root.dataset.registroHeaderMounted;
  return null;
}
