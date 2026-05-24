import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(path) {
  return readFileSync(path, 'utf8');
}

describe('legacy v1 removal contracts', () => {
  it('does not keep the legacy configuracoes route, view or dedicated styles', () => {
    const routesSource = readSource('src/ui/controller/routes.js');
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');
    const sidebarSource = readSource('src/ui/shell/templates/sidebar.js');
    const headerSource = readSource('src/ui/shell/templates/header.js');
    const redesignCss = readSource('src/assets/styles/redesign.css');
    const componentsCss = readSource('src/assets/styles/components.css');

    expect(existsSync('src/ui/views/configuracoes.js')).toBe(false);
    expect(routesSource).not.toContain('renderConfiguracoes');
    expect(routesSource).not.toContain("registerRoute('configuracoes'");
    expect(shellViewsSource).not.toContain('view-configuracoes');
    expect(sidebarSource).not.toContain('data-nav="configuracoes"');
    expect(headerSource).not.toContain('data-nav="configuracoes"');
    expect(redesignCss).not.toContain('view-configuracoes');
    expect(componentsCss).not.toContain('_configuracoes.css');
  });
});
