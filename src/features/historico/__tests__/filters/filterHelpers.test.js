import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildHistoricoCurrentFiltersFromValues,
  mergeHistoricoDomCacheFilters,
  normalizeHistoricoFilterCache,
  parseHistoricoUrlFilters,
} from '../../filters/filterHelpers.js';

const urlKeys = {
  busca: 'busca',
  setor: 'setor',
  equip: 'equip',
  periodo: 'periodo',
  tipo: 'tipo',
};

describe('historico filter helpers', () => {
  it('normalizeHistoricoFilterCache monta payload estavel para o cache local', () => {
    expect(normalizeHistoricoFilterCache({ busca: 'split', setor: 'sala', equip: 'eq-1' })).toEqual(
      {
        busca: 'split',
        setor: 'sala',
        equip: 'eq-1',
      },
    );
    expect(normalizeHistoricoFilterCache({ busca: null })).toEqual({
      busca: '',
      setor: '',
      equip: '',
    });
  });

  it('mergeHistoricoDomCacheFilters preserva DOM como source-of-truth e usa cache so quando DOM falta', () => {
    expect(
      mergeHistoricoDomCacheFilters(
        { busca: '', setor: null, equip: 'eq-dom' },
        { busca: 'cached', setor: 'setor-cache', equip: 'eq-cache' },
      ),
    ).toEqual({
      busca: '',
      setor: 'setor-cache',
      equip: 'eq-dom',
    });
  });

  it('parseHistoricoUrlFilters le URLSearchParams recebidos por parametro sem tocar window', () => {
    const params = new URLSearchParams(
      'busca=split&setor=sala&equip=eq-1&periodo=30d&tipo=preventiva',
    );

    expect(parseHistoricoUrlFilters(params, urlKeys)).toEqual({
      busca: 'split',
      setor: 'sala',
      equip: 'eq-1',
      periodo: '30d',
      tipo: 'preventiva',
    });
    expect(parseHistoricoUrlFilters(null, urlKeys)).toEqual({});
  });

  it('buildHistoricoCurrentFiltersFromValues normaliza filtros para VM e cache', () => {
    expect(
      buildHistoricoCurrentFiltersFromValues({
        domCacheFilters: { busca: 'SPLIT', setor: 'sala', equip: 'eq-1' },
        sessionFilters: { period: '90d', tipo: 'corretiva' },
      }),
    ).toEqual({
      filters: {
        busca: 'split',
        filtEq: 'eq-1',
        filtSetor: 'sala',
        period: '90d',
        tipo: 'corretiva',
      },
      cacheFilters: {
        busca: 'split',
        setor: 'sala',
        equip: 'eq-1',
      },
    });
  });

  it('filterHelpers nao importa adapter, DOM, storage, React, handlers ou exportadores', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/features/historico/filters/filterHelpers.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/views/historico');
    expect(source).not.toContain('document');
    expect(source).not.toContain('window');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('React');
    expect(source).not.toContain('Toast');
    expect(source).not.toContain('goTo');
    expect(source).not.toContain('reportExportHandlers');
    expect(source).not.toContain('react/pages');
  });
});
