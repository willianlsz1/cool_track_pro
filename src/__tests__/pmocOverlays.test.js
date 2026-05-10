import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../core/utils.js', () => ({
  Utils: {
    escapeAttr: (value) => String(value ?? ''),
    escapeHtml: (value) => String(value ?? ''),
  },
}));

vi.mock('../core/toast.js', () => ({
  Toast: {
    error: vi.fn(),
  },
}));

vi.mock('../core/modal.js', () => ({
  attachDialogA11y: vi.fn(() => vi.fn()),
}));

vi.mock('../core/router.js', () => ({
  goTo: vi.fn(),
}));

describe('PMOC overlay surfaces', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';
  });

  it('marca PMOC formal Pro como modal real', async () => {
    const { PmocModal } = await import('../ui/components/pmocModal.js');

    PmocModal.open({
      clientes: [{ id: 'cli-1', nome: 'Cliente Norte' }],
      isPro: true,
      onConfirm: vi.fn(),
    });

    const overlay = document.getElementById('pmoc-modal-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay?.dataset.surface).toBe('modal');
    expect(overlay?.getAttribute('aria-modal')).toBe('true');
    expect(overlay?.querySelector('#pmoc-generate')).toBeTruthy();
    expect(overlay?.textContent).toContain('Não substitui o relatório técnico de cada visita');
  });

  it('marca bloqueio PMOC nao-Pro como paywall', async () => {
    const { PmocModal } = await import('../ui/components/pmocModal.js');

    PmocModal.open({
      clientes: [],
      isPro: false,
      onConfirm: vi.fn(),
    });

    const overlay = document.getElementById('pmoc-modal-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay?.dataset.surface).toBe('paywall');
    expect(overlay?.querySelector('#pmoc-upgrade')?.dataset.highlightPlan).toBe('pro');
    expect(overlay?.textContent).toContain('PMOC formal anual é recurso Pro');
  });

  it('marca modal informativo PMOC como modal real', async () => {
    const { PmocInfoModal } = await import('../ui/components/pmocInfoModal.js');

    PmocInfoModal.open();

    const overlay = document.getElementById('pmoc-info-modal-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay?.dataset.surface).toBe('modal');
    expect(overlay?.getAttribute('aria-labelledby')).toBe('pmoc-info-modal-title');
    expect(overlay?.textContent).toContain('Relatório técnico x PMOC formal');
  });
});
