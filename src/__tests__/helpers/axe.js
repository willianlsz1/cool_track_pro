import axe from 'axe-core';

/**
 * Roda axe-core num container DOM e falha o teste se houver violations
 * de impacto SERIOUS ou CRITICAL.
 *
 * Violations MODERATE/MINOR são logadas no console mas não falham — assim
 * a equipe vê o que tem pra arrumar sem CI vermelho prematuro.
 *
 * @param {HTMLElement} container - elemento a auditar
 * @param {object}   [options]
 * @param {string[]} [options.tags]         tags WCAG
 *                                          (default: wcag2a + wcag2aa + wcag21a + wcag21aa,
 *                                           mesmo conjunto usado no teste da landing)
 * @param {string[]} [options.disableRules] IDs de regras a desligar nesta chamada.
 *                                          color-contrast vem desabilitado por padrão
 *                                          porque jsdom não calcula CSS computado
 *                                          (mesma justificativa do teste landing).
 * @returns {Promise<axe.AxeResults>} resultado completo (útil pra inspeção)
 */
export async function expectNoSeriousViolations(container, options = {}) {
  const tags = options.tags ?? ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
  const disableRules = options.disableRules ?? ['color-contrast'];

  const axeOptions = {
    runOnly: { type: 'tag', values: tags },
    resultTypes: ['violations'],
  };

  if (disableRules.length > 0) {
    axeOptions.rules = disableRules.reduce((acc, id) => {
      acc[id] = { enabled: false };
      return acc;
    }, {});
  }

  const results = await axe.run(container, axeOptions);

  const blocking = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));

  const advisory = results.violations.filter((v) => ['moderate', 'minor'].includes(v.impact));

  if (advisory.length > 0) {
    console.warn(
      `[a11y] ${advisory.length} violations moderate/minor (não bloqueantes):`,
      advisory.map((v) => `${v.id} (${v.nodes.length}x)`).join(', '),
    );
  }

  if (blocking.length > 0) {
    const summary = blocking
      .map((v) => {
        const nodesPreview = v.nodes
          .slice(0, 3)
          .map((n) => n.target.join(' '))
          .join('; ');
        return `  [${v.impact}] ${v.id}: ${v.help}\n    elementos: ${nodesPreview}${v.nodes.length > 3 ? ` (+${v.nodes.length - 3})` : ''}\n    referência: ${v.helpUrl}`;
      })
      .join('\n');
    throw new Error(`${blocking.length} violations a11y serious/critical:\n${summary}`);
  }

  return results;
}
