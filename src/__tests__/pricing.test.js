import { beforeEach, describe, expect, it } from 'vitest';

import { renderPricing } from '../ui/views/pricing.js';

describe('pricing view', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<div id="view-pricing"></div>';
  });

  it('renderiza aviso neutro de area comercial indisponivel', async () => {
    await renderPricing();

    const html = document.getElementById('view-pricing').innerHTML;
    expect(html).toContain('Area comercial indisponivel');
    expect(html).toContain('Billing e precificacao foram retirados do app');
    expect(html).toContain('Nenhuma acao de cobranca esta disponivel agora.');
  });

  it('nao renderiza checkout, portal de assinatura ou tabela de precos', async () => {
    await renderPricing();

    const view = document.getElementById('view-pricing');
    const html = view.innerHTML;
    expect(html).not.toContain('data-action="start-checkout"');
    expect(html).not.toContain('data-action="manage-subscription"');
    expect(html).not.toContain('Assinar Pro');
    expect(html).not.toContain('Gerenciar / cancelar assinatura');
    expect(html).not.toContain('R$ 29');
    expect(html).not.toContain('R$ 99');
    expect(view.querySelector('[data-plan-card]')).toBeNull();
    expect(view.querySelector('[data-plan-tab]')).toBeNull();
  });
});
