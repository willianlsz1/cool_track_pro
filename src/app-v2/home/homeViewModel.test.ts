import { describe, expect, it } from 'vitest';

import { buildHomeTodayViewModel } from './homeViewModel';
import type {
  Cliente,
  CompromissoServico,
  Equipamento,
  Orcamento,
  RegistroServico,
} from '../domain/types';

const cliente: Cliente = {
  id: 'cliente-1',
  nome: 'Mercado Bom Preço',
  endereco: 'Setor frios',
};

const split: Equipamento = {
  id: 'eq-1',
  nome: 'Split 24.000 BTU',
  local: 'Recepção',
  status: 'warn',
  clienteId: cliente.id,
  tipo: 'Ar condicionado',
};

const camara: Equipamento = {
  id: 'eq-2',
  nome: 'Câmara fria',
  local: 'Estoque',
  status: 'danger',
  clienteId: cliente.id,
  tipo: 'Refrigeração',
};

const registroSplit: RegistroServico = {
  id: 'registro-1',
  equipamentoId: split.id,
  data: '2026-05-07',
  tipo: 'preventiva',
  status: 'ok',
  tecnico: 'Técnico',
};

describe('buildHomeTodayViewModel', () => {
  it('prioriza alerta crítico e expõe contador de alertas operacionais', () => {
    const compromissos: CompromissoServico[] = [
      {
        id: 'compromisso-1',
        equipamentoId: split.id,
        tipo: 'preventiva',
        status: 'agendado',
        dataAlvo: '2026-05-08',
        origem: 'periodicidade',
      },
      {
        id: 'compromisso-2',
        equipamentoId: camara.id,
        tipo: 'corretiva',
        status: 'agendado',
        dataAlvo: '2026-05-10',
        origem: 'manual',
      },
    ];

    const viewModel = buildHomeTodayViewModel({
      today: '2026-05-10',
      clientes: [cliente],
      equipamentos: [split, camara],
      compromissos,
      registros: [registroSplit],
    });

    expect(viewModel.context).toBe('Atendimentos de hoje');
    expect(viewModel.nextAction.title).toBe('Equipamento fora de operação');
    expect(viewModel.nextAction.equipmentId).toBe('eq-2');
    expect(viewModel.nextAction.equipmentName).toBe('Câmara fria');
    expect(viewModel.nextAction.customerLine).toBe('Mercado Bom Preço · Estoque');
    expect(viewModel.nextAction.reason).toBe('Status atual marcado como crítico');
    expect(viewModel.nextAction.primaryCta).toBe('Registrar serviço');
    expect(viewModel.nextAction.secondaryAction).toBe('Ver equipamento');
    expect(viewModel.nextAction.tone).toBe('danger');
    expect(viewModel.nextAction.equipmentVisual).toEqual({
      fallbackLabel: 'Refrigeração',
    });
    expect(viewModel.dateLabel).toBe('10/05');
    expect(viewModel.quickStats).toEqual([
      {
        id: 'services-today',
        label: 'Atendimentos',
        value: '2',
        detail: 'para hoje',
        tone: 'primary',
        icon: 'calendar',
      },
      {
        id: 'overdue',
        label: 'Alertas',
        value: '2',
        detail: 'alertas ativos',
        tone: 'danger',
        icon: 'alert',
      },
      {
        id: 'next-window',
        label: 'Próximo',
        value: 'Hoje',
        detail: 'próximo na fila',
        tone: 'primary',
        icon: 'next',
      },
    ]);
    expect(viewModel.queue).toHaveLength(2);
    expect(viewModel.queue[0]?.equipmentId).toBe('eq-1');
    expect(viewModel.queue[0]?.title).toBe('Preventiva · Split 24.000 BTU');
    expect(viewModel.alerts.map((alert) => alert.title)).toEqual([
      'Equipamento fora de operação',
      'Preventiva vencida',
    ]);
    expect(viewModel.alerts[0]).toMatchObject({
      equipmentName: 'Câmara fria',
      detail: 'Status atual marcado como crítico',
      tone: 'danger',
    });
    expect(viewModel.alertTriage).toEqual({
      total: 2,
      criticalTotal: 2,
      label: 'Ver alertas',
      detail: '2 críticos · 2 alertas ativos',
      tone: 'danger',
      hasActiveAlerts: true,
    });
    expect(viewModel.aside.nextInQueue?.title).toBe('Corretiva · Câmara fria');
    expect(viewModel.aside.summary.map((item) => item.id)).not.toContain('estimated-time');
  });

  it('mostra estado sem urgências quando todos os equipamentos já têm serviço', () => {
    const viewModel = buildHomeTodayViewModel({
      today: '2026-05-10',
      clientes: [cliente],
      equipamentos: [split],
      compromissos: [],
      registros: [registroSplit],
    });

    expect(viewModel.nextAction.title).toBe('Sem urgências agora');
    expect(viewModel.nextAction.reason).toBe('Nenhuma preventiva ou corretiva vencida para hoje');
    expect(viewModel.nextAction.primaryCta).toBe('Buscar equipamento');
    expect(viewModel.nextAction.secondaryAction).toBe('Ver fila');
    expect(viewModel.nextAction.tone).toBe('calm');
    expect(viewModel.queue).toEqual([]);
    expect(viewModel.alertTriage).toEqual({
      total: 0,
      criticalTotal: 0,
      label: 'Ver alertas',
      detail: 'Tudo em dia',
      tone: 'calm',
      hasActiveAlerts: false,
    });
  });

  it('expoe chamada discreta para rascunho de orcamento em aberto', () => {
    const quote: Orcamento = {
      id: 'orcamento-1',
      numero: 'ORC-2026-001',
      status: 'rascunho',
      clienteId: cliente.id,
      equipamentoId: split.id,
      titulo: 'Instalacao de split',
      total: 1250,
    };

    const viewModel = buildHomeTodayViewModel({
      today: '2026-05-10',
      clientes: [cliente],
      equipamentos: [split],
      compromissos: [],
      registros: [registroSplit],
      orcamentos: [quote],
    });

    expect(viewModel.openQuoteReminder).toEqual({
      quoteId: 'orcamento-1',
      label: 'Revisar orçamento',
      title: 'Orçamento em aberto',
      detail: 'ORC-2026-001 - Instalacao de split',
      equipmentName: 'Split 24.000 BTU',
    });
  });

  it('nao conta compromissos de equipamento arquivado na Home operacional', () => {
    const viewModel = buildHomeTodayViewModel({
      today: '2026-05-10',
      clientes: [cliente],
      equipamentos: [{ ...split, archivedAt: '2026-05-09' }],
      compromissos: [
        {
          id: 'compromisso-arquivado',
          equipamentoId: split.id,
          tipo: 'preventiva',
          status: 'agendado',
          dataAlvo: '2026-05-09',
          origem: 'periodicidade',
        },
      ],
      registros: [registroSplit],
    });

    expect(viewModel.nextAction.primaryCta).toBe('Buscar equipamento');
    expect(viewModel.quickStats.find((item) => item.id === 'services-today')?.value).toBe('0');
    expect(viewModel.quickStats.find((item) => item.id === 'overdue')?.value).toBe('0');
    expect(viewModel.queue).toEqual([]);
    expect(viewModel.alerts).toEqual([]);
  });
});
