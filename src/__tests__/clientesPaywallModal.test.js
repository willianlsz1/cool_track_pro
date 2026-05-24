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

  it('renderiza limite de clientes com limite local', async () => {
    const { ClientesPaywallModal } = await import('../ui/components/clientesPaywallModal.js');

    ClientesPaywallModal.open({ reason: 'client_limit', highlightPlan: 'plus' });

    const overlay = document.getElementById('clientes-paywall-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay.classList.contains('clientes-paywall-overlay')).toBe(true);
    expect(overlay.dataset.surface).toBe('paywall');
    expect(
      overlay.querySelector('.clientes-paywall__hero')?.getAttribute('aria-hidden'),
    ).toBeNull();
    expect(overlay.textContent).toContain('Limite local de 1 cliente');
    expect(overlay.textContent).toContain('Voltar ao inicio');
    expect(overlay.textContent).toContain('Cliente cadastrado');
    expect(overlay.textContent).toContain('Mais clientes');
    expect(overlay.textContent).toContain('Relatorios tecnicos');
    expect(overlay.textContent).toContain('Planos pagos removidos');
    expect(overlay.textContent).toContain('Agora nao');
    expect(overlay.querySelectorAll('.clientes-paywall__mockup-icon svg')).toHaveLength(3);
    expect(overlay.querySelectorAll('.clientes-paywall__perk-icon svg')).toHaveLength(3);
  });

  it('CTAs voltam para inicio sem expor area comercial', async () => {
    const { ClientesPaywallModal } = await import('../ui/components/clientesPaywallModal.js');

    ClientesPaywallModal.open({ highlightPlan: 'plus' });

    document.querySelector('.clientes-paywall__upgrade').click();
    expect(warning).not.toHaveBeenCalled();
    expect(goTo).toHaveBeenCalledWith('inicio');

    ClientesPaywallModal.open({ highlightPlan: 'plus' });
    document.querySelector('[data-clientes-lock-action="continue"]').click();
    expect(goTo).toHaveBeenCalledWith('inicio');
  });
});
