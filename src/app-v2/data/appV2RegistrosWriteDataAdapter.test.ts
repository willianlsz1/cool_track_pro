import { describe, expect, it, vi } from 'vitest';

import type { RegistroServico } from '../domain/types';
import type { AppV2FlowState, CompleteServiceInput } from './appV2Actions';
import type { AppV2DataPort } from './appV2DataPort';
import { createAppV2RegistrosWriteDataAdapter } from './appV2RegistrosWriteDataAdapter';

const registro: RegistroServico = {
  id: 'reg-1',
  equipamentoId: 'eq-1',
  data: '2026-05-01',
  tipo: 'corretiva',
  status: 'warn',
  tecnico: 'Ana',
};

const completion: CompleteServiceInput = {
  id: 'reg-1',
  date: '2026-05-01',
  technician: 'Ana',
  diagnosis: '',
  actionsDone: '',
  finalStatus: 'warn',
};

function buildState(registros: RegistroServico[]): AppV2FlowState {
  return {
    today: '2026-05-01',
    clientes: [],
    equipamentos: [],
    setores: [],
    compromissos: [],
    registros,
    tecnicos: [],
    orcamentos: [],
    serviceDraft: null,
  };
}

function buildBasePort(stateAfter: AppV2FlowState): AppV2DataPort {
  return {
    loadSnapshot: vi.fn(),
    saveEquipment: vi.fn(),
    saveClient: vi.fn(),
    saveSector: vi.fn(),
    deleteSector: vi.fn(),
    archiveEquipment: vi.fn(),
    unarchiveEquipment: vi.fn(),
    saveEquipmentAttachment: vi.fn(),
    scheduleCommitment: vi.fn(),
    startServiceFromEquipment: vi.fn(),
    completeService: vi.fn().mockResolvedValue(stateAfter),
    updateServiceRecord: vi.fn().mockResolvedValue(stateAfter),
    createQuoteFromServiceRecord: vi.fn(),
    createPreServiceQuote: vi.fn(),
    updateQuoteDraft: vi.fn(),
  } as unknown as AppV2DataPort;
}

describe('createAppV2RegistrosWriteDataAdapter', () => {
  it('persiste o registro apos completeService e reconcilia com o salvo', async () => {
    const basePort = buildBasePort(buildState([registro]));
    const registrosWriter = vi
      .fn()
      .mockResolvedValue({ ...registro, observacoes: 'salvo no servidor' });

    const port = createAppV2RegistrosWriteDataAdapter({
      basePort,
      userId: ' user-1 ',
      registrosWriter,
    });

    const result = await port.completeService(completion);

    expect(basePort.completeService).toHaveBeenCalledWith(completion);
    expect(registrosWriter).toHaveBeenCalledWith({ userId: 'user-1', registro });
    expect(result.registros[0]).toMatchObject({ id: 'reg-1', observacoes: 'salvo no servidor' });
  });

  it('persiste tambem no updateServiceRecord', async () => {
    const basePort = buildBasePort(buildState([registro]));
    const registrosWriter = vi.fn().mockResolvedValue(registro);

    const port = createAppV2RegistrosWriteDataAdapter({
      basePort,
      userId: 'user-1',
      registrosWriter,
    });

    await port.updateServiceRecord(completion);

    expect(basePort.updateServiceRecord).toHaveBeenCalledWith(completion);
    expect(registrosWriter).toHaveBeenCalledWith({ userId: 'user-1', registro });
  });

  it('cai no basePort sem persistir quando falta userId ou writer', async () => {
    const stateAfter = buildState([registro]);
    const basePort = buildBasePort(stateAfter);
    const registrosWriter = vi.fn();

    const port = createAppV2RegistrosWriteDataAdapter({
      basePort,
      userId: '',
      registrosWriter,
    });

    const result = await port.completeService(completion);

    expect(result).toBe(stateAfter);
    expect(registrosWriter).not.toHaveBeenCalled();
  });

  it('propaga erro do writer (conclusao falha)', async () => {
    const basePort = buildBasePort(buildState([registro]));
    const registrosWriter = vi.fn().mockRejectedValue(new Error('RLS denied'));

    const port = createAppV2RegistrosWriteDataAdapter({
      basePort,
      userId: 'user-1',
      registrosWriter,
    });

    await expect(port.completeService(completion)).rejects.toThrow('RLS denied');
  });
});
