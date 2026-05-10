import { describe, expect, it } from 'vitest';

import {
  buildEquipmentDetailViewModel,
  buildEquipmentListViewModel,
  type BuildEquipmentViewModelInput,
} from './equipmentViewModel';
import type { Cliente, CompromissoServico, Equipamento, RegistroServico } from '../domain/types';

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
    criticidade: 'media',
    prioridadeOperacional: 'normal',
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
      metaLine: 'Ar condicionado - SPL-024',
      statusLabel: 'Atenção',
      statusTone: 'warning',
      nextActionLabel: 'Preventiva vencida',
      nextActionTone: 'danger',
    });
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
      location: 'Recepção',
      priorityLabel: 'Prioridade normal',
      primaryActionLabel: 'Iniciar serviço',
      secondaryActionLabel: 'Agendar preventiva',
      customerActionLabel: 'Ver cliente',
      lastServiceLabel: 'Preventiva em 07/05',
      nextPreventiveLabel: 'Preventiva vencida desde 08/05',
      note: 'Limpeza de filtros e teste de temperatura.',
    });
  });

  it('monta detalhe de equipamento sem histórico técnico', () => {
    const detail = buildEquipmentDetailViewModel(input, 'eq-4');

    expect(detail.primaryActionLabel).toBe('Registrar primeiro serviço');
    expect(detail.lastServiceLabel).toBe('Sem histórico técnico');
    expect(detail.nextPreventiveLabel).toBe('Sem preventiva agendada');
  });
});
