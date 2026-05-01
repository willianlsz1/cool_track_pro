import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { CLIENTES_PUBLIC_IDS } from '../ui/viewModels/clientesContracts.js';

function readSource(path) {
  return readFileSync(path, 'utf8');
}

describe('React cleanup contracts', () => {
  it('does not keep the temporary IntegrationProbe artifacts in product code', () => {
    const appEntry = readSource('src/app.js');
    const routesEntry = readSource('src/ui/controller/routes.js');

    expect(appEntry).not.toMatch(
      /IntegrationProbe|integrationProbe|react-integration-root|mountReactIntegrationProbe/,
    );
    expect(routesEntry).not.toMatch(
      /IntegrationProbe|integrationProbe|react-integration-root|mountReactIntegrationProbe/,
    );
    expect(existsSync('src/react/components/IntegrationProbe.jsx')).toBe(false);
    expect(existsSync('src/react/entrypoints/integrationProbe.jsx')).toBe(false);
  });

  it('keeps clientes search on the current React contract instead of #clientes-busca', () => {
    const routesEntry = readSource('src/ui/controller/routes.js');
    const clientesPage = readSource('src/react/pages/ClientesPage.jsx');

    expect(CLIENTES_PUBLIC_IDS.searchInput).toBe('cli-search-input');
    expect(clientesPage).toContain('id={CLIENTES_PUBLIC_IDS.searchInput}');
    expect(clientesPage).not.toContain('clientes-busca');
    expect(routesEntry).not.toContain('clientes-busca');
    expect(routesEntry).not.toContain('setClientesSearch');
  });
});
