import { startServiceFromEquipment } from '../data/appV2Actions';
import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import {
  completeServiceDraft,
  createNextClientId,
  createNextEquipmentId,
  createNextSectorId,
  preserveCurrentServiceDraft,
} from './appV2ShellState';

describe('app-v2 shell state helpers', () => {
  it('gera ids locais sem colidir com equipamentos, clientes e setores existentes', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [
        { id: 'eq-shell-1', nome: 'Split 1', local: 'Sala', status: 'ok' },
        { id: 'eq-shell-2', nome: 'Split 2', local: 'Sala', status: 'ok' },
      ],
      clientes: [{ id: 'cliente-shell-1', nome: 'Cliente local' }],
      setores: [{ id: 'setor-shell-1', nome: 'Recepcao' }],
    });

    expect(createNextEquipmentId(1, snapshot)).toBe('eq-shell-3');
    expect(createNextClientId(1, snapshot)).toBe('cliente-shell-2');
    expect(createNextSectorId(1, snapshot)).toBe('setor-shell-2');
  });

  it('conclui draft novo preservando o id calculado pelo shell', () => {
    const snapshot = createAppV2MockSnapshot();
    const started = startServiceFromEquipment(snapshot, 'eq-1');
    const draft = {
      ...started.serviceDraft!,
      technician: 'Ana Tecnica',
      diagnosis: 'Filtro saturado.',
      actionsDone: 'Limpeza e teste operacional.',
    };

    const result = completeServiceDraft(started, draft);

    expect(result.recordId).toBe(`reg-shell-${snapshot.registros.length + 1}`);
    expect(result.nextState.serviceDraft).toBeNull();
    expect(result.nextState.registros[0]).toMatchObject({
      id: result.recordId,
      equipamentoId: 'eq-1',
      tecnico: 'Ana Tecnica',
    });
  });

  it('preserva draft de servico ativo ao mesclar snapshot local atualizado', () => {
    const snapshot = createAppV2MockSnapshot();
    const current = startServiceFromEquipment(snapshot, 'eq-1');
    const nextSnapshot = {
      ...snapshot,
      equipamentos: [
        ...snapshot.equipamentos,
        { id: 'eq-local', nome: 'Self local', local: 'Sala tecnica', status: 'ok' as const },
      ],
    };

    const merged = preserveCurrentServiceDraft(current, nextSnapshot);

    expect(merged.serviceDraft).toBe(current.serviceDraft);
    expect(merged.equipamentos).toHaveLength(snapshot.equipamentos.length + 1);
  });
});
