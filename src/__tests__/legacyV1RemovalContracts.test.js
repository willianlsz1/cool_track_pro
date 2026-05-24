import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readSource(path) {
  return readFileSync(path, 'utf8');
}

function listSourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = `${dir}/${entry}`;
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return listSourceFiles(path);
    }

    if (/\.(?:ts|tsx|js|jsx|html)$/.test(entry)) {
      return [path];
    }

    return [];
  });
}

function findMatches(files, pattern) {
  return files.flatMap((file) => {
    const source = readSource(file);
    return pattern.test(source) ? [file] : [];
  });
}

describe('legacy v1 removal contracts', () => {
  it('does not keep the skipped legacy core-flow e2e smoke after v2 promotion', () => {
    expect(existsSync('e2e/specs/core-flow-smoke.spec.js')).toBe(false);
  });

  it('does not keep the legacy navigation and modal e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/navigation-and-modal.spec.js')).toBe(false);
  });

  it('does not keep the skipped legacy equipamentos visual e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/equipamentos-visual-smoke.spec.js')).toBe(false);
  });

  it('does not keep the skipped legacy unicode escapes e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/unicode-escapes.spec.js')).toBe(false);
  });

  it('does not keep the skipped legacy registro post-save e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/registro-post-save.spec.js')).toBe(false);
  });

  it('does not keep the legacy orcamentos visual e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/orcamentos-visual-smoke.spec.js')).toBe(false);
  });

  it('does not keep the legacy historico functional e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/historico-functional-smoke.spec.js')).toBe(false);
  });

  it('does not keep the legacy relatorio visual e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/relatorio-visual-smoke.spec.js')).toBe(false);
  });

  it('does not keep the legacy registro visual e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/registro-visual-smoke.spec.js')).toBe(false);
  });

  it('does not keep the legacy relatorio export PMOC e2e after v2 promotion', () => {
    expect(existsSync('e2e/specs/relatorio-export-pmoc.spec.js')).toBe(false);
  });

  it('does not keep the unused legacy app bootstrap entrypoint', () => {
    const primaryHtml = readSource('index.html');
    const serviceWorkerRegisterSource = readSource('public/sw-register.js');

    expect(existsSync('src/app.js')).toBe(false);
    expect(primaryHtml).toContain('src="/src/app-v2/main.tsx"');
    expect(primaryHtml).not.toContain('/src/app.js');
    expect(serviceWorkerRegisterSource).not.toContain('app.js');
  });

  it('keeps the primary app-v2 entrypoint independent from the legacy v1 shell runtime', () => {
    const primaryHtml = readSource('index.html');
    const appV2Sources = listSourceFiles('src/app-v2');
    const primaryRuntimeSources = ['index.html', 'vite.config.js', ...appV2Sources];
    const forbiddenLegacyShellPattern =
      /src\/ui\/(?:controller|shell)|\.\.\/ui\/(?:controller|shell)|\.\.\/\.\.\/ui\/(?:controller|shell)/;

    expect(primaryHtml).toContain('src="/src/app-v2/main.tsx"');
    expect(primaryHtml).not.toContain('/src/ui/');
    expect(primaryHtml).not.toContain('/src/app.js');
    expect(findMatches(primaryRuntimeSources, forbiddenLegacyShellPattern)).toEqual([]);
  });

  it('does not keep the legacy feature Profile shim after moving callers to core', () => {
    expect(existsSync('src/features/profile.js')).toBe(false);
  });

  it('does not keep Profile re-exported by the legacy onboarding barrel', () => {
    const onboardingBarrelSource = readSource('src/ui/components/onboarding.js');

    expect(onboardingBarrelSource).not.toMatch(/export\s+\{\s*Profile\s*\}/);
    expect(readSource('src/ui/views/dashboard.js')).toContain(
      "import { Profile } from '../../core/profile.js';",
    );
  });

  it('does not keep the legacy relatorio feature helper after moving copy to domain', () => {
    expect(existsSync('src/features/relatorio/export/reportExportHelpers.js')).toBe(false);
    expect(existsSync('src/features/relatorio/__tests__/export/reportExportHelpers.test.js')).toBe(
      false,
    );
  });

  it('does not keep legacy historico helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/historico')).toBe(false);
  });

  it('does not keep equipamentos view state under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/state')).toBe(false);
  });

  it('does not keep equipamentos view bridges under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/bridges')).toBe(false);
  });

  it('does not keep equipamentos view utils under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/utils')).toBe(false);
  });

  it('does not keep equipamentos nameplate helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/nameplate')).toBe(false);
  });

  it('does not keep equipamentos list renderer under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/listRenderer.js')).toBe(false);
  });

  it('does not keep equipamentos header mount under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/headerMount.js')).toBe(false);
  });

  it('does not keep equipamentos toolbar under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/toolbar.js')).toBe(false);
  });

  it('does not keep equipamentos flat list renderer under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/renderFlatList.js')).toBe(false);
  });

  it('does not keep equipamentos main renderer under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/renderEquip.js')).toBe(false);
  });

  it('does not keep equipamentos setor UI/state under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/setor/setorUI.js')).toBe(false);
    expect(existsSync('src/features/equipamentos/setor/setorState.js')).toBe(false);
  });

  it('does not keep equipamentos setor navigation under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/setor/setorNavigation.js')).toBe(false);
  });

  it('does not keep equipamentos setor persistence under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/setor/setorPersist.js')).toBe(false);
  });

  it('does not keep equipamentos CRUD under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/crud')).toBe(false);
  });

  it('does not keep registro lifecycle helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/lifecycle')).toBe(false);
  });

  it('does not keep registro checklist PMOC helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/checklist')).toBe(false);
  });

  it('does not keep registro payload helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/save/payload.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/payload.test.js')).toBe(false);
  });

  it('does not keep registro persistence helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/save/persistence.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/persistence.test.js')).toBe(false);
  });

  it('does not keep registro photo helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/save/photos.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/photos.test.js')).toBe(false);
  });

  it('does not keep registro signature helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/save/signature.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/signature.test.js')).toBe(false);
  });

  it('does not keep registro post-save/share helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/registro/save/postSave.js')).toBe(false);
    expect(existsSync('src/features/registro/save/reportShare.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/postSave.test.js')).toBe(false);
    expect(existsSync('src/features/registro/__tests__/save/reportShare.test.js')).toBe(false);
  });

  it('does not keep user data account handlers under src/features after co-locating with account UI', () => {
    expect(existsSync('src/features/userData.js')).toBe(false);
  });

  it('does not keep equipamentos detail/view helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/detail.js')).toBe(false);
    expect(existsSync('src/features/equipamentos/ui/detailController.js')).toBe(false);
    expect(existsSync('src/features/equipamentos/ui/detailModel.js')).toBe(false);
    expect(existsSync('src/features/equipamentos/ui/viewEquip.js')).toBe(false);
  });

  it('does not keep equipamentos edit/delete UI helpers under src/features after co-locating with the v1 view', () => {
    expect(existsSync('src/features/equipamentos/ui/openEditEquip.js')).toBe(false);
    expect(existsSync('src/features/equipamentos/ui/deleteEquip.js')).toBe(false);
  });

  it('does not keep the legacy configuracoes route, view or dedicated styles', () => {
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');
    const redesignCss = readSource('src/assets/styles/redesign.css');
    const componentsCss = readSource('src/assets/styles/components.css');

    expect(existsSync('src/ui/controller/routes.js')).toBe(false);
    expect(existsSync('src/ui/views/configuracoes.js')).toBe(false);
    expect(shellViewsSource).not.toContain('view-configuracoes');
    expect(existsSync('src/ui/shell/templates/sidebar.js')).toBe(false);
    expect(existsSync('src/ui/shell/templates/header.js')).toBe(false);
    expect(redesignCss).not.toContain('view-configuracoes');
    expect(componentsCss).not.toContain('_configuracoes.css');
  });

  it('does not keep orphan legacy top-level stylesheets after v2 promotion', () => {
    const primaryHtml = readSource('index.html');

    expect(existsSync('src/assets/styles/base.css')).toBe(false);
    expect(existsSync('src/assets/styles/desktop-fonts.css')).toBe(false);
    expect(existsSync('src/assets/styles/layout.css')).toBe(false);
    expect(existsSync('src/assets/styles/theme-premium.css')).toBe(false);
    expect(existsSync('src/assets/styles/tokens.css')).toBe(false);
    expect(existsSync('src/assets/styles/ux-polish.css')).toBe(false);
    expect(primaryHtml).not.toContain('base.css');
    expect(primaryHtml).not.toContain('desktop-fonts.css');
    expect(primaryHtml).not.toContain('layout.css');
    expect(primaryHtml).not.toContain('theme-premium.css');
    expect(primaryHtml).not.toContain('tokens.css');
    expect(primaryHtml).not.toContain('ux-polish.css');
  });

  it('does not keep the legacy privacidade route or internal static view', () => {
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');
    const contaSource = readSource('src/ui/views/conta.js');

    expect(existsSync('src/ui/controller/routes.js')).toBe(false);
    expect(existsSync('src/ui/views/privacidade.js')).toBe(false);
    expect(shellViewsSource).not.toContain('view-privacidade');
    expect(contaSource).not.toContain("goTo('privacidade')");
    expect(contaSource).toContain('/legal/privacidade.html');
  });

  it('does not keep the legacy alertas standalone route, view or shell shortcuts', () => {
    const shellViewsSource = readSource('src/ui/shell/templates/views.js');
    const headerComposableSource = readSource('src/ui/composables/header.js');
    const navigationHandlersSource = readSource('src/ui/controller/handlers/navigationHandlers.js');
    const navigationModeSource = readSource('src/ui/shell/navigationMode.js');

    expect(existsSync('src/ui/controller/routes.js')).toBe(false);
    expect(existsSync('src/ui/views/alertas.js')).toBe(false);
    expect(existsSync('src/ui/viewModels/alertasViewModel.js')).toBe(false);
    expect(shellViewsSource).not.toContain('view-alertas');
    expect(shellViewsSource).not.toContain('alertas-contextual');
    expect(shellViewsSource).not.toContain('lista-alertas');
    expect(existsSync('src/ui/shell/templates/sidebar.js')).toBe(false);
    expect(existsSync('src/ui/shell/templates/header.js')).toBe(false);
    expect(headerComposableSource).not.toContain('header-alert-pill');
    expect(headerComposableSource).not.toContain('header-help-menu-alert-badge');
    expect(navigationHandlersSource).not.toContain("on('go-alertas'");
    expect(navigationModeSource).not.toContain("'alertas'");
  });
});
