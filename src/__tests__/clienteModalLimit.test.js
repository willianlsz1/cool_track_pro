import { beforeEach, describe, expect, it, vi } from 'vitest';

const stateRef = { value: { clientes: [] } };
const paywallOpen = vi.fn();
const getClientesAccessSnapshot = vi.fn();
const resolveClientesAccess = vi.fn();

vi.mock('../core/utils.js', () => ({
  Utils: {
    escapeAttr: (value) => String(value || ''),
    escapeHtml: (value) => String(value || ''),
  },
}));

vi.mock('../core/toast.js', () => ({
  Toast: {
    warning: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../core/clientes.js', () => ({
  upsertCliente: vi.fn(),
  validateCnpjOrCpf: vi.fn(() => ({ ok: true, kind: 'unknown' })),
  formatCnpjOrCpf: vi.fn((value) => value),
  maskCnpjOrCpfInput: vi.fn((value) => value),
}));

vi.mock('../core/modal.js', () => ({
  attachDialogA11y: vi.fn(() => vi.fn()),
  CustomConfirm: { show: vi.fn() },
}));

vi.mock('../core/phoneMask.js', () => ({
  bindSmartContactMaskInput: vi.fn(),
}));

vi.mock('../core/state.js', () => ({
  getState: () => stateRef.value,
}));

vi.mock('../core/plans/clientesAccess.js', async () => {
  const actual = await vi.importActual('../core/plans/clientesAccess.js');
  return {
    ...actual,
    getClientesAccessSnapshot,
    resolveClientesAccess,
  };
});

vi.mock('../ui/components/clientesPaywallModal.js', () => ({
  ClientesPaywallModal: { open: paywallOpen },
}));

describe('ClienteModal limite por plano', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';
    stateRef.value = { clientes: [] };
    paywallOpen.mockReset();
    getClientesAccessSnapshot.mockReset();
    resolveClientesAccess.mockReset();
    getClientesAccessSnapshot.mockReturnValue({ resolved: true, planCode: 'free' });
  });

  it('abre criacao no Free quando ainda nao ha cliente', async () => {
    const { ClienteModal } = await import('../ui/components/clienteModal.js');

    await ClienteModal.openCreate();

    expect(document.getElementById('cliente-modal-overlay')).toBeTruthy();
    expect(paywallOpen).not.toHaveBeenCalled();
  });

  it('bloqueia segundo cliente Free e abre upgrade com Plus como CTA principal', async () => {
    stateRef.value = { clientes: [{ id: 'cli-1', nome: 'Cliente 1' }] };
    const { ClienteModal } = await import('../ui/components/clienteModal.js');

    await ClienteModal.openCreate();

    expect(document.getElementById('cliente-modal-overlay')).toBeNull();
    expect(paywallOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'client_limit',
        highlightPlan: 'plus',
      }),
    );
  });

  it('permite editar cliente existente no Free mesmo com limite atingido', async () => {
    stateRef.value = { clientes: [{ id: 'cli-1', nome: 'Cliente 1' }] };
    const { ClienteModal } = await import('../ui/components/clienteModal.js');

    await ClienteModal.openEdit({ id: 'cli-1', nome: 'Cliente 1' });

    expect(document.getElementById('cliente-modal-overlay')).toBeTruthy();
    expect(paywallOpen).not.toHaveBeenCalled();
  });
});
