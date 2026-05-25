export const TIPO_OUTRO_PREFIX = 'Outro · ';
export const PREVIOUS_TIPO_OUTRO_PREFIX = `Outro ${String.fromCharCode(0x00c2, 0x00b7)} `;
export const TIPO_CUSTOM_MAX = 40;

const deps = {};

const formFields = [
  { id: 'r-equip', validate: (value) => value !== '' },
  { id: 'r-data', validate: (value) => value !== '' },
  {
    id: 'r-tipo',
    validate: (value) => {
      if (value === '') return false;
      if (value === 'Outro') {
        const Utils = getDep('Utils');
        const custom = (Utils.getEl('r-tipo-custom')?.value || '').trim();
        return custom.length >= 1 && custom.length <= TIPO_CUSTOM_MAX;
      }
      return true;
    },
  },
  { id: 'r-tecnico', validate: (value) => value.trim() !== '' },
  { id: 'r-obs', validate: (value) => value.trim().length >= 10 },
];

export function configureRegistroFormUiController(options = {}) {
  Object.assign(deps, options);
}

function getDep(name) {
  const value = deps[name];
  if (!value) throw new Error(`[registroFormUiController] dependencia ausente: ${name}`);
  return value;
}

function isFilledMaterialValue(value) {
  const normalized = String(value ?? '').trim();
  return normalized !== '' && normalized !== '0' && normalized !== '0.00' && normalized !== '0,00';
}

export function updateImpactCopy(context) {
  const subtitle = document.getElementById('registro-impact-subtitle');
  const hint = document.getElementById('registro-impact-hint');
  if (!subtitle || !hint) return;

  if (context?.hasCompanyContext) {
    subtitle.textContent = 'opcional - status final e prioridade do atendimento';
    hint.textContent =
      'Se houve falha, risco ou pendência, ajuste o impacto para o acompanhamento do cliente.';
    return;
  }

  subtitle.textContent = 'opcional - status final e prioridade';
  hint.textContent = 'Se algo saiu do normal, ajuste o status e a prioridade.';
}

export function hasMateriaisValues(source = null) {
  const Utils = getDep('Utils');
  if (source) {
    return (
      isFilledMaterialValue(source.pecas) ||
      isFilledMaterialValue(source.custoPecas) ||
      isFilledMaterialValue(source.custoMaoObra)
    );
  }

  return (
    isFilledMaterialValue(Utils.getVal('r-pecas')) ||
    isFilledMaterialValue(Utils.getVal('r-custo-pecas')) ||
    isFilledMaterialValue(Utils.getVal('r-custo-mao-obra'))
  );
}

export function syncMateriaisDetailsState(expanded = null) {
  const details = document.getElementById(getDep('registroMateriaisDetailsId'));
  if (!details) return;

  if (typeof expanded === 'boolean') {
    if (expanded) details.setAttribute('open', '');
    else details.removeAttribute('open');
  }

  const isExpanded = details.hasAttribute('open');
  details.querySelector('summary')?.setAttribute('aria-expanded', String(isExpanded));
}

export function bindMateriaisDetailsToggle() {
  const details = document.getElementById(getDep('registroMateriaisDetailsId'));
  if (!details || details.dataset.bound === '1') return;

  details.dataset.bound = '1';
  const summary = details.querySelector('summary');
  summary?.addEventListener('click', () => {
    queueMicrotask(() => syncMateriaisDetailsState());
  });
  details.addEventListener('toggle', () => syncMateriaisDetailsState());
  syncMateriaisDetailsState(details.hasAttribute('open'));
}

export function hasImpactValues(source = null) {
  const Utils = getDep('Utils');
  const defaultRegistroStatus = getDep('defaultRegistroStatus');
  const defaultRegistroPrioridade = getDep('defaultRegistroPrioridade');
  const status = String(source?.status ?? Utils.getVal('r-status') ?? '').trim();
  const prioridade = String(source?.prioridade ?? Utils.getVal('r-prioridade') ?? '').trim();
  return (
    (status && status !== defaultRegistroStatus) ||
    (prioridade && prioridade !== defaultRegistroPrioridade)
  );
}

export function syncImpactDetailsState(expanded = null) {
  const details = document.getElementById(getDep('registroImpactDetailsId'));
  if (!details) return;

  if (typeof expanded === 'boolean') {
    if (expanded) details.setAttribute('open', '');
    else details.removeAttribute('open');
  }

  const isExpanded = details.hasAttribute('open');
  details.querySelector('summary')?.setAttribute('aria-expanded', String(isExpanded));
}

export function bindImpactDetailsToggle() {
  const details = document.getElementById(getDep('registroImpactDetailsId'));
  if (!details || details.dataset.bound === '1') return;

  details.dataset.bound = '1';
  const summary = details.querySelector('summary');
  summary?.addEventListener('click', () => {
    queueMicrotask(() => syncImpactDetailsState());
  });
  details.addEventListener('toggle', () => syncImpactDetailsState());
  syncImpactDetailsState(details.hasAttribute('open'));
}

export function syncTipoCustomVisibility({ focusOnShow = false } = {}) {
  const Utils = getDep('Utils');
  const sel = Utils.getEl('r-tipo');
  const wrap = document.getElementById('r-tipo-custom-wrap');
  const input = Utils.getEl('r-tipo-custom');
  if (!sel || !wrap || !input) return;

  const isOutro = sel.value === 'Outro';
  wrap.hidden = !isOutro;
  if (isOutro) {
    input.setAttribute('required', '');
    input.setAttribute('aria-required', 'true');
    if (focusOnShow) {
      setTimeout(() => input.focus(), 30);
    }
  } else {
    input.removeAttribute('required');
    input.removeAttribute('aria-required');
    input.value = '';
  }
}

export function ensureProgressBar(_formView) {
  // No-op mantido para compatibilidade: o markup do meter ja vem no template.
}

export function updateProgressBar() {
  const Utils = getDep('Utils');
  const total = formFields.length;
  const filled = formFields.filter((field) => {
    const input = Utils.getEl(field.id);
    return input && field.validate(input.value);
  }).length;

  const hero = document.getElementById(getDep('heroId'));
  const meter = document.getElementById(getDep('meterId'));
  const count = document.getElementById(getDep('progressCountId'));

  if (count) count.textContent = String(filled);

  if (meter) {
    const segments = meter.querySelectorAll('.registro-hero__seg');
    segments.forEach((segment, index) => {
      segment.classList.toggle('is-filled', index < filled);
    });
    meter.setAttribute('aria-valuenow', String(filled));
    meter.setAttribute('aria-valuemax', String(total));
  }

  if (hero) {
    hero.dataset.state = filled === 0 ? 'empty' : filled === total ? 'complete' : 'partial';
  }
}

export function bindProgressFieldHandlers() {
  const Utils = getDep('Utils');
  formFields.forEach((field) => {
    const input = Utils.getEl(field.id);
    if (!input || input.dataset.registroProgressBound === '1') return;
    input.dataset.registroProgressBound = '1';
    input.addEventListener('input', updateProgressBar);
    input.addEventListener('change', updateProgressBar);
  });
}

export function renderHeroSub() {
  const sub = document.getElementById(getDep('heroSubId'));
  if (!sub) return;
  const now = new Date();
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const meses = [
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const parts = [
    dias[now.getDay()],
    `${now.getDate()} ${meses[now.getMonth()]} ${now.getFullYear()}`,
    `${hh}:${mm}`,
  ];
  sub.innerHTML = parts
    .map(
      (part, index) =>
        `<span>${part}</span>${index < parts.length - 1 ? '<span class="registro-hero__sub-dot" aria-hidden="true"></span>' : ''}`,
    )
    .join('');
}

export function bindEquipChangeWarning() {
  const Utils = getDep('Utils');
  const editingKey = getDep('editingKey');
  const resetEditingState = getDep('resetEditingState');
  const clearRegistro = getDep('clearRegistro');
  const lastRegForEquip = getDep('lastRegForEquip');

  const sel = Utils.getEl('r-equip');
  if (!sel) return;
  if (sel.dataset.registroEquipWarningBound === '1') return;
  sel.dataset.registroEquipWarningBound = '1';
  sel.addEventListener('change', () => {
    const id = sel.value;
    const currentEditingId = sessionStorage.getItem(editingKey);
    if (currentEditingId) {
      resetEditingState();
      clearRegistro();
      if (id) Utils.setVal('r-equip', id);
    }
    document.getElementById('reg-pending-warning')?.remove();
    if (!id) return;
    const lastReg = lastRegForEquip(id);
    if (lastReg && Utils.daysDiff(lastReg.proxima) >= 0) {
      const warning = document.createElement('div');
      warning.id = 'reg-pending-warning';
      warning.className = 'reg-pending-warning';
      warning.textContent = 'Manutenção preventiva agendada. Registre apenas em emergência.';
      sel.parentNode.parentNode.insertBefore(warning, sel.parentNode.nextSibling);
    }
  });
}
