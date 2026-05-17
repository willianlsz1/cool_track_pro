import { describe, expect, it } from 'vitest';

import {
  buildEquipmentDetailViewModel,
  buildEquipmentListViewModel,
  type BuildEquipmentViewModelInput,
} from './equipmentViewModel';
import type {
  Cliente,
  CompromissoServico,
  Equipamento,
  RegistroServico,
  SetorEquipamento,
} from '../domain/types';

const clientes: Cliente[] = [
  {
    id: 'cliente-1',
    nome: 'Mercado Bom Preço',
    contato: '(11) 99999-0000',
    endereco: 'Rua das Palmeiras, 120',
  },
  {
    id: 'cliente-2',
    nome: 'Indústria Frio Sul',
    contato: '(11) 98888-0000',
    endereco: 'Distrito Industrial',
  },
];

const equipamentos: Equipamento[] = [
  {
    id: 'eq-1',
    nome: 'Split 24.000 BTU',
    local: 'Recepção',
    status: 'warn',
    clienteId: 'cliente-1',
    tag: 'SPL-024',
    tipo: 'Ar condicionado',
    componente: 'Evaporadora',
    fluidoRefrigerante: 'R-410A',
    marcaModelo: 'Carrier 24.000 BTU',
    numeroSerie: '312KAKY3F817',
    capacidadeBtuh: '24000',
    criticidade: 'media',
    prioridadeOperacional: 'normal',
    periodicidadePreventivaDias: 105,
    setorId: 'setor-1',
    anexos: [
      {
        id: 'anexo-1',
        kind: 'foto',
        label: 'Foto local evaporadora',
        source: 'placeholder',
        createdAt: '2026-05-10',
        cover: true,
      },
    ],
  },
  {
    id: 'eq-2',
    nome: 'Câmara fria',
    local: 'Estoque',
    status: 'danger',
    clienteId: 'cliente-1',
    tag: 'CAM-001',
    tipo: 'Refrigeração',
    criticidade: 'critica',
    prioridadeOperacional: 'alta',
    setorId: 'setor-2',
  },
  {
    id: 'eq-3',
    nome: 'Central de refrigeração',
    local: 'Produção',
    status: 'ok',
    clienteId: 'cliente-2',
    tag: 'CTR-002',
    tipo: 'Refrigeração',
    criticidade: 'alta',
    prioridadeOperacional: 'alta',
    setorId: 'setor-3',
  },
  {
    id: 'eq-4',
    nome: 'Cassete recepção',
    local: 'Sala de espera',
    status: 'ok',
    clienteId: 'cliente-1',
    tag: 'CAS-010',
    tipo: 'Ar condicionado',
  },
];

const setores: SetorEquipamento[] = [
  {
    id: 'setor-1',
    nome: 'Recepcao',
    clienteId: 'cliente-1',
    cor: '#2563EB',
  },
  {
    id: 'setor-2',
    nome: 'Camara fria',
    clienteId: 'cliente-1',
    cor: '#DC2626',
  },
  {
    id: 'setor-3',
    nome: 'Producao',
    clienteId: 'cliente-2',
    cor: '#16A34A',
  },
];

const compromissos: CompromissoServico[] = [
  {
    id: 'compromisso-1',
    equipamentoId: 'eq-1',
    tipo: 'preventiva',
    status: 'agendado',
    dataAlvo: '2026-05-08',
    origem: 'periodicidade',
  },
  {
    id: 'compromisso-2',
    equipamentoId: 'eq-2',
    tipo: 'corretiva',
    status: 'agendado',
    dataAlvo: '2026-05-10',
    origem: 'manual',
    prioridade: 'alta',
  },
  {
    id: 'compromisso-3',
    equipamentoId: 'eq-3',
    tipo: 'preventiva',
    status: 'agendado',
    dataAlvo: '2026-05-16',
    origem: 'periodicidade',
  },
];

const registros: RegistroServico[] = [
  {
    id: 'registro-1',
    equipamentoId: 'eq-1',
    data: '2026-05-07',
    tipo: 'preventiva',
    status: 'ok',
    tecnico: 'Técnico',
    observacoes: 'Limpeza de filtros e teste de temperatura.',
    proximaData: '2026-06-06',
  },
  {
    id: 'registro-2',
    equipamentoId: 'eq-2',
    data: '2026-05-09',
    tipo: 'corretiva',
    status: 'warn',
    tecnico: 'Técnico',
    observacoes: 'Alarme intermitente no controlador.',
  },
  {
    id: 'registro-3',
    equipamentoId: 'eq-3',
    data: '2026-04-20',
    tipo: 'preventiva',
    status: 'ok',
    tecnico: 'Técnico',
    proximaData: '2026-05-16',
  },
];

const input: BuildEquipmentViewModelInput = {
  today: '2026-05-10',
  clientes,
  setores,
  equipamentos,
  compromissos,
  registros,
};

describe('buildEquipmentListViewModel', () => {
  it('lista equipamentos com cliente, local, status e próxima ação', () => {
    const viewModel = buildEquipmentListViewModel(input);

    expect(viewModel.items).toHaveLength(4);
    expect(viewModel.items[0]).toMatchObject({
      id: 'eq-1',
      name: 'Split 24.000 BTU',
      customerLine: 'Mercado Bom Preço - Recepção',
      sectorLabel: 'Setor: Recepcao',
      metaLine: 'Ar condicionado - SPL-024',
      statusLabel: 'Atenção',
      statusTone: 'warning',
      nextActionLabel: 'Preventiva vencida',
      nextActionTone: 'danger',
      attachmentLabel: '1 anexo',
      coverAttachmentLabel: 'Foto local evaporadora',
    });
  });

  it('resume setores como agrupadores operacionais locais', () => {
    const viewModel = buildEquipmentListViewModel(input);

    expect(viewModel.sectors[0]).toMatchObject({
      id: 'setor-1',
      name: 'Recepcao',
      clientName: 'Mercado Bom Preço',
      equipmentCount: 1,
      equipmentCountLabel: '1 equipamento',
      attentionCount: 1,
      attentionLabel: '1 em atenção',
      nextCommitmentLabel: 'Preventiva vencida desde 08/05',
      equipmentIds: ['eq-1'],
    });
    expect(viewModel.sectors[1]).toMatchObject({
      id: 'setor-2',
      name: 'Camara fria',
      clientName: 'Mercado Bom Preço',
      equipmentCount: 1,
      attentionCount: 1,
      nextCommitmentLabel: 'Corretiva para hoje',
      equipmentIds: ['eq-2'],
    });
  });

  it('filtra equipamentos por setor mock/local sem storage real', () => {
    const viewModel = buildEquipmentListViewModel(input, { sectorId: 'setor-2' });

    expect(viewModel.items.map((item) => item.id)).toEqual(['eq-2']);
    expect(viewModel.items[0]?.sectorLabel).toBe('Setor: Camara fria');
  });

  it('busca por nome, cliente, local e tag sem depender de acentuação', () => {
    expect(buildEquipmentListViewModel(input, { query: 'camara' }).items[0]?.id).toBe('eq-2');
    expect(buildEquipmentListViewModel(input, { query: 'frio sul' }).items[0]?.id).toBe('eq-3');
    expect(
      buildEquipmentListViewModel(input, { query: 'recepcao' }).items.map((item) => item.id),
    ).toEqual(['eq-1', 'eq-4']);
    expect(buildEquipmentListViewModel(input, { query: 'CAS-010' }).items[0]?.id).toBe('eq-4');
  });

  it('filtra equipamentos que exigem atenção operacional', () => {
    const viewModel = buildEquipmentListViewModel(input, { filter: 'attention' });

    expect(viewModel.items.map((item) => item.id)).toEqual(['eq-1', 'eq-2']);
  });

  it('filtra equipamentos críticos', () => {
    const viewModel = buildEquipmentListViewModel(input, { filter: 'critical' });

    expect(viewModel.items.map((item) => item.id)).toEqual(['eq-2', 'eq-3']);
  });

  it('filtra equipamentos sem primeiro serviço', () => {
    const viewModel = buildEquipmentListViewModel(input, { filter: 'without_first_service' });

    expect(viewModel.items.map((item) => item.id)).toEqual(['eq-4']);
    expect(viewModel.items[0]?.nextActionLabel).toBe('Registrar primeiro serviço');
  });
  it('oculta equipamentos arquivados da lista operacional por padrao', () => {
    const viewModel = buildEquipmentListViewModel({
      ...input,
      equipamentos: input.equipamentos.map((equipamento) =>
        equipamento.id === 'eq-1' ? { ...equipamento, archivedAt: '2026-05-16' } : equipamento,
      ),
    });

    expect(viewModel.items.map((item) => item.id)).toEqual(['eq-2', 'eq-3', 'eq-4']);
    expect(viewModel.totalLabel).toBe('3 equipamentos');
  });
});

describe('buildEquipmentDetailViewModel', () => {
  it('monta detalhe com cliente, status e resumo técnico', () => {
    const detail = buildEquipmentDetailViewModel(input, 'eq-1');

    expect(detail).toMatchObject({
      id: 'eq-1',
      name: 'Split 24.000 BTU',
      typeLine: 'Ar condicionado - SPL-024',
      statusLabel: 'Atenção',
      customerName: 'Mercado Bom Preço',
      sectorLabel: 'Setor: Recepcao',
      location: 'Recepção',
      priorityLabel: 'Prioridade normal',
      primaryActionLabel: 'Iniciar serviço',
      secondaryActionLabel: 'Agendar preventiva',
      customerActionLabel: 'Ver cliente',
      lastServiceLabel: 'Preventiva em 07/05',
      nextPreventiveLabel: 'Preventiva vencida desde 08/05',
      note: 'Limpeza de filtros e teste de temperatura.',
      attachmentSummaryLabel: '1/3 anexos locais',
      attachments: [
        {
          id: 'anexo-1',
          kindLabel: 'Foto',
          label: 'Foto local evaporadora',
          sourceLabel: 'Placeholder local',
          coverLabel: 'Capa local',
        },
      ],
    });
  });

  it('monta detalhe de equipamento sem histórico técnico', () => {
    const detail = buildEquipmentDetailViewModel(input, 'eq-4');

    expect(detail.primaryActionLabel).toBe('Registrar primeiro serviço');
    expect(detail.lastServiceLabel).toBe('Sem histórico técnico');
    expect(detail.nextPreventiveLabel).toBe('Sem preventiva agendada');
  });
  it('mantem detalhe de equipamento arquivado com historico preservado', () => {
    const detail = buildEquipmentDetailViewModel(
      {
        ...input,
        equipamentos: input.equipamentos.map((equipamento) =>
          equipamento.id === 'eq-1' ? { ...equipamento, archivedAt: '2026-05-16' } : equipamento,
        ),
      },
      'eq-1',
    );

    expect(detail.archivedLabel).toBe('Arquivado em 16/05');
    expect(detail.statusLabel).toBe('Arquivado');
    expect(detail.primaryActionLabel).toBe('Equipamento arquivado');
    expect(detail.lastServiceLabel).toBe('Preventiva em 07/05');
  });
});
