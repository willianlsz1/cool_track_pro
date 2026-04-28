import { describe, expect, it } from 'vitest';

import { __test__ } from '../ui/views/conta.js';

describe('conta view helpers', () => {
  it('Free renderiza Plano Gratuito com CTA Ver planos', () => {
    const html = __test__._renderPlanCard({ planCode: __test__.PLAN_CODE_FREE });
    expect(html).toContain('Plano Gratuito');
    expect(html).toContain('Ver planos');
  });

  it('Plus renderiza subtítulo de modo técnico/autônomo', () => {
    const html = __test__._renderIdentity({
      name: 'Ana',
      email: 'ana@cooltrack.app',
      role: 'Técnica',
      planCode: __test__.PLAN_CODE_PLUS,
      mode: 'rapido',
    });
    expect(html).toContain('Técnico em refrigeração');
  });

  it('Pro renderiza proposta empresa sem CTA agressivo de upgrade', () => {
    const html = __test__._renderPlanCard({ planCode: __test__.PLAN_CODE_PRO });
    expect(html).toContain('CoolTrack Pro');
    expect(html).toContain('Gerenciar assinatura');
    expect(html).not.toContain('Ver Pro');
  });

  it('ações rápidas mudam por plano', () => {
    const freeHtml = __test__._renderQuickActions({ planCode: __test__.PLAN_CODE_FREE });
    expect(freeHtml).toContain('Registrar serviço');
    expect(freeHtml).toContain('Ver planos');
    expect(freeHtml).not.toContain('Gerar PMOC');

    const proHtml = __test__._renderQuickActions({ planCode: __test__.PLAN_CODE_PRO });
    expect(proHtml).toContain('Clientes');
    expect(proHtml).toContain('Gerar PMOC');
  });

  it('não quebra quando dados de uso estão vazios', () => {
    const html = __test__._renderUsageCard({
      planCode: __test__.PLAN_CODE_PLUS,
      serviceCount: 0,
      equipmentCount: 0,
      equipmentLimit: 15,
      reportsSent: undefined,
      clientsCount: 0,
      pmocStatus: '',
    });
    expect(html).toContain('Serviços');
    expect(html).toContain('Equipamentos');
  });
});
