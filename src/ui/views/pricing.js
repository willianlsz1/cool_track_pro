import { Utils } from '../../core/utils.js';

export async function renderPricing() {
  const view = Utils.getEl('view-pricing');
  if (!view) return;

  view.innerHTML = `
    <section class="pricing-view" aria-labelledby="pricing-title">
      <header class="pricing-hero">
        <h1 class="pricing-hero__title" id="pricing-title">Area comercial indisponivel</h1>
        <p class="pricing-hero__subtitle">
          Billing e precificacao foram retirados do app e serao refeitos em uma etapa propria.
        </p>
      </header>
      <div class="pricing-manage-section">
        <div class="pricing-manage-section__body">
          <p class="pricing-manage-section__title">Nenhuma acao de cobranca esta disponivel agora.</p>
          <p class="pricing-manage-section__desc">
            O produto continua acessivel sem checkout, portal de assinatura ou tabela de precos.
          </p>
        </div>
      </div>
    </section>
  `;
}
