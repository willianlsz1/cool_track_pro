import { describe, expect, it } from 'vitest';

import { __test__ } from '../ui/views/conta.js';

describe('conta view helpers', () => {
  it('renderiza estado operacional sem CTA comercial', () => {
    const html = __test__._renderPlanCard({ planCode: __test__.PLAN_CODE_FREE });
    expect(html).toContain('Operacional');
    expect(html).not.toContain('Ver planos');
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

  it('renderiza identidade escapando dados controlados pelo usuario', () => {
    const html = __test__._renderIdentity({
      name: '<img src=x onerror=alert(1)>',
      email: 'ana@example.com"><svg onload=alert(1)>',
      role: '<script>alert(1)</script>',
      planCode: __test__.PLAN_CODE_PLUS,
      mode: 'rapido',
    });

    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('ana@example.com&quot;&gt;&lt;svg onload=alert(1)&gt;');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<svg onload=');
  });

  it('Pro renderiza status operacional sem CTA comercial', () => {
    const html = __test__._renderPlanCard({ planCode: __test__.PLAN_CODE_PRO });
    expect(html).toContain('Operacional');
    expect(html).not.toContain('Gerenciar assinatura');
    expect(html).not.toContain('Ver Pro');
  });

  it('ações rápidas mudam por plano', () => {
    const freeHtml = __test__._renderQuickActions({ planCode: __test__.PLAN_CODE_FREE });
    expect(freeHtml).toContain('Registrar serviço');
    expect(freeHtml).toContain('Editar perfil');
    expect(freeHtml).not.toContain('Ver planos');
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
