import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('React cleanup contracts', () => {
  it('does not keep the legacy src/react runtime tree after DOM renderer migration', () => {
    expect(existsSync('src/react')).toBe(false);
  });

  it('does not keep stale React island names on current DOM handler tests', () => {
    expect(existsSync('src/__tests__/registroReactFieldHandlers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/equipamentosReactHeaderLegacyHandlers.test.jsx')).toBe(false);
    expect(existsSync('e2e/specs/react-islands-lifecycle.spec.js')).toBe(false);
  });

  it('does not keep Equipamentos DOM/legacy test files after v1 removal', () => {
    [
      'src/__tests__/equipamentosLegacyHeaderHandlers.test.js',
      'src/__tests__/equipamentosLegacyHeroFiltersContext.test.js',
      'src/__tests__/equipamentosLegacyPhotosNameplatePaywall.test.js',
      'src/__tests__/equipamentosLegacyRender.test.js',
      'src/__tests__/equipamentosLegacySetorDetailHandlers.test.js',
      'src/__tests__/equipamentosDomHeaderHandlers.test.js',
      'src/__tests__/equipamentosDomHeroFiltersContext.test.js',
      'src/__tests__/equipamentosDomNameplateGate.test.js',
      'src/__tests__/equipamentosDomRender.test.js',
      'src/__tests__/equipamentosDomSetorDetailHandlers.test.js',
    ].forEach((path) => {
      expect(existsSync(path)).toBe(false);
    });
  });

  it('does not keep Historico DOM/legacy render test files after v1 removal', () => {
    [
      'src/__tests__/historicoFiltersLegacyRender.test.js',
      'src/__tests__/historicoTimelineLegacyRender.test.js',
      'src/__tests__/historicoFiltersDomRender.test.js',
      'src/__tests__/historicoTimelineDomRender.test.js',
    ].forEach((path) => {
      expect(existsSync(path)).toBe(false);
    });
  });

  it('does not keep Registro DOM/legacy test files after v1 removal', () => {
    [
      'src/__tests__/registroLegacyChecklistRender.test.js',
      'src/__tests__/registroLegacyFieldHandlers.test.js',
      'src/__tests__/registroLegacyHeaderRender.test.js',
      'src/__tests__/registroDomChecklistRender.test.js',
      'src/__tests__/registroDomFieldHandlers.test.js',
      'src/__tests__/registroDomHeaderRender.test.js',
    ].forEach((path) => {
      expect(existsSync(path)).toBe(false);
    });
  });

  it('does not keep the temporary IntegrationProbe artifacts in product code', () => {
    expect(existsSync('src/ui/controller/routes.js')).toBe(false);
    expect(existsSync('src/app.js')).toBe(false);
    expect(existsSync('src/react/components/IntegrationProbe.jsx')).toBe(false);
    expect(existsSync('src/react/entrypoints/integrationProbe.jsx')).toBe(false);
  });

  it('does not keep the legacy clientes viewModel contract module', () => {
    expect(existsSync('src/ui/viewModels/clientesContracts.js')).toBe(false);
  });
});
