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

  it('renderiza paywall de limite com Plus como upgrade principal', async () => {
    const { ClientesPaywallModal } = await import('../ui/components/clientesPaywallModal.js');

    ClientesPaywallModal.open({ reason: 'client_limit', highlightPlan: 'plus' });

    const overlay = document.getElementById('clientes-paywall-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay.classList.contains('clientes-paywall-overlay')).toBe(true);
    expect(overlay.dataset.surface).toBe('paywall');
    expect(
      overlay.querySelector('.clientes-paywall__hero')?.getAttribute('aria-hidden'),
    ).toBeNull();
    expect(overlay.textContent).toContain('Seu plano Free inclui 1 cliente');
    expect(overlay.textContent).toContain('Fazer upgrade para o Plus');
    expect(overlay.textContent).toContain('Cliente cadastrado');
    expect(overlay.textContent).toContain('Mais clientes');
    expect(overlay.textContent).toContain('Relatorios profissionais');
    expect(overlay.textContent).toContain('Sem contrato');
    expect(overlay.textContent).toContain('Agora nao');
    expect(overlay.querySelectorAll('.clientes-paywall__mockup-icon svg')).toHaveLength(3);
    expect(overlay.querySelectorAll('.clientes-paywall__perk-icon svg')).toHaveLength(3);
  });

  it('CTA principal navega para pricing com Plus em destaque e CTA secundario volta para inicio', async () => {
    const { ClientesPaywallModal } = await import('../ui/components/clientesPaywallModal.js');

    ClientesPaywallModal.open({ highlightPlan: 'plus' });

    document.querySelector('[data-clientes-lock-action="pricing"]').click();
    expect(goTo).toHaveBeenCalledWith('pricing', { highlightPlan: 'plus' });

    ClientesPaywallModal.open({ highlightPlan: 'plus' });
    document.querySelector('[data-clientes-lock-action="continue"]').click();
    expect(goTo).toHaveBeenCalledWith('inicio');
  });
});
