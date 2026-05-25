const deps = {};

export function configureSetorModalController(options = {}) {
  Object.assign(deps, options);
}

function getDep(name) {
  const value = deps[name];
  if (!value) throw new Error(`[setorModalController] dependencia ausente: ${name}`);
  return value;
}

function setSaveBtnLabel(text) {
  const Utils = getDep('Utils');
  const btn = Utils.getEl('setor-save-btn');
  if (!btn) return;
  const label = btn.querySelector('.setor-modal__btn-label');
  if (label) label.textContent = text;
}

export function setSetorNomeValidationState({
  showError,
  focus = false,
  markTouched = false,
} = {}) {
  const Utils = getDep('Utils');
  const err = Utils.getEl('setor-nome-err');
  const nomeInput = Utils.getEl('setor-nome');
  if (err) err.hidden = !showError;
  if (nomeInput) {
    if (markTouched) nomeInput.dataset.touched = '1';
    nomeInput.setAttribute('aria-invalid', showError ? 'true' : 'false');
    if (focus) nomeInput.focus();
  }
}

function syncSetorSaveButtonState() {
  const Utils = getDep('Utils');
  const getSetorNomeValidation = getDep('getSetorNomeValidation');
  const saveBtn = Utils.getEl('setor-save-btn');
  if (!saveBtn) return;
  const { isValid } = getSetorNomeValidation(Utils.getVal('setor-nome') || '');
  saveBtn.disabled = !isValid;
  saveBtn.setAttribute('aria-disabled', isValid ? 'false' : 'true');
}

export function clearSetorEditingState() {
  const Utils = getDep('Utils');
  const setEditingSetorId = getDep('setEditingSetorId');
  const SETOR_PALETTE = getDep('SETOR_PALETTE');

  setEditingSetorId(null);
  const titleEl = Utils.getEl('modal-add-setor-title');
  if (titleEl) titleEl.textContent = 'Novo setor';
  setSaveBtnLabel('Criar setor →');

  Utils.setVal('setor-nome', '');
  Utils.setVal('setor-descricao', '');
  Utils.setVal('setor-responsavel', '');
  const hiddenInput = Utils.getEl('setor-cor');
  if (hiddenInput) hiddenInput.value = SETOR_PALETTE[0].hex;

  const clienteHidden = Utils.getEl('setor-cliente-id');
  if (clienteHidden) clienteHidden.value = '';
  const clienteBadge = Utils.getEl('setor-cliente-badge');
  if (clienteBadge) clienteBadge.hidden = true;

  const picker = Utils.getEl('setor-color-picker');
  if (picker) {
    picker.querySelectorAll('.setor-modal__swatch').forEach((btn) => {
      const cell = btn.closest('.setor-modal__swatch-cell');
      const isFirst = btn.dataset.cor === SETOR_PALETTE[0].hex;
      btn.classList.toggle('setor-modal__swatch--selected', isFirst);
      btn.setAttribute('aria-checked', isFirst ? 'true' : 'false');
      if (cell) cell.classList.toggle('setor-modal__swatch-cell--selected', isFirst);
    });
  }

  setSetorNomeValidationState({ showError: false });
  const nomeInput = Utils.getEl('setor-nome');
  if (nomeInput) {
    delete nomeInput.dataset.touched;
    delete nomeInput.dataset.interacted;
  }

  syncSetorModalPreview();
  syncSetorModalCounters();
  syncSetorSaveButtonState();
}

export function openEditSetor(id) {
  const Utils = getDep('Utils');
  const Toast = getDep('Toast');
  const findSetor = getDep('findSetor');
  const setEditingSetorId = getDep('setEditingSetorId');
  const SETOR_PALETTE = getDep('SETOR_PALETTE');

  const setor = findSetor(id);
  if (!setor) {
    Toast.warning('Setor não encontrado.');
    return;
  }
  setEditingSetorId(id);

  Utils.setVal('setor-nome', setor.nome || '');
  Utils.setVal('setor-descricao', setor.descricao || '');
  Utils.setVal('setor-responsavel', setor.responsavel || '');

  const hiddenInput = Utils.getEl('setor-cor');
  const cor = setor.cor || SETOR_PALETTE[0].hex;
  if (hiddenInput) hiddenInput.value = cor;

  const picker = Utils.getEl('setor-color-picker');
  if (picker) {
    picker.querySelectorAll('.setor-modal__swatch').forEach((btn) => {
      const cell = btn.closest('.setor-modal__swatch-cell');
      const isMatch = btn.dataset.cor === cor;
      btn.classList.toggle('setor-modal__swatch--selected', isMatch);
      btn.setAttribute('aria-checked', isMatch ? 'true' : 'false');
      if (cell) cell.classList.toggle('setor-modal__swatch-cell--selected', isMatch);
    });
  }

  const titleEl = Utils.getEl('modal-add-setor-title');
  if (titleEl) titleEl.textContent = 'Editar setor';
  setSaveBtnLabel('Salvar alterações');

  setSetorNomeValidationState({ showError: false });
  const nomeInput = Utils.getEl('setor-nome');
  if (nomeInput) {
    delete nomeInput.dataset.touched;
    delete nomeInput.dataset.interacted;
  }

  syncSetorModalPreview();
  syncSetorModalCounters();
  syncSetorSaveButtonState();

  import('../../../core/modal.js').then(({ Modal: M }) => M.open('modal-add-setor'));
}

function syncSetorModalPreview() {
  const Utils = getDep('Utils');
  const SETOR_PALETTE = getDep('SETOR_PALETTE');
  const findPaletteEntry = getDep('findPaletteEntry');
  const setorContrastWithWhite = getDep('setorContrastWithWhite');

  const card = Utils.getEl('setor-modal-preview-card');
  if (!card) return;

  const nome = (Utils.getVal('setor-nome') || '').trim();
  const cor = Utils.getEl('setor-cor')?.value || SETOR_PALETTE[0].hex;
  const entry = findPaletteEntry(cor, SETOR_PALETTE);

  const nameEl = Utils.getEl('setor-modal-preview-name');
  if (nameEl) nameEl.textContent = nome || 'Novo setor';

  card.style.setProperty('--setor-cor', cor);
  const nameReadout = Utils.getEl('setor-color-name');
  if (nameReadout) nameReadout.textContent = entry?.nome || 'Custom';
  const hexReadout = Utils.getEl('setor-color-hex');
  if (hexReadout) hexReadout.textContent = cor;

  const contrastEl = Utils.getEl('setor-contrast');
  if (contrastEl) {
    const ratio = setorContrastWithWhite(cor);
    const pass = ratio >= 4.5;
    contrastEl.dataset.aa = pass ? 'pass' : 'warn';
    contrastEl.textContent = `${pass ? 'AA ✓' : 'AA ⚠'} · ${ratio.toFixed(1)}:1`;
  }

  const statusLabelEl = Utils.getEl('setor-modal-preview-status-label');
  const statusMetaEl = Utils.getEl('setor-modal-preview-status-meta');
  if (statusLabelEl) {
    statusLabelEl.textContent = nome
      ? 'Pronto para receber equipamentos'
      : 'Este setor começará vazio';
  }
  if (statusMetaEl) {
    statusMetaEl.textContent = nome
      ? 'Você poderá mover equipamentos para cá a qualquer momento'
      : 'Você poderá adicionar equipamentos depois';
  }

  card.classList.remove('is-pulsing');
  void card.offsetWidth;
  card.classList.add('is-pulsing');
}

function syncSetorModalCounters() {
  const Utils = getDep('Utils');
  const SETOR_NOME_MAX = getDep('SETOR_NOME_MAX');
  const SETOR_DESC_LIMIT = getDep('SETOR_DESC_LIMIT');

  const nome = Utils.getVal('setor-nome') || '';
  const desc = Utils.getVal('setor-descricao') || '';
  const nomeCounter = Utils.getEl('setor-nome-counter');
  if (nomeCounter) {
    nomeCounter.textContent = `${nome.length}/${SETOR_NOME_MAX}`;
    nomeCounter.classList.toggle('setor-modal__counter--over', nome.length > SETOR_NOME_MAX);
  }
  const descCounter = Utils.getEl('setor-descricao-counter');
  if (descCounter) {
    descCounter.textContent = `${desc.length}/${SETOR_DESC_LIMIT}`;
    descCounter.classList.toggle('setor-modal__counter--over', desc.length > SETOR_DESC_LIMIT);
  }
  syncSetorSaveButtonState();
}

export function initSetorColorPicker() {
  const Utils = getDep('Utils');
  const getSetorNomeValidation = getDep('getSetorNomeValidation');

  const picker = Utils.getEl('setor-color-picker');
  const hiddenInput = Utils.getEl('setor-cor');
  if (!picker || !hiddenInput) return;

  if (!picker.dataset.setorModalBound) {
    picker.dataset.setorModalBound = '1';

    picker.querySelectorAll('.setor-modal__swatch').forEach((btn) => {
      btn.addEventListener('click', () => {
        picker.querySelectorAll('.setor-modal__swatch').forEach((b) => {
          const cell = b.closest('.setor-modal__swatch-cell');
          b.classList.remove('setor-modal__swatch--selected');
          b.setAttribute('aria-checked', 'false');
          if (cell) cell.classList.remove('setor-modal__swatch-cell--selected');
        });
        btn.classList.add('setor-modal__swatch--selected');
        btn.setAttribute('aria-checked', 'true');
        const cell = btn.closest('.setor-modal__swatch-cell');
        if (cell) cell.classList.add('setor-modal__swatch-cell--selected');
        hiddenInput.value = btn.dataset.cor;
        syncSetorModalPreview();
      });
    });

    const nomeInput = Utils.getEl('setor-nome');
    if (nomeInput) {
      nomeInput.addEventListener('input', () => {
        nomeInput.dataset.interacted = '1';
        const { empty, tooLong } = getSetorNomeValidation(nomeInput.value);
        const wasTouched = nomeInput.dataset.touched === '1';
        setSetorNomeValidationState({ showError: wasTouched && (empty || tooLong) });
        syncSetorModalPreview();
        syncSetorModalCounters();
      });
      nomeInput.addEventListener('blur', () => {
        const { empty, tooLong } = getSetorNomeValidation(nomeInput.value);
        const wasTouched = nomeInput.dataset.touched === '1';
        const interacted = nomeInput.dataset.interacted === '1';
        if ((!empty && !tooLong) || (!wasTouched && !interacted)) return;
        setSetorNomeValidationState({
          showError: true,
          markTouched: true,
        });
      });
    }
    const descInput = Utils.getEl('setor-descricao');
    if (descInput) descInput.addEventListener('input', syncSetorModalCounters);
  }

  syncSetorModalPreview();
  syncSetorModalCounters();
  syncSetorSaveButtonState();
}
