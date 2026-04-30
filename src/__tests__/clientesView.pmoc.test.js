import { beforeEach, describe, expect, it, vi } from 'vitest';

const getState = vi.fn();
const openPmocPanel = vi.fn();

vi.mock('../core/state.js', () => ({ getState }));
vi.mock('../core/router.js', () => ({ goTo: vi.fn() }));
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
vi.mock('../ui/components/clientePmocPanel.js', () => ({
  ClientePmocPanel: { open: openPmocPanel },
}));
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
      setores: [],
    });
  });

  it('renderiza resumo PMOC como área clicável no card do cliente', async () => {
    const { renderClientes } = await import('../ui/views/clientes.js');
    await renderClientes();

    const pmoc = document.querySelector('[data-cli-action="open-pmoc-panel"]');
    expect(pmoc).toBeTruthy();
    expect(pmoc?.textContent).toContain('PMOC');
  });

  it('abre painel PMOC do cliente ao clicar no resumo PMOC', async () => {
    const { renderClientes } = await import('../ui/views/clientes.js');
    await renderClientes();

    document
      .querySelector('[data-cli-action="open-pmoc-panel"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(openPmocPanel).toHaveBeenCalledWith({
      cliente: expect.objectContaining({ id: 'c1', nome: 'Cliente 1' }),
      equipamentos: expect.any(Array),
      registros: expect.any(Array),
      setores: expect.any(Array),
    });
  });
});
