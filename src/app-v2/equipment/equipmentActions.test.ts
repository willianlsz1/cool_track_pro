import { describe, expect, it } from 'vitest';

import { createAppV2MockSnapshot } from '../data/appV2MockStore';
import {
  archiveEquipment,
  deleteEquipmentSector,
  saveEquipment,
  saveEquipmentAttachment,
  saveEquipmentSector,
  unarchiveEquipment,
} from './equipmentActions';

describe('saveEquipment', () => {
  it('cria equipamento mockado com nome, local e dados operacionais basicos', () => {
    const snapshot = createAppV2MockSnapshot({ equipamentos: [] });

    const result = saveEquipment(snapshot, {
      id: 'eq-novo',
      nome: 'Self contained loja',
      local: 'Area de vendas',
      tipo: 'Refrigeracao',
      tag: 'SELF-001',
      componente: 'Evaporadora',
      fluidoRefrigerante: 'R-410A',
      marcaModelo: 'Carrier 24.000 BTU',
      numeroSerie: '312KAKY3F817',
      capacidadeBtuh: '24000',
      clienteId: 'cliente-1',
      status: 'warn',
      criticidade: 'alta',
      prioridadeOperacional: 'alta',
      periodicidadePreventivaDias: '45',
    });

    expect(result.equipamentos).toHaveLength(1);
    expect(result.equipamentos[0]).toMatchObject({
      id: 'eq-novo',
      nome: 'Self contained loja',
      local: 'Area de vendas',
      tipo: 'Refrigeracao',
      tag: 'SELF-001',
      componente: 'Evaporadora',
      fluidoRefrigerante: 'R-410A',
      marcaModelo: 'Carrier 24.000 BTU',
      numeroSerie: '312KAKY3F817',
      capacidadeBtuh: '24000',
      clienteId: 'cliente-1',
      status: 'warn',
      criticidade: 'alta',
      prioridadeOperacional: 'alta',
      periodicidadePreventivaDias: 45,
    });
  });

  it('preserva setor mock/local ao criar equipamento sem tocar fotos ou delecao', () => {
    const snapshot = createAppV2MockSnapshot({ equipamentos: [] });

    const result = saveEquipment(snapshot, {
      id: 'eq-novo',
      nome: 'Self contained loja',
      local: 'Area de vendas',
      setorId: ' setor-1 ',
    });

    expect(result.equipamentos[0]).toMatchObject({
      id: 'eq-novo',
      setorId: 'setor-1',
    });
    expect(result.equipamentos[0]).not.toHaveProperty('fotos');
  });

  it('herda cliente do setor quando o equipamento novo nao informa cliente', () => {
    const snapshot = createAppV2MockSnapshot({
      setores: [{ id: 'setor-1', nome: 'Recepcao', clienteId: 'cliente-1' }],
      equipamentos: [],
    });

    const result = saveEquipment(snapshot, {
      id: 'eq-novo',
      nome: 'Self contained loja',
      local: 'Area de vendas',
      setorId: 'setor-1',
    });

    expect(result.equipamentos[0]).toMatchObject({
      id: 'eq-novo',
      setorId: 'setor-1',
      clienteId: 'cliente-1',
    });
  });

  it('preserva cliente escolhido no equipamento mesmo quando o setor tem outro cliente', () => {
    const snapshot = createAppV2MockSnapshot({
      setores: [{ id: 'setor-1', nome: 'Recepcao', clienteId: 'cliente-1' }],
      equipamentos: [],
    });

    const result = saveEquipment(snapshot, {
      id: 'eq-novo',
      nome: 'Self contained loja',
      local: 'Area de vendas',
      clienteId: 'cliente-2',
      setorId: 'setor-1',
    });

    expect(result.equipamentos[0]).toMatchObject({
      clienteId: 'cliente-2',
      setorId: 'setor-1',
    });
  });

  it('bloqueia criacao sem nome com mensagem amigavel', () => {
    const snapshot = createAppV2MockSnapshot({ equipamentos: [] });

    expect(() =>
      saveEquipment(snapshot, {
        id: 'eq-novo',
        nome: ' ',
        local: 'Area de vendas',
      }),
    ).toThrow('Informe o nome do equipamento.');
  });

  it('bloqueia criacao sem local com mensagem amigavel', () => {
    const snapshot = createAppV2MockSnapshot({ equipamentos: [] });

    expect(() =>
      saveEquipment(snapshot, {
        id: 'eq-novo',
        nome: 'Self contained loja',
        local: '',
      }),
    ).toThrow('Informe o local do equipamento.');
  });

  it('edita equipamento existente preservando id e sem duplicar historico local', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-1',
          nome: 'Split antigo',
          local: 'Recepcao',
          status: 'ok',
        },
      ],
    });

    const result = saveEquipment(snapshot, {
      id: 'eq-1',
      nome: 'Split revisado',
      local: 'Sala principal',
      status: 'danger',
    });

    expect(result.equipamentos).toHaveLength(1);
    expect(result.equipamentos[0]).toMatchObject({
      id: 'eq-1',
      nome: 'Split revisado',
      local: 'Sala principal',
      status: 'danger',
    });
  });

  it('preserva campos operacionais existentes quando a edicao minima nao os envia', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-1',
          nome: 'Split antigo',
          local: 'Recepcao',
          status: 'ok',
          criticidade: 'alta',
          prioridadeOperacional: 'alta',
          periodicidadePreventivaDias: 30,
          componente: 'Condensadora',
          fluidoRefrigerante: 'R-410A',
          marcaModelo: 'York 30 TR',
          numeroSerie: 'SERIE-123',
          capacidadeBtuh: '360000',
          setorId: 'setor-1',
        },
      ],
    });

    const result = saveEquipment(snapshot, {
      id: 'eq-1',
      nome: 'Split revisado',
      local: 'Recepcao',
    });

    expect(result.equipamentos[0]).toMatchObject({
      id: 'eq-1',
      nome: 'Split revisado',
      criticidade: 'alta',
      prioridadeOperacional: 'alta',
      periodicidadePreventivaDias: 30,
      componente: 'Condensadora',
      fluidoRefrigerante: 'R-410A',
      marcaModelo: 'York 30 TR',
      numeroSerie: 'SERIE-123',
      capacidadeBtuh: '360000',
      setorId: 'setor-1',
    });
  });

  it('bloqueia edicao de equipamento inexistente', () => {
    const snapshot = createAppV2MockSnapshot({ equipamentos: [] });

    expect(() =>
      saveEquipment(snapshot, {
        id: 'eq-inexistente',
        nome: 'Split revisado',
        local: 'Sala principal',
        mode: 'edit',
      }),
    ).toThrow('Equipamento não encontrado para edição.');
  });
});

describe('saveEquipmentSector', () => {
  it('cria setor mock/local sem tocar storage real ou equipamentos existentes', () => {
    const snapshot = createAppV2MockSnapshot({ setores: [] });

    const result = saveEquipmentSector(snapshot, {
      id: 'setor-novo',
      nome: 'Casa de maquinas',
      clienteId: 'cliente-1',
      cor: '#0F766E',
      responsavel: 'Equipe A',
      descricao: 'Area tecnica interna',
    });

    expect(result.setores).toHaveLength(1);
    expect(result.setores[0]).toMatchObject({
      id: 'setor-novo',
      nome: 'Casa de maquinas',
      clienteId: 'cliente-1',
      cor: '#0F766E',
      responsavel: 'Equipe A',
      descricao: 'Area tecnica interna',
    });
    expect(result.equipamentos).toHaveLength(snapshot.equipamentos.length);
  });

  it('edita setor existente preservando id e sem criar duplicado', () => {
    const snapshot = createAppV2MockSnapshot({
      setores: [
        {
          id: 'setor-1',
          nome: 'Recepcao',
          clienteId: 'cliente-1',
          cor: '#2563EB',
        },
      ],
    });

    const result = saveEquipmentSector(snapshot, {
      id: 'setor-1',
      nome: 'Recepcao tecnica',
      clienteId: 'cliente-1',
      cor: '#16A34A',
      mode: 'edit',
    });

    expect(result.setores).toHaveLength(1);
    expect(result.setores[0]).toMatchObject({
      id: 'setor-1',
      nome: 'Recepcao tecnica',
      cor: '#16A34A',
    });
  });

  it('bloqueia setor sem nome com mensagem amigavel', () => {
    const snapshot = createAppV2MockSnapshot();

    expect(() =>
      saveEquipmentSector(snapshot, {
        id: 'setor-novo',
        nome: ' ',
      }),
    ).toThrow('Informe o nome do setor.');
  });
});

describe('saveEquipmentAttachment', () => {
  it('adiciona anexo placeholder/local ao equipamento sem arquivo real', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [{ id: 'eq-1', nome: 'Split', local: 'Recepcao', status: 'ok' }],
    });

    const result = saveEquipmentAttachment(snapshot, 'eq-1', {
      id: 'anexo-1',
      kind: 'foto',
      label: 'Foto local de referencia',
      source: 'placeholder',
      createdAt: '2026-05-10',
      cover: true,
    });

    expect(result.equipamentos[0]?.anexos).toEqual([
      {
        id: 'anexo-1',
        kind: 'foto',
        label: 'Foto local de referencia',
        source: 'placeholder',
        createdAt: '2026-05-10',
        cover: true,
      },
    ]);
    expect(result.equipamentos[0]?.anexos?.[0]).not.toHaveProperty('url');
    expect(result.equipamentos[0]?.anexos?.[0]).not.toHaveProperty('path');
    expect(result.equipamentos[0]?.anexos?.[0]).not.toHaveProperty('dataUrl');
  });

  it('limita anexos locais a tres itens por equipamento', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-1',
          nome: 'Split',
          local: 'Recepcao',
          status: 'ok',
          anexos: [
            {
              id: 'anexo-1',
              kind: 'foto',
              label: 'Foto 1',
              source: 'placeholder',
              createdAt: '2026-05-10',
            },
            {
              id: 'anexo-2',
              kind: 'documento',
              label: 'Documento 2',
              source: 'placeholder',
              createdAt: '2026-05-10',
            },
            {
              id: 'anexo-3',
              kind: 'documento',
              label: 'Documento 3',
              source: 'mock',
              createdAt: '2026-05-10',
            },
          ],
        },
      ],
    });

    expect(() =>
      saveEquipmentAttachment(snapshot, 'eq-1', {
        id: 'anexo-4',
        kind: 'foto',
        label: 'Foto 4',
        source: 'placeholder',
        createdAt: '2026-05-10',
      }),
    ).toThrow('Limite de 3 anexos por equipamento.');
  });

  it('bloqueia metadados de storage real no placeholder local', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [{ id: 'eq-1', nome: 'Split', local: 'Recepcao', status: 'ok' }],
    });

    expect(() =>
      saveEquipmentAttachment(snapshot, 'eq-1', {
        id: 'anexo-1',
        kind: 'foto',
        label: 'Foto local',
        source: 'placeholder',
        createdAt: '2026-05-10',
        url: 'https://storage.example/anexo-1',
      } as never),
    ).toThrow('Anexo local não aceita arquivo, URL ou storage real.');
  });
});

describe('deleteEquipmentSector', () => {
  it('remove setor mock/local e limpa setorId dos equipamentos sem remover equipamentos ou registros', () => {
    const snapshot = createAppV2MockSnapshot({
      setores: [
        { id: 'setor-1', nome: 'Recepcao' },
        { id: 'setor-2', nome: 'Camara fria' },
      ],
      equipamentos: [
        { id: 'eq-1', nome: 'Split', local: 'Recepcao', status: 'ok', setorId: 'setor-1' },
        { id: 'eq-2', nome: 'Camara', local: 'Cozinha', status: 'warn', setorId: 'setor-2' },
      ],
      registros: [
        {
          id: 'reg-1',
          equipamentoId: 'eq-1',
          data: '2026-05-16',
          tipo: 'preventiva',
          status: 'ok',
          tecnico: 'Ana',
        },
      ],
    });

    const result = deleteEquipmentSector(snapshot, 'setor-1');

    expect(result.setores.map((setor) => setor.id)).toEqual(['setor-2']);
    expect(result.equipamentos).toHaveLength(2);
    expect(result.equipamentos.find((item) => item.id === 'eq-1')).not.toHaveProperty('setorId');
    expect(result.equipamentos.find((item) => item.id === 'eq-2')).toMatchObject({
      setorId: 'setor-2',
    });
    expect(result.registros).toHaveLength(1);
  });

  it('bloqueia delecao do pseudo setor sem setor', () => {
    const snapshot = createAppV2MockSnapshot();

    expect(() => deleteEquipmentSector(snapshot, '__sem_setor__')).toThrow(
      'Não é possível remover o agrupamento Sem setor.',
    );
  });
});

describe('archiveEquipment', () => {
  it('arquiva equipamento mock/local preservando registros, compromissos e orcamentos', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-1',
          nome: 'Split',
          local: 'Recepcao',
          status: 'ok',
        },
      ],
      compromissos: [
        {
          id: 'comp-1',
          equipamentoId: 'eq-1',
          tipo: 'preventiva',
          status: 'agendado',
          dataAlvo: '2026-05-20',
          origem: 'manual',
        },
      ],
      registros: [
        {
          id: 'reg-1',
          equipamentoId: 'eq-1',
          data: '2026-05-16',
          tipo: 'preventiva',
          status: 'ok',
          tecnico: 'Ana',
        },
      ],
      orcamentos: [
        {
          id: 'orc-1',
          numero: 'ORC-1',
          status: 'rascunho',
          equipamentoId: 'eq-1',
          titulo: 'Pecas',
          total: 100,
        },
      ],
    });

    const result = archiveEquipment(snapshot, 'eq-1', '2026-05-16');

    expect(result.equipamentos).toHaveLength(1);
    expect(result.equipamentos[0]).toMatchObject({
      id: 'eq-1',
      archivedAt: '2026-05-16',
    });
    expect(result.registros.map((registro) => registro.id)).toEqual(['reg-1']);
    expect(result.compromissos.map((compromisso) => compromisso.id)).toEqual(['comp-1']);
    expect(result.orcamentos.map((orcamento) => orcamento.id)).toEqual(['orc-1']);
  });

  it('preserva anexos placeholder/local ao arquivar equipamento', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-1',
          nome: 'Split',
          local: 'Recepcao',
          status: 'ok',
          anexos: [
            {
              id: 'anexo-1',
              kind: 'foto',
              label: 'Foto local',
              source: 'placeholder',
              createdAt: '2026-05-10',
              cover: true,
            },
          ],
        },
      ],
    });

    const result = archiveEquipment(snapshot, 'eq-1', '2026-05-16');

    expect(result.equipamentos[0]?.anexos).toEqual(snapshot.equipamentos[0]?.anexos);
  });

  it('cancela compromissos agendados do equipamento arquivado sem remover historico', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [
        { id: 'eq-1', nome: 'Split', local: 'Recepcao', status: 'ok' },
        { id: 'eq-2', nome: 'Camara', local: 'Estoque', status: 'warn' },
      ],
      compromissos: [
        {
          id: 'comp-agendado',
          equipamentoId: 'eq-1',
          tipo: 'preventiva',
          status: 'agendado',
          dataAlvo: '2026-05-20',
          origem: 'manual',
        },
        {
          id: 'comp-concluido',
          equipamentoId: 'eq-1',
          tipo: 'preventiva',
          status: 'concluido',
          dataAlvo: '2026-05-01',
          origem: 'manual',
        },
        {
          id: 'comp-outro',
          equipamentoId: 'eq-2',
          tipo: 'corretiva',
          status: 'agendado',
          dataAlvo: '2026-05-21',
          origem: 'manual',
        },
      ],
    });

    const result = archiveEquipment(snapshot, 'eq-1', '2026-05-16');

    expect(result.compromissos).toEqual([
      expect.objectContaining({ id: 'comp-agendado', status: 'cancelado' }),
      expect.objectContaining({ id: 'comp-concluido', status: 'concluido' }),
      expect.objectContaining({ id: 'comp-outro', status: 'agendado' }),
    ]);
  });

  it('bloqueia arquivamento de equipamento inexistente', () => {
    const snapshot = createAppV2MockSnapshot({ equipamentos: [] });

    expect(() => archiveEquipment(snapshot, 'eq-inexistente', '2026-05-16')).toThrow(
      'Equipamento não encontrado para arquivamento.',
    );
  });
});

describe('unarchiveEquipment', () => {
  it('desarquiva equipamento local sem reabrir compromissos cancelados', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-1',
          nome: 'Split',
          local: 'Recepcao',
          status: 'ok',
          archivedAt: '2026-05-16',
        },
      ],
      compromissos: [
        {
          id: 'comp-1',
          equipamentoId: 'eq-1',
          tipo: 'preventiva',
          status: 'cancelado',
          dataAlvo: '2026-05-20',
          origem: 'manual',
        },
      ],
    });

    const result = unarchiveEquipment(snapshot, 'eq-1');

    expect(result.equipamentos[0]).not.toHaveProperty('archivedAt');
    expect(result.compromissos).toEqual([
      expect.objectContaining({ id: 'comp-1', status: 'cancelado' }),
    ]);
  });

  it('bloqueia desarquivamento de equipamento inexistente', () => {
    const snapshot = createAppV2MockSnapshot({ equipamentos: [] });

    expect(() => unarchiveEquipment(snapshot, 'eq-inexistente')).toThrow(
      'Equipamento não encontrado para desarquivamento.',
    );
  });

  it('preserva anexos placeholder/local ao desarquivar equipamento', () => {
    const snapshot = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-1',
          nome: 'Split',
          local: 'Recepcao',
          status: 'ok',
          archivedAt: '2026-05-16',
          anexos: [
            {
              id: 'anexo-1',
              kind: 'foto',
              label: 'Foto local',
              source: 'placeholder',
              createdAt: '2026-05-10',
              cover: true,
            },
          ],
        },
      ],
    });

    const result = unarchiveEquipment(snapshot, 'eq-1');

    expect(result.equipamentos[0]?.anexos).toEqual(snapshot.equipamentos[0]?.anexos);
  });
});
