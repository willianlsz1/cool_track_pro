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

  it('does not keep stale React island names on legacy DOM handler tests', () => {
    expect(existsSync('src/__tests__/registroReactFieldHandlers.test.js')).toBe(false);
    expect(existsSync('src/__tests__/equipamentosReactHeaderLegacyHandlers.test.jsx')).toBe(false);
    expect(existsSync('e2e/specs/react-islands-lifecycle.spec.js')).toBe(false);
  });

  it('does not keep stale React naming in legacy relatorio runtime helpers', () => {
    const relatorioSource = readSource('src/ui/views/relatorio.js');

    expect(relatorioSource).not.toContain('buildRelatorioHeroReactViewModel');
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
