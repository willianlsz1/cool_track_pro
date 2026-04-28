import { beforeEach, describe, expect, it, vi } from 'vitest';

const getState = vi.fn();
const goTo = vi.fn();

vi.mock('../core/state.js', () => ({ getState }));
vi.mock('../core/router.js', () => ({ goTo }));
vi.mock('../core/clientes.js', () => ({
  loadClientes: vi.fn().mockResolvedValue([]),
  deleteCliente: vi.fn(),
  formatCnpjOrCpf: (v) => v,
}));
vi.mock('../ui/components/clienteModal.js', () => ({ ClienteModal: { openEdit: vi.fn() } }));
vi.mock('../core/toast.js', () => ({
  Toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));
vi.mock('../core/modal.js', () => ({ CustomConfirm: { show: vi.fn().mockResolvedValue(false) } }));
vi.mock('../core/errors.js', () => ({ handleError: vi.fn(), ErrorCodes: {} }));
vi.mock('../core/clienteAlerts.js', () => ({
  getClienteAlert: vi.fn().mockReturnValue(null),
  daysUntilAlert: vi.fn().mockReturnValue(null),
}));
vi.mock('../ui/components/clienteAlertModal.js', () => ({ ClienteAlertModal: { open: vi.fn() } }));
vi.mock('../domain/maintenance.js', () => ({
  getEquipmentMaintenanceContext: vi.fn(() => ({ daysToNext: -5 })),
}));

describe('clientes view pmoc action', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="view-clientes"><div id="clientes-root"></div></div>';

    getState.mockReturnValue({
      clientes: [{ id: 'c1', nome: 'Cliente 1', endereco: 'Rua 1, Centro, São Paulo, SP' }],
      equipamentos: [
        { id: 'e1', clienteId: 'c1', nome: 'Split 1', tipo: 'Split Hi-Wall', status: 'ok' },
      ],
      registros: [{ id: 'r1', equipId: 'e1', data: '2025-01-01', tipo: 'preventiva' }],
    });
  });

  it('renderiza bloco PMOC acionável com copy de manutenções atrasadas', async () => {
    const { renderClientes } = await import('../ui/views/clientes.js');
    await renderClientes();

    const pmoc = document.querySelector('.cli-pmoc');
    expect(pmoc).toBeTruthy();
    expect(pmoc?.getAttribute('role')).toBe('button');
    expect(pmoc?.textContent).toContain('⚠️ 1 manutenção atrasada');
  });

  it('navega para equipamentos com filtro pmoc ao clicar no bloco', async () => {
    const { renderClientes } = await import('../ui/views/clientes.js');
    await renderClientes();

    document.querySelector('.cli-pmoc')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(goTo).toHaveBeenCalledWith('equipamentos', {
      equipCtx: { clienteId: 'c1', clienteNome: 'Cliente 1', quickFilter: 'pmoc' },
    });
  });
});
