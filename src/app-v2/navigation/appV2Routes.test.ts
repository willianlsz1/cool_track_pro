import { describe, expect, it } from 'vitest';

import { getAppV2PathForTab, isKnownAppV2Path, resolveAppV2TabFromPath } from './appV2Routes';

describe('app-v2 primary routes', () => {
  it.each([
    ['/', 'hoje'],
    ['/equipamentos', 'equipamento'],
    ['/equipamentos/', 'equipamento'],
    ['/servicos', 'servicos'],
    ['/conta', 'conta'],
    ['/rota-desconhecida', 'hoje'],
  ] as const)('resolve %s para %s', (path, tab) => {
    expect(resolveAppV2TabFromPath(path)).toBe(tab);
  });

  it.each([
    ['hoje', '/'],
    ['equipamento', '/equipamentos'],
    ['servicos', '/servicos'],
    ['conta', '/conta'],
  ] as const)('mapeia %s para %s', (tab, path) => {
    expect(getAppV2PathForTab(tab)).toBe(path);
  });

  it('diferencia rotas principais conhecidas de subrotas ainda nao contratadas', () => {
    expect(isKnownAppV2Path('/servicos')).toBe(true);
    expect(isKnownAppV2Path('/servicos/orcamentos')).toBe(false);
    expect(isKnownAppV2Path('/equipamentos/eq-1')).toBe(false);
  });
});
