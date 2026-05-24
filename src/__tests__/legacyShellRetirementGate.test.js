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
  'src/ui/controller/handlers/profileAccountHandlers.js',
];

const retiredOrphanLegacyComponentFiles = [
  'src/ui/components/accountModal.js',
  'src/ui/components/offlineBanner.js',
  'src/ui/components/postSaveRegistroCompletion.js',
  'src/ui/components/registroEquipPicker.js',
  'src/ui/components/usageMeter.js',
];

const retiredOrphanLegacyComponentTests = [
  'src/__tests__/postSaveRegistroCompletion.test.js',
  'src/__tests__/registroEquipPicker.test.js',
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
];

const legacyRuntimeKeptForLaterCheckpoints = [
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
    const missingLaterCheckpointFiles = legacyRuntimeKeptForLaterCheckpoints.filter(
      (path) => !existsSync(path),
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
    expect(missingLaterCheckpointFiles).toEqual([]);
  });

  it('keeps app-v2 replacement coverage present before retiring shell/router legacy tests', () => {
    const missingReplacementCoverage = appV2ReplacementCoverage.filter((path) => !existsSync(path));

    expect(missingReplacementCoverage).toEqual([]);
  });
});
