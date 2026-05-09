import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  buildHistoricoRenderState,
  buildHistoricoRenderViewModel,
  buildHistoricoTimelineRenderContext,
} from '../../render/renderHelpers.js';

describe('historico render helpers', () => {
  it('buildHistoricoRenderState normaliza arrays e preserva colecoes principais', () => {
    const state = {
      registros: [{ id: 'reg-1' }],
      equipamentos: [{ id: 'eq-1' }],
      setores: [{ id: 'setor-1' }],
      clientes: [{ id: 'cliente-1' }],
    };

    expect(buildHistoricoRenderState(state)).toEqual(state);
    expect(buildHistoricoRenderState({ registros: null, equipamentos: undefined })).toEqual({
      registros: [],
      equipamentos: [],
      setores: [],
      clientes: [],
    });
  });

  it('buildHistoricoRenderViewModel chama o VM com filtros, cliente e PMOC preservados', () => {
    const buildHistoricoViewModel = vi.fn(() => ({ list: [{ id: 'reg-1' }] }));
    const buildClientePmocDetails = vi.fn();
    const clienteFilter = { id: 'cliente-1', nome: 'Alpha' };

    const result = buildHistoricoRenderViewModel({
      registros: [{ id: 'reg-1' }],
      equipamentos: [{ id: 'eq-1' }],
      setores: [{ id: 'setor-1' }],
      clientes: [{ id: 'cliente-1' }],
      filters: {
        busca: 'split',
        equipId: 'eq-1',
        setorId: 'setor-1',
        period: '30d',
        tipo: 'preventiva',
      },
      clienteFilter,
      isProMode: true,
      buildClientePmocDetails,
      buildHistoricoViewModel,
    });

    expect(result.list).toEqual([{ id: 'reg-1' }]);
    expect(buildHistoricoViewModel).toHaveBeenCalledWith({
      registros: [{ id: 'reg-1' }],
      equipamentos: [{ id: 'eq-1' }],
      setores: [{ id: 'setor-1' }],
      clientes: [{ id: 'cliente-1' }],
      filters: {
        busca: 'split',
        equipId: 'eq-1',
        setorId: 'setor-1',
        period: '30d',
        tipo: 'preventiva',
      },
      clienteFilter,
      isPro: true,
      buildClientePmocDetails,
    });
  });

  it('buildHistoricoTimelineRenderContext preserva mapas, flags e resumos da timeline', () => {
    const registros = [{ id: 'reg-1', equipId: 'eq-1' }];
    const equipamentos = [{ id: 'eq-1', nome: 'Split' }];
    const setores = [{ id: 'setor-1', nome: 'Loja' }];
    const clientes = [{ id: 'cliente-1', nome: 'Alpha' }];
    const todaySummary = { totalServicosHoje: 1 };
    const attentionItems = [{ id: 'attention-1' }];
    const getTodaySummary = vi.fn(() => todaySummary);
    const getAttentionItems = vi.fn(() => attentionItems);

    const result = buildHistoricoTimelineRenderContext({
      registros,
      equipamentos,
      setores,
      clientes,
      filters: { busca: '', filtEq: 'eq-1', filtSetor: '', period: 'tudo', tipo: '' },
      isProMode: false,
      getTodaySummary,
      getAttentionItems,
    });

    expect(result.equipamentos).toBe(equipamentos);
    expect(result.setoresById.get('setor-1')).toBe(setores[0]);
    expect(result.clientesById.get('cliente-1')).toBe(clientes[0]);
    expect(result.todaySummary).toBe(todaySummary);
    expect(result.attentionItems).toBe(attentionItems);
    expect(result.hasFilters).toBe(true);
    expect(getTodaySummary).toHaveBeenCalledWith(registros);
    expect(getAttentionItems).toHaveBeenCalledWith({
      registros,
      equipamentos,
      clientes,
      setores,
      isPro: false,
    });
  });

  it('renderHelpers nao importa adapter, DOM, React, handlers, Toast ou exportadores', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/features/historico/render/renderHelpers.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/views/historico');
    expect(source).not.toContain('document');
    expect(source).not.toContain('window');
    expect(source).not.toContain('React');
    expect(source).not.toContain('Toast');
    expect(source).not.toContain('goTo');
    expect(source).not.toContain('Storage');
    expect(source).not.toContain('reportExportHandlers');
    expect(source).not.toContain('react/pages/HistoricoTimeline');
    expect(source).not.toContain('react/pages/HistoricoFilters');
    expect(source).not.toContain('react/entrypoints');
  });
});
