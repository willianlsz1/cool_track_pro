import { beforeEach, describe, expect, it, vi } from 'vitest';

const goTo = vi.fn();

vi.mock('../core/router.js', () => ({
  goTo,
}));

describe('ClientesPaywallModal', () => {
  beforeEach(() => {
    vi.resetModules();
    goTo.mockReset();
    document.body.innerHTML = '';
  });

  it('renderiza paywall visual com copy e benefícios obrigatórios', async () => {
    const { ClientesPaywallModal } = await import('../ui/components/clientesPaywallModal.js');

    ClientesPaywallModal.open();

    const overlay = document.getElementById('clientes-paywall-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay.classList.contains('clientes-paywall-overlay')).toBe(true);
    expect(overlay.textContent).toContain('Organize seus clientes de verdade');
    expect(overlay.textContent).toContain(
      'Sem Clientes, tudo fica misturado: você perde tempo buscando histórico e aumenta a chance de erro.',
    );
    expect(overlay.textContent).toContain('Você tentou acessar Clientes');
    expect(overlay.textContent).toContain('Ache o cliente certo em segundos');
    expect(overlay.textContent).toContain('Evite confusão entre locais e setores');
    expect(overlay.textContent).toContain('Entregue relatórios organizados por cliente');
    expect(overlay.textContent).toContain(
      'Você economiza tempo em cada visita porque encontra tudo no lugar certo.',
    );
    expect(overlay.textContent).toContain('Sem contrato • Cancele quando quiser');
    expect(overlay.textContent).toContain('Desbloquear clientes agora');
    expect(overlay.textContent).toContain('Agora não');
  });

  it('CTA principal navega para pricing e CTA secundário volta para inicio', async () => {
    const { ClientesPaywallModal } = await import('../ui/components/clientesPaywallModal.js');

    ClientesPaywallModal.open();

    document.querySelector('[data-clientes-lock-action="pricing"]').click();
    expect(goTo).toHaveBeenCalledWith('pricing');

    ClientesPaywallModal.open();
    document.querySelector('[data-clientes-lock-action="continue"]').click();
    expect(goTo).toHaveBeenCalledWith('inicio');
  });
});
