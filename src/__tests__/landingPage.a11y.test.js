/**
 * A11y regression test for the public landing page.
 *
 * Renders the landing in jsdom and runs axe-core with WCAG 2.1 A + AA
 * rules. Gate: zero violations — breaks CI se alguém quebrar acessibilidade.
 *
 * Aponta para a landing React+Tailwind oficial (`landingIsland`) — a
 * landing legacy vanilla foi removida. O teste continua aqui (e não em
 * `landingPageReact.test.jsx`) pra manter o axe-core isolado num arquivo
 * dedicado, com regras desabilitadas documentadas claramente:
 *
 *   - color-contrast: jsdom não calcula estilos computados corretamente
 *     (não aplica gradients, backdrop-filter, etc). Validação de contraste
 *     é feita manualmente via Lighthouse ou DevTools contrast picker.
 */
import { act } from 'react';
import axe from 'axe-core';

const { mountLandingPageReact } = await import('../react/entrypoints/landingIsland.jsx');

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('LandingPage a11y (axe-core)', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('has zero WCAG 2.1 A/AA violations', async () => {
    const root = document.getElementById('app');
    await act(async () => {
      mountLandingPageReact(root, { onLogin: () => {} });
    });

    const results = await axe.run(document.body, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      rules: {
        // color-contrast: jsdom sem CSS computado real, validamos manualmente.
        'color-contrast': { enabled: false },
      },
    });

    // Se falhar, loga violations detalhadas — facilita debug.
    if (results.violations.length > 0) {
      console.error(
        '[a11y] violations encontradas:',
        JSON.stringify(
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.map((n) => ({ target: n.target, html: n.html })),
          })),
          null,
          2,
        ),
      );
    }

    expect(results.violations).toEqual([]);
  });
});
