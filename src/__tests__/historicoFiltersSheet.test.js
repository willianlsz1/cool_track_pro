import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const a11yCleanup = vi.fn();
  return {
    a11yCleanup,
    attachDialogA11y: vi.fn(() => a11yCleanup),
  };
});

vi.mock('../core/modal.js', () => ({
  attachDialogA11y: mocks.attachDialogA11y,
}));

import { HistoricoFiltersSheet } from '../ui/components/historicoFiltersSheet.js';

const baseSetores = [
  { id: 'setor-1', nome: 'Casa de maquinas' },
  { id: 'setor-2', nome: 'Recepcao' },
];

const baseEquipamentos = [
  { id: 'eq-1', nome: 'Chiller Central', setorId: 'setor-1' },
  { id: 'eq-2', nome: 'Split Recepcao', setorId: 'setor-2' },
];

const baseTipoOptions = [
  { id: 'preventiva', label: 'Preventiva' },
  { id: 'corretiva', label: 'Corretiva' },
];

function openSheet(overrides = {}) {
  const options = {
    setores: baseSetores,
    equipamentos: baseEquipamentos,
    tipoOptions: baseTipoOptions,
    initial: {},
    onApply: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  };
  HistoricoFiltersSheet.open(options);
  return {
    overlay: document.getElementById('hist-filters-sheet-overlay'),
    options,
  };
}

function optionValues(select) {
  return [...select.querySelectorAll('option')].map((option) => option.value);
}

function expectNoInjectedMarkup(root) {
  expect(root.querySelector('script')).toBeNull();
  expect(root.querySelector('[onclick]')).toBeNull();
  expect([...root.querySelectorAll('img')].some((img) => img.hasAttribute('onerror'))).toBe(false);
  root.querySelectorAll('[href], [src], [data-photo-url]').forEach((node) => {
    ['href', 'src', 'data-photo-url']
      .map((attr) => node.getAttribute(attr))
      .filter(Boolean)
      .forEach((value) => expect(value.toLowerCase()).not.toContain('javascript:'));
  });
}

describe('HistoricoFiltersSheet DOM', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback) => {
      callback();
      return 1;
    });
    mocks.attachDialogA11y.mockClear();
    mocks.a11yCleanup.mockClear();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    HistoricoFiltersSheet.close();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('cria o sheet com DOM publico mesmo sem setores, equipamentos ou tipos', () => {
    const { overlay } = openSheet({
      setores: [],
      equipamentos: [],
      tipoOptions: [],
    });

    expect(overlay).not.toBeNull();
    expect(overlay.id).toBe('hist-filters-sheet-overlay');
    expect(overlay.classList.contains('modal-overlay')).toBe(true);
    expect(overlay.classList.contains('hist-filters-sheet-overlay')).toBe(true);
    expect(overlay.classList.contains('is-open')).toBe(true);

    const dialog = overlay.querySelector('.modal.hist-filters-sheet');
    expect(dialog).not.toBeNull();
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe('hist-filters-sheet-title');
    expect(overlay.querySelector('#hist-filters-sheet-title')?.textContent).toBe('Filtros');

    expect(overlay.querySelector('#hfs-setor')).toBeNull();
    expect(overlay.querySelector('#hfs-equip.hist-filters-sheet__select')).not.toBeNull();
    expect(overlay.querySelector('#hfs-close.hist-filters-sheet__close')).not.toBeNull();
    expect(overlay.querySelector('#hfs-reset.hist-filters-sheet__reset')).not.toBeNull();
    expect(overlay.querySelector('#hfs-apply.hist-filters-sheet__apply')).not.toBeNull();

    const tipoChips = overlay.querySelectorAll('.hist-filters-sheet__tipo-chip[data-tipo-id]');
    expect(tipoChips).toHaveLength(1);
    expect(tipoChips[0].dataset.tipoId).toBe('');
    expect(tipoChips[0].classList.contains('is-active')).toBe(true);
    expect(tipoChips[0].getAttribute('aria-pressed')).toBe('true');
    expect(mocks.attachDialogA11y).toHaveBeenCalledWith(
      overlay,
      expect.objectContaining({ onDismiss: expect.any(Function) }),
    );
  });

  it('preserva contratos de setor, equipamento e tipo com estado inicial ativo', () => {
    const { overlay } = openSheet({
      initial: { setor: 'setor-1', equip: 'eq-1', tipo: 'preventiva' },
    });

    const setorSelect = overlay.querySelector('#hfs-setor.hist-filters-sheet__select');
    const equipSelect = overlay.querySelector('#hfs-equip.hist-filters-sheet__select');
    const tipoGrid = overlay.querySelector('.hist-filters-sheet__tipo-grid');
    const activeTipo = overlay.querySelector(
      '.hist-filters-sheet__tipo-chip.is-active[data-tipo-id="preventiva"]',
    );

    expect(setorSelect.value).toBe('setor-1');
    expect(setorSelect.dataset.current).toBe('setor-1');
    expect(optionValues(setorSelect)).toEqual(['', 'setor-1', 'setor-2']);
    expect(equipSelect.value).toBe('eq-1');
    expect(equipSelect.dataset.current).toBe('eq-1');
    expect(optionValues(equipSelect)).toEqual(['', 'eq-1']);
    expect(tipoGrid.dataset.current).toBe('preventiva');
    expect(activeTipo).not.toBeNull();
    expect(activeTipo.getAttribute('aria-pressed')).toBe('true');
    expect(overlay.querySelector('[data-tipo-id="corretiva"]')).not.toBeNull();
  });

  it('filtra equipamentos por setor, aplica selecoes e fecha sem executar outros fluxos', () => {
    const onApply = vi.fn();
    const onReset = vi.fn();
    const { overlay } = openSheet({
      initial: { setor: 'setor-1', equip: 'eq-1', tipo: 'preventiva' },
      onApply,
      onReset,
    });

    const setorSelect = overlay.querySelector('#hfs-setor');
    const equipSelect = overlay.querySelector('#hfs-equip');
    const tipoGrid = overlay.querySelector('.hist-filters-sheet__tipo-grid');

    setorSelect.value = 'setor-2';
    setorSelect.dispatchEvent(new Event('change', { bubbles: true }));
    expect(optionValues(equipSelect)).toEqual(['', 'eq-2']);

    equipSelect.value = 'eq-2';
    overlay.querySelector('[data-tipo-id="corretiva"]').click();
    expect(tipoGrid.dataset.current).toBe('corretiva');
    expect(
      overlay.querySelector('[data-tipo-id="corretiva"]').classList.contains('is-active'),
    ).toBe(true);

    overlay.querySelector('#hfs-apply').click();

    expect(onApply).toHaveBeenCalledWith({ setor: 'setor-2', equip: 'eq-2', tipo: 'corretiva' });
    expect(onReset).not.toHaveBeenCalled();
    expect(mocks.a11yCleanup).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(260);
    expect(document.getElementById('hist-filters-sheet-overlay')).toBeNull();
  });

  it('preserva acoes de limpar e fechar sem aplicar filtros', () => {
    const onApply = vi.fn();
    const onReset = vi.fn();
    let opened = openSheet({ onApply, onReset });

    opened.overlay.querySelector('#hfs-reset').click();
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(onApply).not.toHaveBeenCalled();
    vi.advanceTimersByTime(260);
    expect(document.getElementById('hist-filters-sheet-overlay')).toBeNull();

    onReset.mockClear();
    opened = openSheet({ onApply, onReset });
    opened.overlay.querySelector('#hfs-close').click();
    expect(onReset).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
    vi.advanceTimersByTime(260);
    expect(document.getElementById('hist-filters-sheet-overlay')).toBeNull();
  });

  it('escapa labels e ids maliciosos sem injetar HTML, scripts ou handlers', () => {
    const malicious = '<img src=x onerror=alert(1)><script>alert(1)</script>javascript:alert(2)';
    const { overlay } = openSheet({
      setores: [{ id: 'setor-xss" onclick="alert(1)', nome: malicious }],
      equipamentos: [
        {
          id: 'eq-xss" data-injected="1',
          nome: malicious,
          setorId: 'setor-xss" onclick="alert(1)',
        },
      ],
      tipoOptions: [{ id: 'tipo-xss" onclick="alert(1)', label: malicious }],
    });

    expectNoInjectedMarkup(overlay);
    expect(overlay.querySelector('[data-injected]')).toBeNull();
    expect(overlay.textContent).toContain('javascript:alert(2)');
  });

  it('continua sem depender de React ou createRoot', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const source = fs.readFileSync(
      path.resolve('./src/ui/components/historicoFiltersSheet.js'),
      'utf-8',
    );

    expect(source).not.toMatch(/createRoot|from ['"]react|from ['"]react-dom/i);
  });
});
