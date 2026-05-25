import { beforeEach, describe, expect, it, vi } from 'vitest';

const stateRef = { value: { clientes: [] } };
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

describe('ClienteModal acesso operacional', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';
    stateRef.value = { clientes: [] };
    getClientesAccessSnapshot.mockReset();
    resolveClientesAccess.mockReset();
    getClientesAccessSnapshot.mockReturnValue({ resolved: true, planCode: 'free' });
  });

  it('abre criacao quando ainda nao ha cliente cadastrado', async () => {
    const { ClienteModal } = await import('../ui/components/clienteModal.js');

    await ClienteModal.openCreate();

    const overlay = document.getElementById('cliente-modal-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay?.dataset.surface).toBe('modal');
  });

  it('permite criar outro cliente quando recursos comerciais e limites operacionais estao desligados', async () => {
    stateRef.value = { clientes: [{ id: 'cli-1', nome: 'Cliente 1' }] };
    const { ClienteModal } = await import('../ui/components/clienteModal.js');

    await ClienteModal.openCreate();

    expect(document.getElementById('cliente-modal-overlay')).toBeTruthy();
  });

  it('permite editar cliente existente mesmo com limite operacional atingido', async () => {
    stateRef.value = { clientes: [{ id: 'cli-1', nome: 'Cliente 1' }] };
    const { ClienteModal } = await import('../ui/components/clienteModal.js');

    await ClienteModal.openEdit({ id: 'cli-1', nome: 'Cliente 1' });

    expect(document.getElementById('cliente-modal-overlay')).toBeTruthy();
  });
});
