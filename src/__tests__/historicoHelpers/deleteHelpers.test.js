import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  buildHistoricoDeleteStateMutation,
  buildHistoricoEquipmentAfterDelete,
  buildHistoricoRegistrosAfterDelete,
  findHistoricoDeletedRegistro,
  findHistoricoLastRegistroForEquipment,
  recalculateHistoricoEquipamentosAfterDelete,
} from '../../ui/views/historico/helpers/delete/deleteHelpers.js';

const statusDeps = {
  daysDiff: vi.fn(() => 12),
  getOperationalStatus: vi.fn(() => ({ uiStatus: 'warning', label: 'Vencendo' })),
};

function createState() {
  return {
    registros: [
      { id: 'reg-1', equipId: 'eq-1', data: '2026-02-10', status: 'ok' },
      {
        id: 'reg-2',
        equipId: 'eq-1',
        data: '2026-05-01',
        status: 'pendente',
        proxima: '2026-05-20',
      },
      { id: 'reg-3', equipId: 'eq-2', data: '2026-04-01', status: 'ok' },
    ],
    equipamentos: [
      { id: 'eq-1', status: 'ok', statusDescricao: 'Operacional' },
      { id: 'eq-2', status: 'ok', statusDescricao: 'Operacional' },
    ],
    clientes: [{ id: 'cliente-1' }],
  };
}

describe('historico delete helpers', () => {
  it('findHistoricoDeletedRegistro retorna o registro correto e undefined para id ausente', () => {
    const state = createState();

    expect(findHistoricoDeletedRegistro(state.registros, 'reg-2')).toBe(state.registros[1]);
    expect(findHistoricoDeletedRegistro(state.registros, 'missing')).toBeUndefined();
    expect(findHistoricoDeletedRegistro(state.registros, '')).toBeUndefined();
  });

  it('buildHistoricoRegistrosAfterDelete remove somente o registro selecionado', () => {
    const state = createState();

    expect(buildHistoricoRegistrosAfterDelete(state.registros, 'reg-2')).toEqual([
      state.registros[0],
      state.registros[2],
    ]);
  });

  it('findHistoricoLastRegistroForEquipment escolhe o registro mais recente do equipamento', () => {
    const state = createState();

    expect(findHistoricoLastRegistroForEquipment(state.registros, 'eq-1')).toEqual(
      state.registros[1],
    );
    expect(findHistoricoLastRegistroForEquipment(state.registros, 'eq-missing')).toBeNull();
  });

  it('buildHistoricoEquipmentAfterDelete recalcula status e preserva fallback unknown', () => {
    const eq = { id: 'eq-1', status: 'ok', statusDescricao: 'Operacional' };
    const last = { id: 'reg-2', status: 'pendente', proxima: '2026-05-20T10:00:00' };

    expect(buildHistoricoEquipmentAfterDelete(eq, last, statusDeps)).toEqual({
      id: 'eq-1',
      status: 'warning',
      statusDescricao: 'Vencendo',
    });
    expect(statusDeps.daysDiff).toHaveBeenCalledWith('2026-05-20');
    expect(statusDeps.getOperationalStatus).toHaveBeenCalledWith({
      status: 'pendente',
      lastStatus: 'pendente',
      daysToNext: 12,
      ultimoRegistro: last,
    });

    const unknownDeps = {
      daysDiff: vi.fn(),
      getOperationalStatus: vi.fn(() => ({ uiStatus: 'unknown', label: 'Sem dados' })),
    };

    expect(buildHistoricoEquipmentAfterDelete(eq, null, unknownDeps)).toEqual({
      id: 'eq-1',
      status: 'ok',
      statusDescricao: 'Sem dados',
    });
  });

  it('recalculateHistoricoEquipamentosAfterDelete altera somente o equipamento afetado', () => {
    const state = createState();
    const regs = buildHistoricoRegistrosAfterDelete(state.registros, 'reg-2');
    const deleted = state.registros[1];

    const result = recalculateHistoricoEquipamentosAfterDelete(
      state.equipamentos,
      regs,
      deleted,
      statusDeps,
    );

    expect(result[0]).toMatchObject({ id: 'eq-1', status: 'warning', statusDescricao: 'Vencendo' });
    expect(result[1]).toBe(state.equipamentos[1]);
  });

  it('buildHistoricoDeleteStateMutation preserva fallback e monta proximo state', () => {
    const state = createState();

    const missing = buildHistoricoDeleteStateMutation(state, 'missing', statusDeps);
    expect(missing).toEqual({ ...state, registros: state.registros });
    expect(missing.equipamentos).toBe(state.equipamentos);

    const result = buildHistoricoDeleteStateMutation(state, 'reg-2', statusDeps);
    expect(result.registros.map((r) => r.id)).toEqual(['reg-1', 'reg-3']);
    expect(result.equipamentos[0]).toMatchObject({
      id: 'eq-1',
      status: 'warning',
      statusDescricao: 'Vencendo',
    });
    expect(result.equipamentos[1]).toBe(state.equipamentos[1]);
  });

  it('deleteHelpers nao importa adapter, storage, DOM, Toast, handlers ou exportadores', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/ui/views/historico/helpers/delete/deleteHelpers.js'),
      'utf8',
    );

    expect(source).not.toContain('ui/views/historico');
    expect(source).not.toContain('Storage');
    expect(source).not.toContain('setState');
    expect(source).not.toContain('getState');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('Toast');
    expect(source).not.toContain('document');
    expect(source).not.toContain('react/pages');
    expect(source).not.toContain('reportExportHandlers');
  });
});
