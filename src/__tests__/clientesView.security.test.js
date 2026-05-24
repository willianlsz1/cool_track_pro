import { beforeEach, describe, expect, it, vi } from 'vitest';

const getState = vi.fn();
const loadClientes = vi.fn().mockResolvedValue([]);
const goTo = vi.fn();

vi.mock('../core/state.js', () => ({ getState }));
vi.mock('../core/router.js', () => ({ goTo }));
vi.mock('../core/clientes.js', () => ({
  loadClientes,
  deleteCliente: vi.fn(),
  formatCnpjOrCpf: (value) => value,
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
  getEquipmentMaintenanceContext: vi.fn(() => ({ daysToNext: 3 })),
}));

describe('clientes view adapter', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="view-clientes"><div id="clientes-root"></div></div>';
    getState.mockReturnValue({
      clientes: [
        {
          id: 'c1',
          nome: 'Cliente <img src=x onerror=alert(1)>',
          razaoSocial: 'Razao <script>alert(1)</script>',
          cnpj: '" autofocus onfocus="alert(1)',
          endereco: 'Rua <svg onload=alert(1)>, Campinas, SP',
          contato: 'contato@example.com',
        },
      ],
      equipamentos: [{ id: 'e1', clienteId: 'c1', periodicidadePreventivaDias: 30 }],
      registros: [{ id: 'r1', equipId: 'e1', data: '2026-04-10', tipo: 'preventiva' }],
      setores: [],
    });
  });

  it('preserva ids, classes e contratos de acoes principais no HTML legado', async () => {
    const { renderClientes } = await import('../ui/views/clientes.js');
    await renderClientes();

    expect(document.getElementById('clientes-root')).toBeTruthy();
    expect(document.querySelector('.cli-page')).toBeTruthy();
    expect(document.querySelector('.cli-card')).toBeTruthy();
    expect(document.getElementById('cli-search-input')).toBeTruthy();
    expect(document.getElementById('cli-status-filter')).toBeTruthy();
    expect(document.getElementById('cli-city-filter')).toBeTruthy();
    expect(document.getElementById('cli-sort')).toBeTruthy();
    expect(document.getElementById('cli-page-size')).toBeTruthy();
    expect(
      document.querySelector('[data-action="open-cliente-modal"][data-mode="create"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-cli-action="ver-equipamentos"][data-id="c1"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-cli-action="ver-servi\u00e7os"][data-id="c1"]'),
    ).toBeTruthy();
    expect(document.querySelector('[data-cli-action="card-menu"][data-id="c1"]')).toBeTruthy();
  });

  it('escapa conteudo dinamico e nao cria HTML executavel a partir de dados', async () => {
    const { renderClientes } = await import('../ui/views/clientes.js');
    await renderClientes();

    expect(document.querySelector('script')).toBeNull();
    expect(document.querySelector('img[src="x"]')).toBeNull();
    expect(document.querySelector('svg[onload]')).toBeNull();
    expect(document.body.textContent).toContain('Cliente <img src=x onerror=alert(1)>');
    expect(document.body.textContent).toContain('Razao <script>alert(1)</script>');
  });

  it('mantem estado vazio e filtro sem resultados', async () => {
    const { renderClientes, setClientesSearch } = await import('../ui/views/clientes.js');

    getState.mockReturnValue({ clientes: [], equipamentos: [], registros: [], setores: [] });
    await renderClientes();
    expect(document.querySelector('.cli-empty')?.textContent).toContain('Nenhum cliente');

    getState.mockReturnValue({
      clientes: [{ id: 'c1', nome: 'Cliente A', endereco: 'Campinas, SP' }],
      equipamentos: [],
      registros: [],
      setores: [],
    });
    setClientesSearch('sem resultado');
    await Promise.resolve();

    expect(document.querySelector('.cli-empty--filter')?.textContent).toContain(
      'Nenhum cliente encontrado',
    );
  });

  it('mantem navegacao legada por data-cli-action para equipamentos e historico', async () => {
    const { renderClientes } = await import('../ui/views/clientes.js');
    await renderClientes();

    document
      .querySelector('[data-cli-action="ver-equipamentos"][data-id="c1"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(goTo).toHaveBeenCalledWith('equipamentos', {
      equipCtx: { clienteId: 'c1', clienteNome: expect.stringContaining('Cliente') },
    });

    document
      .querySelector('[data-cli-action="ver-servi\u00e7os"][data-id="c1"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(goTo).toHaveBeenCalledWith('historico', {
      clienteId: 'c1',
      clienteNome: expect.stringContaining('Cliente'),
    });
  });
});
