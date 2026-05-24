import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(path) {
  return readFileSync(path, 'utf8');
}

describe('legacy v1 removal contracts', () => {
  it('does not keep the skipped legacy core-flow e2e smoke after v2 promotion', () => {
    expect(existsSync('e2e/specs/core-flow-smoke.spec.js')).toBe(false);
  });

  it('does not keep the unused legacy app bootstrap entrypoint', () => {
    const primaryHtml = readSource('index.html');
    const serviceWorkerRegisterSource = readSource('public/sw-register.js');

    expect(existsSync('src/app.js')).toBe(false);
    expect(primaryHtml).toContain('src="/src/app-v2/main.tsx"');
    expect(primaryHtml).not.toContain('/src/app.js');
    expect(serviceWorkerRegisterSource).not.toContain('app.js');
  });

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

  it('does not keep the legacy privacidade route or internal static view', () => {
    const routesSource = readSource('src/ui/controller/routes.js');
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');
    const contaSource = readSource('src/ui/views/conta.js');

    expect(existsSync('src/ui/views/privacidade.js')).toBe(false);
    expect(routesSource).not.toContain('renderPrivacidade');
    expect(routesSource).not.toContain("registerRoute('privacidade'");
    expect(shellViewsSource).not.toContain('view-privacidade');
    expect(contaSource).not.toContain("goTo('privacidade')");
    expect(contaSource).toContain('/legal/privacidade.html');
  });

  it('does not keep the legacy alertas standalone route, view or shell shortcuts', () => {
    const routesSource = readSource('src/ui/controller/routes.js');
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');
    const sidebarSource = readSource('src/ui/shell/templates/sidebar.js');
    const headerSource = readSource('src/ui/shell/templates/header.js');
    const headerComposableSource = readSource('src/ui/composables/header.js');
    const navigationHandlersSource = readSource('src/ui/controller/handlers/navigationHandlers.js');
    const navigationModeSource = readSource('src/ui/shell/navigationMode.js');

    expect(existsSync('src/ui/views/alertas.js')).toBe(false);
    expect(existsSync('src/ui/viewModels/alertasViewModel.js')).toBe(false);
    expect(routesSource).not.toContain('renderAlertas');
    expect(routesSource).not.toContain("registerRoute('alertas'");
    expect(shellViewsSource).not.toContain('view-alertas');
    expect(shellViewsSource).not.toContain('alertas-contextual');
    expect(shellViewsSource).not.toContain('lista-alertas');
    expect(sidebarSource).not.toContain('data-nav="alertas"');
    expect(headerSource).not.toContain('data-action="go-alertas"');
    expect(headerComposableSource).not.toContain('header-alert-pill');
    expect(headerComposableSource).not.toContain('header-help-menu-alert-badge');
    expect(navigationHandlersSource).not.toContain("on('go-alertas'");
    expect(navigationModeSource).not.toContain("'alertas'");
  });
});
