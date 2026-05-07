/**
 * A11y regression test for the public landing page.
 *
 * Renders the landing in jsdom and runs axe-core (via expectNoSeriousViolations
 * helper) com WCAG 2.1 A + AA rules. Gate: zero violations serious/critical
 * — quebra CI se alguém quebrar acessibilidade.
 *
 * Aponta para a landing React+Tailwind oficial (`landingIsland`) — a
 * landing legacy vanilla foi removida. O teste continua aqui (e não em
 * `landingPageReact.test.jsx`) pra manter o axe-core isolado num arquivo
 * dedicado, com regras desabilitadas documentadas claramente:
 *
 *   - color-contrast: jsdom não calcula estilos computados corretamente
 *     (não aplica gradients, backdrop-filter, etc). Validação de contraste
 *     é feita manualmente via Lighthouse ou DevTools contrast picker.
 *     Default do helper já desabilita esta regra.
 */
import { act } from 'react';

import { expectNoSeriousViolations } from './helpers/axe.js';

const { mountLandingPageReact } = await import('../react/entrypoints/landingIsland.jsx');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('LandingPage a11y (axe-core)', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('has zero WCAG 2.1 A/AA violations serious/critical', async () => {
    const root = document.getElementById('app');
    await act(async () => {
      mountLandingPageReact(root, { onLogin: () => {} });
    });

    await expectNoSeriousViolations(document.body);
  });
});
