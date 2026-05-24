import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const legacyShellRouterTests = [
  'src/__tests__/shell.test.js',
  'src/__tests__/navigationMode.test.js',
  'src/__tests__/controller.init.test.js',
  'src/__tests__/contracts/routes.test.js',
  'src/__tests__/clientesRouteAccess.test.js',
  'src/__tests__/equipamentosRouteLifecycle.test.js',
  'src/__tests__/registroRouteLifecycle.test.js',
  'src/__tests__/globalHeaderContracts.test.js',
  'src/__tests__/a11y/views.test.js',
  'src/__tests__/equipmentDetailOverlayShell.test.js',
  'src/__tests__/equipamentosCpIAssets.test.js',
];

const appV2ReplacementCoverage = [
  'e2e/specs/app-v2-primary-entrypoint.spec.js',
  'e2e/specs/app-v2-authenticated-primary.spec.js',
  'src/app-v2/shell/AppV2Shell.test.tsx',
  'src/app-v2/shell/AppV2ShellDataPort.test.tsx',
];

describe('legacy shell retirement gate', () => {
  it('keeps shell/router-only legacy tests tracked until their runtime is retired deliberately', () => {
    expect(existsSync('src/ui/shell.js')).toBe(true);
    expect(existsSync('src/ui/controller.js')).toBe(true);

    const missingLegacyTests = legacyShellRouterTests.filter((path) => !existsSync(path));

    expect(missingLegacyTests).toEqual([]);
  });

  it('keeps app-v2 replacement coverage present before retiring shell/router legacy tests', () => {
    const missingReplacementCoverage = appV2ReplacementCoverage.filter((path) => !existsSync(path));

    expect(missingReplacementCoverage).toEqual([]);
  });
});
