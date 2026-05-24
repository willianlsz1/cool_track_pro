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
    const missingLaterCheckpointFiles = legacyRuntimeKeptForLaterCheckpoints.filter(
      (path) => !existsSync(path),
    );

    expect(stillPresentShellFiles).toEqual([]);
    expect(stillPresentShellTests).toEqual([]);
    expect(stillPresentControllerOrchestrator).toEqual([]);
    expect(stillPresentControllerHelpers).toEqual([]);
    expect(stillPresentControllerRoutes).toEqual([]);
    expect(stillPresentOrphanControllerHandlers).toEqual([]);
    expect(missingLaterCheckpointFiles).toEqual([]);
  });

  it('keeps app-v2 replacement coverage present before retiring shell/router legacy tests', () => {
    const missingReplacementCoverage = appV2ReplacementCoverage.filter((path) => !existsSync(path));

    expect(missingReplacementCoverage).toEqual([]);
  });
});
