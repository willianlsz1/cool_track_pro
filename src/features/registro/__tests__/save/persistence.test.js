import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

import {
  buildEditedRegistro,
  buildRegistroCreateRecord,
  buildRegistroCreateStateMutation,
  buildRegistroEditStateMutation,
  resolveRegistroCreateId,
} from '../../save/persistence.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const persistedPayload = {
  equipId: 'eq-1',
  data: '2026-04-10T10:00',
  tipo: 'Preventiva',
  tecnico: 'Ana',
  descricaoFinal: 'Servico preventivo completo',
  prioridade: 'alta',
  status: 'manutencao',
  pecas: 'Filtro',
  proxima: '2026-05-10',
  custoPecas: '25',
  custoMaoObra: '100',
  clienteNome: 'Cliente A',
  clienteDocumento: '123',
  localAtendimento: 'Sala 1',
  clienteContato: '(11) 99999-0000',
};

describe('registro save persistence helpers', () => {
  it('monta registro editado preservando checklist existente quando nao ha checklist atual', () => {
    const registro = {
      id: 'reg-1',
      equipId: 'old-eq',
      obs: 'antiga',
      checklist: { template: 'old' },
      extra: 'preservado',
    };

    expect(buildEditedRegistro(registro, persistedPayload)).toMatchObject({
      id: 'reg-1',
      equipId: 'eq-1',
      data: '2026-04-10T10:00',
      tipo: 'Preventiva',
      obs: 'Servico preventivo completo',
      tecnico: 'Ana',
      prioridade: 'alta',
      status: 'manutencao',
      checklist: { template: 'old' },
      extra: 'preservado',
    });
  });

  it('usa checklist atual ao montar registro editado', () => {
    const currentChecklist = { template: 'pmoc', answers: { limpeza: true } };

    expect(
      buildEditedRegistro({ id: 'reg-1', checklist: { template: 'old' } }, persistedPayload, {
        currentChecklist,
      }).checklist,
    ).toBe(currentChecklist);
  });

  it('prepara mutacao de edicao sem mutar o estado de entrada', () => {
    const prev = {
      registros: [
        { id: 'reg-1', equipId: 'old-eq', checklist: { template: 'old' } },
        { id: 'reg-2', equipId: 'eq-2' },
      ],
      equipamentos: [{ id: 'eq-1', status: 'ok' }],
      tecnicos: ['Ana'],
    };
    const reconciledEquipamentos = [{ id: 'eq-1', status: 'manutencao' }];
    const reconcileEquipmentStatusesAfterRegistroEdit = vi.fn(() => reconciledEquipamentos);
    const getCurrentChecklist = vi.fn(() => ({ template: 'pmoc' }));

    const mutation = buildRegistroEditStateMutation(prev, 'reg-1', persistedPayload, {
      getCurrentChecklist,
      reconcileEquipmentStatusesAfterRegistroEdit,
    });

    expect(mutation).not.toBe(prev);
    expect(mutation.registros).not.toBe(prev.registros);
    expect(mutation.registros[0]).toMatchObject({
      id: 'reg-1',
      equipId: 'eq-1',
      checklist: { template: 'pmoc' },
    });
    expect(mutation.registros[1]).toBe(prev.registros[1]);
    expect(mutation.equipamentos).toBe(reconciledEquipamentos);
    expect(prev.registros[0].equipId).toBe('old-eq');
    expect(reconcileEquipmentStatusesAfterRegistroEdit).toHaveBeenCalledWith({
      equipamentos: prev.equipamentos,
      registros: mutation.registros,
      previousRegistro: prev.registros[0],
      updatedRegistro: mutation.registros[0],
    });
  });

  it('resolve id de criacao usando callback injetado', () => {
    const uid = vi.fn(() => 'new-id');

    expect(resolveRegistroCreateId({ uid })).toBe('new-id');
    expect(uid).toHaveBeenCalledTimes(1);
  });

  it('monta registro de criacao preservando payload, fotos, assinatura e checklist', () => {
    const photoPayload = {
      fotos: [{ id: 'foto-1', src: 'safe' }],
      fotos_pendentes: [{ id: 'pending-1' }],
    };
    const assinaturaPayload = { provider: 'supabase', path: 'sig.png' };
    const checklist = { template: 'pmoc' };

    expect(
      buildRegistroCreateRecord({
        registroId: 'reg-new',
        persistedPayload,
        photoPayload,
        assinaturaPayload,
        checklist,
      }),
    ).toEqual({
      id: 'reg-new',
      equipId: 'eq-1',
      data: '2026-04-10T10:00',
      tipo: 'Preventiva',
      obs: 'Servico preventivo completo',
      status: 'manutencao',
      pecas: 'Filtro',
      proxima: '2026-05-10',
      ...photoPayload,
      tecnico: 'Ana',
      prioridade: 'alta',
      custoPecas: '25',
      custoMaoObra: '100',
      clienteNome: 'Cliente A',
      clienteDocumento: '123',
      localAtendimento: 'Sala 1',
      clienteContato: '(11) 99999-0000',
      assinatura: assinaturaPayload,
      checklist,
    });
  });

  it('prepara mutacao de criacao sem mutar entrada e adiciona tecnico novo', () => {
    const registro = { id: 'reg-new', equipId: 'eq-1' };
    const prev = {
      registros: [{ id: 'reg-old' }],
      equipamentos: [
        { id: 'eq-1', status: 'ok', statusDescricao: 'OK' },
        { id: 'eq-2', status: 'ok' },
      ],
      tecnicos: ['Bruno'],
    };

    const mutation = buildRegistroCreateStateMutation(prev, {
      registro,
      persistedPayload,
      operationalStatus: { uiStatus: 'manutencao', label: 'Em manutencao' },
    });

    expect(mutation).not.toBe(prev);
    expect(mutation.registros).toEqual([...prev.registros, registro]);
    expect(mutation.tecnicos).toEqual(['Bruno', 'Ana']);
    expect(mutation.equipamentos[0]).toMatchObject({
      id: 'eq-1',
      status: 'manutencao',
      statusDescricao: 'Em manutencao',
    });
    expect(mutation.equipamentos[1]).toBe(prev.equipamentos[1]);
    expect(prev.registros).toEqual([{ id: 'reg-old' }]);
  });

  it('nao duplica tecnico e preserva status existente quando status operacional e desconhecido', () => {
    const prev = {
      registros: [],
      equipamentos: [{ id: 'eq-1', status: 'alerta' }],
      tecnicos: ['Ana'],
    };

    const mutation = buildRegistroCreateStateMutation(prev, {
      registro: { id: 'reg-new' },
      persistedPayload,
      operationalStatus: { uiStatus: 'unknown', label: 'Indefinido' },
    });

    expect(mutation.tecnicos).toBe(prev.tecnicos);
    expect(mutation.equipamentos[0]).toMatchObject({
      status: 'alerta',
      statusDescricao: 'Indefinido',
    });
  });

  it('nao importa o adapter legado de registro', () => {
    const modulePath = path.resolve(__dirname, '../../save/persistence.js');
    const source = fs.readFileSync(modulePath, 'utf8');

    expect(source).not.toContain('ui/views/registro');
    expect(source).not.toContain('views/registro.js');
  });
});
