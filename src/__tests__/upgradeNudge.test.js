import { UpgradeNudge } from '../ui/components/upgradeNudge.js';

describe('UpgradeNudge', () => {
  describe('renderDashboardCard', () => {
    it('renderiza upsell para Plus quando usuário está no Free', () => {
      const html = UpgradeNudge.renderDashboardCard({ planCode: 'free' });

      expect(html).toContain('Liberar rotina de campo com Plus');
      expect(html).toContain('POPULAR');
      expect(html).toContain('Até 15 equipamentos cadastrados');
      expect(html).toContain('Registros e histórico de serviços ilimitados');
      expect(html).toContain('50 PDFs técnicos/mês sem marca');
      expect(html).toContain('Assinatura do cliente no relatório');
      expect(html).toContain('60 aberturas de WhatsApp/mês');
      expect(html).toContain('Ver plano Plus &rarr;');
      expect(html).toContain('data-highlight-plan="plus"');
      // Menciona Pro como caminho futuro
      expect(html).toContain('Pro');
    });

    it('renderiza upsell para Pro quando usuário já está no Plus', () => {
      const html = UpgradeNudge.renderDashboardCard({ planCode: 'plus' });

      expect(html).toContain('Liberar PMOC formal com Pro');
      expect(html).toContain('ESCALA');
      expect(html).toContain('Equipamentos ilimitados');
      expect(html).toContain('PDFs ilimitados');
      expect(html).toContain('WhatsApp ilimitado');
      expect(html).toContain('Agrupamento por setores');
      expect(html).toContain('Suporte prioritário');
      expect(html).toContain('Ver plano Pro &rarr;');
      expect(html).toContain('data-highlight-plan="pro"');
    });

    it('não renderiza nada quando usuário já está no Pro', () => {
      const html = UpgradeNudge.renderDashboardCard({ planCode: 'pro' });

      expect(html).toBe('');
    });

    it('default (sem planCode) trata como Free e destaca Plus', () => {
      const html = UpgradeNudge.renderDashboardCard();

      expect(html).toContain('Liberar rotina de campo com Plus');
      expect(html).toContain('data-highlight-plan="plus"');
    });
  });

  describe('renderInlineHint', () => {
    it('escapa feature no hint inline', () => {
      const html = UpgradeNudge.renderInlineHint('<img src=x onerror=alert(1)>');

      expect(html).toContain('&lt;img src=x onerror=alert(1)&gt; fica disponível no plano Plus');
      expect(html).toContain('Ver plano &rarr;');
    });

    it('usa plano Pro quando requiredPlan é pro', () => {
      const html = UpgradeNudge.renderInlineHint('Setores', { requiredPlan: 'pro' });

      expect(html).toContain('Setores fica disponível no plano Pro');
    });

    it('default é plano Plus', () => {
      const html = UpgradeNudge.renderInlineHint('PDF em lote');

      expect(html).toContain('PDF em lote fica disponível no plano Plus');
    });
  });
});
