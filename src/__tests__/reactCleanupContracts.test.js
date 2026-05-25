import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { CLIENTES_PUBLIC_IDS } from '../ui/viewModels/clientesContracts.js';

function readSource(path) {
  return readFileSync(path, 'utf8');
}

describe('React cleanup contracts', () => {
  it('does not keep the legacy src/react runtime tree after DOM renderer migration', () => {
    expect(existsSync('src/react')).toBe(false);
  });

  it('does not keep stale React island names on current DOM handler tests', () => {
    expect(existsSync('src/__tests__/registroReactFieldHandlers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/equipamentosReactHeaderLegacyHandlers.test.jsx')).toBe(false);
    expect(existsSync('e2e/specs/react-islands-lifecycle.spec.js')).toBe(false);
  });

  it('keeps active Equipamentos DOM tests out of legacy file names', () => {
    [
      'src/__tests__/equipamentosLegacyHeaderHandlers.test.js',
      'src/__tests__/equipamentosLegacyHeroFiltersContext.test.js',
      'src/__tests__/equipamentosLegacyPhotosNameplatePaywall.test.js',
      'src/__tests__/equipamentosLegacyRender.test.js',
      'src/__tests__/equipamentosLegacySetorDetailHandlers.test.js',
    ].forEach((path) => {
      expect(existsSync(path)).toBe(false);
    });

    [
      'src/__tests__/equipamentosDomHeaderHandlers.test.js',
      'src/__tests__/equipamentosDomHeroFiltersContext.test.js',
      'src/__tests__/equipamentosDomNameplateGate.test.js',
      'src/__tests__/equipamentosDomRender.test.js',
      'src/__tests__/equipamentosDomSetorDetailHandlers.test.js',
    ].forEach((path) => {
      expect(existsSync(path)).toBe(true);
    });
  });

  it('keeps active Historico DOM render tests out of legacy file names', () => {
    [
      'src/__tests__/historicoFiltersLegacyRender.test.js',
      'src/__tests__/historicoTimelineLegacyRender.test.js',
    ].forEach((path) => {
      expect(existsSync(path)).toBe(false);
    });

    [
      'src/__tests__/historicoFiltersDomRender.test.js',
      'src/__tests__/historicoTimelineDomRender.test.js',
    ].forEach((path) => {
      expect(existsSync(path)).toBe(true);
    });
  });

  it('keeps active Registro DOM tests out of legacy file names', () => {
    [
      'src/__tests__/registroLegacyChecklistRender.test.js',
      'src/__tests__/registroLegacyFieldHandlers.test.js',
      'src/__tests__/registroLegacyHeaderRender.test.js',
    ].forEach((path) => {
      expect(existsSync(path)).toBe(false);
    });

    [
      'src/__tests__/registroDomChecklistRender.test.js',
      'src/__tests__/registroDomFieldHandlers.test.js',
      'src/__tests__/registroDomHeaderRender.test.js',
    ].forEach((path) => {
      expect(existsSync(path)).toBe(true);
    });
  });

  it('does not keep the temporary IntegrationProbe artifacts in product code', () => {
    expect(existsSync('src/ui/controller/routes.js')).toBe(false);
    expect(existsSync('src/app.js')).toBe(false);
    expect(existsSync('src/react/components/IntegrationProbe.jsx')).toBe(false);
    expect(existsSync('src/react/entrypoints/integrationProbe.jsx')).toBe(false);
  });

  it('keeps clientes search on the current DOM contract instead of #clientes-busca', () => {
    const clientesPage = readSource('src/ui/views/clientes/pageRenderer.js');

    expect(CLIENTES_PUBLIC_IDS.searchInput).toBe('cli-search-input');
    expect(clientesPage).toContain('id="${CLIENTES_PUBLIC_IDS.searchInput}"');
    expect(clientesPage).not.toContain('clientes-busca');
  });
});
