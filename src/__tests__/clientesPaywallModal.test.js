import { beforeEach, describe, expect, it, vi } from 'vitest';

const goTo = vi.fn();
const warning = vi.fn();

vi.mock('../core/router.js', () => ({
  goTo,
}));

vi.mock('../core/toast.js', () => ({
  Toast: { warning },
}));

describe('ClientesPaywallModal', () => {
  beforeEach(() => {
    vi.resetModules();
    goTo.mockReset();
    warning.mockReset();
    document.body.innerHTML = '';
  });

  it('renderiza limite de clientes com area comercial indisponivel', async () => {
    const { ClientesPaywallModal } = await import('../ui/components/clientesPaywallModal.js');

    ClientesPaywallModal.open({ reason: 'client_limit', highlightPlan: 'plus' });

    const overlay = document.getElementById('clientes-paywall-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay.classList.contains('clientes-paywall-overlay')).toBe(true);
    expect(overlay.dataset.surface).toBe('paywall');
    expect(
      overlay.querySelector('.clientes-paywall__hero')?.getAttribute('aria-hidden'),
    ).toBeNull();
    expect(overlay.textContent).toContain('Free inclui 1 cliente');
    expect(overlay.textContent).toContain('Area comercial indisponivel');
    expect(overlay.textContent).toContain('Cliente cadastrado');
    expect(overlay.textContent).toContain('Mais clientes');
    expect(overlay.textContent).toContain('Relatorios tecnicos');
    expect(overlay.textContent).toContain('Billing e precificacao desativados');
    expect(overlay.textContent).toContain('Agora nao');
    expect(overlay.querySelectorAll('.clientes-paywall__mockup-icon svg')).toHaveLength(3);
    expect(overlay.querySelectorAll('.clientes-paywall__perk-icon svg')).toHaveLength(3);
  });

  it('CTA principal avisa billing desativado e CTA secundario volta para inicio', async () => {
    const { ClientesPaywallModal } = await import('../ui/components/clientesPaywallModal.js');

    ClientesPaywallModal.open({ highlightPlan: 'plus' });

    document.querySelector('[data-clientes-lock-action="pricing"]').click();
    expect(warning).toHaveBeenCalledWith('Billing e precificacao estao desativados nesta etapa.');
    expect(goTo).not.toHaveBeenCalled();

    ClientesPaywallModal.open({ highlightPlan: 'plus' });
    document.querySelector('[data-clientes-lock-action="continue"]').click();
    expect(goTo).toHaveBeenCalledWith('inicio');
  });
});
