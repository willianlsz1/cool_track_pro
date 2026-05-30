import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const retiredShellFiles = [
  'src/ui/shell.js',
  'src/ui/shell/headerContracts.js',
  'src/ui/shell/templates/header.js',
  'src/ui/shell/templates/nav.js',
  'src/ui/shell/templates/sidebar.js',
];

const retiredShellTests = [
  'src/__tests__/shell.test.js',
  'src/__tests__/globalHeaderContracts.test.js',
];

const retiredControllerOrchestratorFiles = [
  'src/ui/controller.js',
  'src/__tests__/controller.init.test.js',
];

const retiredControllerHelperFiles = ['src/ui/controller/helpers/themeInitHelpers.js'];

const retiredControllerRouteFiles = ['src/ui/controller/routes.js'];

const retiredOrphanControllerHandlerFiles = [
  'src/ui/controller/handlers/clienteHandlers.js',
  'src/ui/controller/handlers/orcamentoHandlers.js',
  'src/ui/controller/handlers/profileAccountHandlers.js',
];

const retiredOrphanLegacyComponentFiles = [
  'src/ui/components/accountModal.js',
  'src/ui/components/authscreen.js',
  'src/ui/components/offlineBanner.js',
  'src/ui/components/orcamentoModal.js',
  'src/ui/components/orcamentoSignaturePage.js',
  'src/ui/components/passwordRecoveryModal.js',
  'src/ui/components/postSaveRegistroCompletion.js',
  'src/ui/components/registroEquipPicker.js',
  'src/ui/components/usageMeter.js',
];

const retiredOrphanLegacyComponentTests = [
  'src/__tests__/authscreen.redesign.test.js',
  'src/__tests__/contaView.test.js',
  'src/__tests__/orcamentosView.security.test.js',
  'src/__tests__/orcamentosViewModel.test.js',
  'src/__tests__/postSaveRegistroCompletion.test.js',
  'src/__tests__/registroEquipPicker.test.js',
  'src/__tests__/relatorioCardsLegacyHandlers.test.js',
  'src/__tests__/relatorioCompanyPmocContracts.test.js',
  'src/__tests__/relatorioExportPmocLegacyHandlers.test.js',
  'src/__tests__/relatorioLegacyCards.test.js',
  'src/__tests__/relatorioLegacyControls.test.js',
  'src/__tests__/relatorioLegacyHero.test.js',
  'src/__tests__/relatorioNavigationLegacyContracts.test.js',
  'src/__tests__/relatorioView.security.test.js',
  'src/__tests__/relatorioView.test.js',
  'src/__tests__/relatorioViewModel.test.js',
  'src/__tests__/usageMeter.test.js',
];

const retiredOrphanLegacyOnboardingFragments = [
  'src/ui/components/onboarding/firstTimeExperience/steps.js',
  'src/ui/components/onboarding/firstTimeExperience/styles.js',
  'src/ui/components/onboarding/savedHighlight.js',
];

const retiredLegacyBarrelFiles = ['src/ui/views/clientes/renderers.js'];

const retiredLegacyHelperFiles = [
  'src/ui/helpers/equipamentosPure.js',
  'src/ui/helpers/registroPure.js',
  'src/ui/views/dashboard/alerts.js',
  'src/ui/views/dashboard/constants.js',
  'src/ui/views/dashboard/metrics.js',
  'src/ui/views/clientes/cardRenderer.js',
  'src/ui/views/clientes/emptyStateRenderer.js',
  'src/ui/views/clientes/filtersRenderer.js',
  'src/ui/views/clientes/paginationRenderer.js',
  'src/ui/views/clientes/summaryRenderer.js',
  'src/ui/views/conta.js',
  'src/ui/views/orcamentos.js',
  'src/ui/views/relatorio.js',
  'src/ui/views/relatorio/cardsRenderer.js',
  'src/ui/views/relatorio/controlsRenderer.js',
];

const retiredLegacyViewModelFiles = [
  'src/ui/viewModels/orcamentosViewModel.js',
  'src/ui/viewModels/relatorioContracts.js',
  'src/ui/viewModels/relatorioCompanyPmocModel.js',
  'src/ui/viewModels/relatorioViewModel.js',
];

const retiredShellRuntimeFiles = [
  'src/ui/shell/navigationMode.js',
  'src/ui/shell/templates/modals.js',
  'src/ui/shell/templates/views.js',
];

const appV2ReplacementCoverage = [
  'e2e/specs/app-v2-primary-entrypoint.spec.js',
  'e2e/specs/app-v2-authenticated-primary.spec.js',
  'src/app-v2/shell/AppV2Shell.test.tsx',
  'src/app-v2/shell/AppV2ShellDataPort.test.tsx',
];

describe('legacy shell retirement gate', () => {
  it('keeps the retired visual shell removed while preserving later legacy checkpoints', () => {
    const stillPresentShellFiles = retiredShellFiles.filter((path) => existsSync(path));
    const stillPresentShellTests = retiredShellTests.filter((path) => existsSync(path));
    const stillPresentControllerOrchestrator = retiredControllerOrchestratorFiles.filter((path) =>
      existsSync(path),
    );
    const stillPresentControllerHelpers = retiredControllerHelperFiles.filter((path) =>
      existsSync(path),
    );
    const stillPresentControllerRoutes = retiredControllerRouteFiles.filter((path) =>
      existsSync(path),
    );
    const stillPresentOrphanControllerHandlers = retiredOrphanControllerHandlerFiles.filter(
      (path) => existsSync(path),
    );
    const stillPresentOrphanLegacyComponents = retiredOrphanLegacyComponentFiles.filter((path) =>
      existsSync(path),
    );
    const stillPresentOrphanLegacyComponentTests = retiredOrphanLegacyComponentTests.filter(
      (path) => existsSync(path),
    );
    const stillPresentOrphanLegacyOnboardingFragments =
      retiredOrphanLegacyOnboardingFragments.filter((path) => existsSync(path));
    const stillPresentLegacyBarrels = retiredLegacyBarrelFiles.filter((path) => existsSync(path));
    const stillPresentLegacyHelpers = retiredLegacyHelperFiles.filter((path) => existsSync(path));
    const stillPresentLegacyViewModels = retiredLegacyViewModelFiles.filter((path) =>
      existsSync(path),
    );
    const stillPresentShellRuntimeFiles = retiredShellRuntimeFiles.filter((path) =>
      existsSync(path),
    );

    expect(stillPresentShellFiles).toEqual([]);
    expect(stillPresentShellTests).toEqual([]);
    expect(stillPresentControllerOrchestrator).toEqual([]);
    expect(stillPresentControllerHelpers).toEqual([]);
    expect(stillPresentControllerRoutes).toEqual([]);
    expect(stillPresentOrphanControllerHandlers).toEqual([]);
    expect(stillPresentOrphanLegacyComponents).toEqual([]);
    expect(stillPresentOrphanLegacyComponentTests).toEqual([]);
    expect(stillPresentOrphanLegacyOnboardingFragments).toEqual([]);
    expect(stillPresentLegacyBarrels).toEqual([]);
    expect(stillPresentLegacyHelpers).toEqual([]);
    expect(stillPresentLegacyViewModels).toEqual([]);
    expect(stillPresentShellRuntimeFiles).toEqual([]);
  });

  it('keeps app-v2 replacement coverage present before retiring shell/router legacy tests', () => {
    const missingReplacementCoverage = appV2ReplacementCoverage.filter((path) => !existsSync(path));

    expect(missingReplacementCoverage).toEqual([]);
  });

  it('does not keep retired src/ui component/account/composable directories after v1 source removal', () => {
    expect(existsSync('src/ui/components')).toBe(false);
    expect(existsSync('src/ui/account')).toBe(false);
    expect(existsSync('src/ui/composables')).toBe(false);
    expect(existsSync('src/ui/viewModels')).toBe(false);
    expect(existsSync('src/ui/views')).toBe(false);
    expect(existsSync('src/ui/controller')).toBe(false);
    expect(existsSync('src/ui/shell')).toBe(false);
    expect(existsSync('src/ui/helpers')).toBe(false);
    expect(existsSync('src/ui')).toBe(false);
  });

  it('does not keep the dead v1 core/domain substrate after app-v2 became self-contained', () => {
    // App-v2 runtime so depende de core/supabase.js (+supabaseConfig). Todo o
    // restante de core/domain era alcancado apenas pelo src/ui removido.
    expect(existsSync('src/domain')).toBe(false);
    expect(existsSync('src/core/storage')).toBe(false);
    for (const dead of [
      'src/core/auth.js',
      'src/core/clientes.js',
      'src/core/state.js',
      'src/core/storage.js',
      'src/core/router.js',
      'src/core/modal.js',
      'src/core/events.js',
      'src/core/profile.js',
      'src/core/telemetry.js',
      'src/core/equipmentRules.js',
      'src/core/userStorage.js',
    ]) {
      expect(existsSync(dead)).toBe(false);
    }
    // Os unicos modulos compartilhados que sobrevivem.
    expect(existsSync('src/core/supabase.js')).toBe(true);
    expect(existsSync('src/core/supabaseConfig.js')).toBe(true);
  });
});
