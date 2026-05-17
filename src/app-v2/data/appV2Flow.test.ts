import { createAppV2MockSnapshot } from './appV2MockStore';
import {
  completeService,
  createQuoteFromServiceRecord,
  registerEquipment,
  scheduleNextCommitment,
  startServiceFromEquipment,
  updateQuoteDraft,
  updateServiceRecord,
} from './appV2Actions';
import {
  selectAppV2OperationalState,
  selectEquipmentInput,
  selectHomeTodayInput,
  selectServiceFlowInput,
  selectServicesHomeInput,
} from './appV2Selectors';
import { buildServicesHomeViewModel } from '../service/servicesHomeViewModel';

describe('app-v2 flow actions', () => {
  it('starts a service from equipment and preselects the next commitment', () => {
    const state = createAppV2MockSnapshot();

    const next = startServiceFromEquipment(state, 'eq-1');

    expect(next.serviceDraft).toMatchObject({
      equipmentId: 'eq-1',
      commitmentId: 'compromisso-1',
      kind: 'preventiva',
      customKind: '',
      diagnosis: '',
      actionsDone: '',
      finalStatus: 'ok',
    });
    expect(state).not.toHaveProperty('serviceDraft');
  });

  it('bloqueia inicio de servico para equipamento arquivado', () => {
    const state = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-archived',
          nome: 'Split arquivado',
          local: 'Sala',
          status: 'ok',
          archivedAt: '2026-05-10',
        },
      ],
    });

    expect(() => startServiceFromEquipment(state, 'eq-archived')).toThrow(
      'Equipamento arquivado não pode iniciar serviço.',
    );
  });

  it('remove equipamentos arquivados da escolha operacional de servico', () => {
    const state = createAppV2MockSnapshot({
      equipamentos: [
        {
          id: 'eq-active',
          nome: 'Split ativo',
          local: 'Sala',
          status: 'ok',
        },
        {
          id: 'eq-archived',
          nome: 'Split arquivado',
          local: 'Deposito',
          status: 'ok',
          archivedAt: '2026-05-10',
        },
      ],
    });

    expect(selectServiceFlowInput(state).equipamentos.map((item) => item.id)).toEqual([
      'eq-active',
    ]);
  });

  it('edita registro existente no mock preservando id e sem duplicar', () => {
    const state = createAppV2MockSnapshot();
    const started = startServiceFromEquipment(state, 'eq-1');
    const draft = {
      ...started.serviceDraft!,
      kind: 'outro' as const,
      customKind: 'Higienizacao',
      technician: 'Ana Tecnica',
      diagnosis: 'Serpentina com sujeira acumulada.',
      actionsDone: 'Limpeza preventiva e teste operacional.',
      partsUsed: 'Filtro de ar',
      partsCost: '120,00',
      laborCost: '250,00',
      nextMaintenanceDate: '2026-06-10',
      finalStatus: 'warn' as const,
    };

    const edited = updateServiceRecord(
      {
        ...started,
        serviceDraft: draft,
      },
      {
        id: 'registro-1',
        date: '2026-05-11',
        technician: draft.technician,
        diagnosis: draft.diagnosis,
        actionsDone: draft.actionsDone,
        finalStatus: draft.finalStatus,
      },
    );

    expect(edited.registros).toHaveLength(state.registros.length);
    expect(edited.registros.filter((item) => item.id === 'registro-1')).toHaveLength(1);
    expect(edited.registros.find((item) => item.id === 'registro-1')).toMatchObject({
      id: 'registro-1',
      equipamentoId: 'eq-1',
      data: '2026-05-11',
      tipo: 'outro',
      tipoDescricao: 'Outro · Higienizacao',
      status: 'warn',
      tecnico: 'Ana Tecnica',
      diagnostico: 'Serpentina com sujeira acumulada.',
      acoesExecutadas: 'Limpeza preventiva e teste operacional.',
      observacoes: 'Serpentina com sujeira acumulada. Limpeza preventiva e teste operacional.',
      pecas: 'Filtro de ar',
      custoPecas: '120,00',
      custoMaoObra: '250,00',
      proximaData: '2026-06-10',
    });
    expect(edited.equipamentos.find((item) => item.id === 'eq-1')?.status).toBe('warn');
  });

  it('edita equipamento e data de registro existente preservando campos migrados', () => {
    const state = createAppV2MockSnapshot();
    const started = startServiceFromEquipment(state, 'eq-1');
    const draft = {
      ...started.serviceDraft!,
      equipmentId: 'eq-2',
      commitmentId: undefined,
      serviceDate: '2026-05-12',
      technician: 'Ana Editora',
      diagnosis: 'Diagnostico separado preservado.',
      actionsDone: 'Acoes separadas preservadas.',
      partsUsed: 'Filtro de ar',
      partsCost: '120,00',
      laborCost: '250,00',
      nextMaintenanceDate: '2026-06-12',
      finalStatus: 'danger' as const,
    };

    const edited = updateServiceRecord(
      {
        ...started,
        serviceDraft: draft,
      },
      {
        id: 'registro-1',
        date: draft.serviceDate,
        technician: draft.technician,
        diagnosis: draft.diagnosis,
        actionsDone: draft.actionsDone,
        finalStatus: draft.finalStatus,
      },
    );

    expect(edited.registros).toHaveLength(state.registros.length);
    expect(edited.registros.find((item) => item.id === 'registro-1')).toMatchObject({
      id: 'registro-1',
      equipamentoId: 'eq-2',
      data: '2026-05-12',
      diagnostico: 'Diagnostico separado preservado.',
      acoesExecutadas: 'Acoes separadas preservadas.',
      pecas: 'Filtro de ar',
      custoPecas: '120,00',
      custoMaoObra: '250,00',
      proximaData: '2026-06-12',
      status: 'danger',
    });
    expect(edited.registros.filter((item) => item.id === 'registro-1')).toHaveLength(1);
    expect(edited.equipamentos.find((item) => item.id === 'eq-2')?.status).toBe('danger');
  });

  it('bloqueia edicao quando equipamento ou data do registro sao invalidos', () => {
    const started = startServiceFromEquipment(createAppV2MockSnapshot(), 'eq-1');
    const completion = {
      id: 'registro-1',
      technician: 'Tecnico',
      diagnosis: 'Diagnostico registrado.',
      actionsDone: 'Acoes registradas.',
      finalStatus: 'ok' as const,
    };

    expect(() => updateServiceRecord(started, { ...completion, date: '' })).toThrow(
      'Informe uma data válida para concluir o serviço.',
    );

    expect(() =>
      updateServiceRecord(
        {
          ...started,
          equipamentos: started.equipamentos.filter((item) => item.id !== 'eq-1'),
        },
        { ...completion, date: '2026-05-11' },
      ),
    ).toThrow('Equipamento não encontrado. Escolha um equipamento válido antes de concluir.');
  });

  it('starts a service from an explicit commitment', () => {
    const state = createAppV2MockSnapshot();

    const next = startServiceFromEquipment(state, 'eq-2', 'compromisso-2');

    expect(next.serviceDraft?.equipmentId).toBe('eq-2');
    expect(next.serviceDraft?.commitmentId).toBe('compromisso-2');
    expect(next.serviceDraft?.kind).toBe('corretiva');
  });

  it('completes a service by adding a recent record and clearing the draft', () => {
    const state = startServiceFromEquipment(createAppV2MockSnapshot(), 'eq-2', 'compromisso-2');

    const next = completeService(state, {
      id: 'registro-novo',
      date: '2026-05-10',
      technician: 'Técnico',
      diagnosis: 'Controlador com alarme intermitente.',
      actionsDone: 'Ajuste de sensor e orientação ao cliente.',
      finalStatus: 'warn',
    });

    expect(next.serviceDraft).toBeNull();
    expect(next.registros[0]).toMatchObject({
      id: 'registro-novo',
      equipamentoId: 'eq-2',
      data: '2026-05-10',
      tipo: 'corretiva',
      status: 'warn',
      tecnico: 'Técnico',
      diagnostico: 'Controlador com alarme intermitente.',
      acoesExecutadas: 'Ajuste de sensor e orientação ao cliente.',
      observacoes: 'Controlador com alarme intermitente. Ajuste de sensor e orientação ao cliente.',
    });
    expect(next.compromissos.find((item) => item.id === 'compromisso-2')?.status).toBe('concluido');
  });

  it('acumula tecnico novo no mock ao concluir servico sem duplicar nomes existentes', () => {
    const state = startServiceFromEquipment(
      {
        ...createAppV2MockSnapshot(),
        tecnicos: ['Bruno'],
      },
      'eq-2',
      'compromisso-2',
    );

    const next = completeService(state, {
      id: 'registro-tecnico',
      date: '2026-05-10',
      technician: ' Ana Tecnica ',
      diagnosis: 'Diagnostico registrado.',
      actionsDone: 'Acoes registradas.',
      finalStatus: 'ok',
    });

    expect(next.tecnicos).toEqual(['Bruno', 'Ana Tecnica']);

    const repeated = completeService(startServiceFromEquipment(next, 'eq-1'), {
      id: 'registro-tecnico-2',
      date: '2026-05-11',
      technician: 'Ana Tecnica',
      diagnosis: 'Diagnostico registrado.',
      actionsDone: 'Acoes registradas.',
      finalStatus: 'ok',
    });

    expect(repeated.tecnicos).toEqual(['Bruno', 'Ana Tecnica']);
  });

  it('acumula tecnico editado no mock ao atualizar registro existente', () => {
    const state = startServiceFromEquipment(
      {
        ...createAppV2MockSnapshot(),
        tecnicos: ['Bruno'],
      },
      'eq-1',
    );

    const edited = updateServiceRecord(
      {
        ...state,
        serviceDraft: {
          ...state.serviceDraft!,
          technician: 'Carla Tecnica',
          diagnosis: 'Diagnostico editado.',
          actionsDone: 'Acoes editadas.',
        },
      },
      {
        id: 'registro-1',
        date: '2026-05-12',
        technician: 'Carla Tecnica',
        diagnosis: 'Diagnostico editado.',
        actionsDone: 'Acoes editadas.',
        finalStatus: 'ok',
      },
    );

    expect(edited.tecnicos).toEqual(['Bruno', 'Carla Tecnica']);
  });

  it('bloqueia conclusao quando o equipamento do rascunho nao existe mais', () => {
    const state = startServiceFromEquipment(createAppV2MockSnapshot(), 'eq-1');
    const withoutEquipment = {
      ...state,
      equipamentos: state.equipamentos.filter((item) => item.id !== 'eq-1'),
    };

    expect(() =>
      completeService(withoutEquipment, {
        id: 'registro-sem-equipamento',
        date: state.today,
        technician: 'Tecnico',
        diagnosis: 'Diagnostico registrado.',
        actionsDone: 'Acoes registradas.',
        finalStatus: 'ok',
      }),
    ).toThrow('Equipamento não encontrado. Escolha um equipamento válido antes de concluir.');
  });

  it('bloqueia conclusao quando a data do registro esta ausente ou invalida', () => {
    const state = startServiceFromEquipment(createAppV2MockSnapshot(), 'eq-1');
    const completion = {
      id: 'registro-data-invalida',
      technician: 'Tecnico',
      diagnosis: 'Diagnostico registrado.',
      actionsDone: 'Acoes registradas.',
      finalStatus: 'ok' as const,
    };

    expect(() => completeService(state, { ...completion, date: '' })).toThrow(
      'Informe uma data válida para concluir o serviço.',
    );
    expect(() => completeService(state, { ...completion, date: '16/05/2026' })).toThrow(
      'Informe uma data válida para concluir o serviço.',
    );
  });

  it('schedules a next commitment without mutating the previous state', () => {
    const state = createAppV2MockSnapshot();

    const next = scheduleNextCommitment(state, {
      id: 'compromisso-novo',
      equipmentId: 'eq-4',
      kind: 'preventiva',
      targetDate: '2026-06-10',
      origin: 'registro',
    });

    expect(next.compromissos).toHaveLength(state.compromissos.length + 1);
    expect(state.compromissos).not.toContainEqual(
      expect.objectContaining({ id: 'compromisso-novo' }),
    );
    expect(next.compromissos[next.compromissos.length - 1]).toMatchObject({
      id: 'compromisso-novo',
      equipamentoId: 'eq-4',
      tipo: 'preventiva',
      status: 'agendado',
      dataAlvo: '2026-06-10',
      origem: 'registro',
    });
  });

  it('derives Home, Equipment and Services inputs from the same operational state', () => {
    const state = createAppV2MockSnapshot();

    const homeInput = selectHomeTodayInput(state);
    const equipmentInput = selectEquipmentInput(state);
    const servicesInput = selectServicesHomeInput(state);
    const operational = selectAppV2OperationalState(state);

    expect(homeInput.equipamentos).toBe(equipmentInput.equipamentos);
    expect(equipmentInput.equipamentos).toBe(servicesInput.equipamentos);
    expect(operational.nextAction).toMatchObject({
      kind: 'compromisso_vencido',
      equipamentoId: 'eq-1',
    });
    expect(operational.serviceDraft).toBeNull();
  });

  it('reflects in-progress and completed service in the operational state', () => {
    const started = startServiceFromEquipment(createAppV2MockSnapshot(), 'eq-2', 'compromisso-2');
    const inProgress = selectAppV2OperationalState(started);

    expect(inProgress.serviceDraft?.equipmentId).toBe('eq-2');

    const completed = completeService(started, {
      id: 'registro-operacional',
      date: '2026-05-10',
      technician: 'Técnico',
      diagnosis: 'Falha intermitente.',
      actionsDone: 'Ajuste executado.',
      finalStatus: 'ok',
    });
    const operational = selectAppV2OperationalState(completed);

    expect(operational.serviceDraft).toBeNull();
    expect(operational.latestRecord?.id).toBe('registro-operacional');
    expect(operational.servicesInput.registros[0]?.id).toBe('registro-operacional');
  });

  it('covers the full equipment-first service journey without UI', () => {
    const emptyAgenda = createAppV2MockSnapshot({
      compromissos: [],
      equipamentos: createAppV2MockSnapshot().equipamentos.filter((item) => item.id !== 'eq-4'),
    });
    const withEquipment = registerEquipment(emptyAgenda, {
      id: 'eq-novo',
      nome: 'Self Piso Teto',
      local: 'Sala técnica',
      status: 'ok',
      clienteId: 'cliente-1',
      tipo: 'Ar condicionado',
      createdAt: emptyAgenda.today,
    });

    expect(selectAppV2OperationalState(withEquipment).nextAction).toMatchObject({
      kind: 'equipamento_sem_primeiro_servico',
      equipamentoId: 'eq-novo',
    });

    const started = startServiceFromEquipment(withEquipment, 'eq-novo');
    expect(selectAppV2OperationalState(started).serviceDraft?.equipmentId).toBe('eq-novo');

    const completed = completeService(started, {
      id: 'registro-jornada',
      date: emptyAgenda.today,
      technician: 'Técnico',
      diagnosis: 'Baixo rendimento informado pelo cliente.',
      actionsDone: 'Limpeza inicial e recomendação de troca de capacitor.',
      finalStatus: 'warn',
    });
    const services = buildServicesHomeViewModel(
      selectAppV2OperationalState(completed).servicesInput,
      null,
    );

    expect(services.recentServices[0]).toMatchObject({
      id: 'registro-jornada',
      equipmentName: 'Self Piso Teto',
      outputStatus: 'orcamento_sugerido',
    });
  });

  it('prioritizes a newly scheduled commitment back on Home', () => {
    const state = createAppV2MockSnapshot({ compromissos: [], registros: [] });

    const scheduled = scheduleNextCommitment(state, {
      id: 'compromisso-retorno',
      equipmentId: 'eq-1',
      kind: 'preventiva',
      targetDate: state.today,
      origin: 'registro',
    });

    expect(selectAppV2OperationalState(scheduled).nextAction).toMatchObject({
      kind: 'compromisso_hoje',
      equipamentoId: 'eq-1',
      compromissoId: 'compromisso-retorno',
    });
  });

  it('keeps an ad-hoc completed service as a pending mock report output', () => {
    const state = createAppV2MockSnapshot({ compromissos: [] });
    const started = startServiceFromEquipment(state, 'eq-4');

    const completed = completeService(started, {
      id: 'registro-relatorio',
      date: state.today,
      technician: 'Técnico',
      diagnosis: 'Visita técnica sem falha ativa.',
      actionsDone: 'Orientação operacional registrada.',
      finalStatus: 'ok',
    });
    const services = buildServicesHomeViewModel(
      selectAppV2OperationalState(completed).servicesInput,
      null,
    );

    expect(services.recentServices[0]).toMatchObject({
      id: 'registro-relatorio',
      outputStatus: 'relatorio_pendente',
    });
  });

  it('preserva descricao customizada quando conclui servico do tipo Outro', () => {
    const started = startServiceFromEquipment(createAppV2MockSnapshot(), 'eq-1');
    const withCustomKind = {
      ...started,
      serviceDraft: {
        ...started.serviceDraft!,
        kind: 'outro' as const,
        customKind: 'Higienizacao',
      },
    };

    const completed = completeService(withCustomKind, {
      id: 'registro-outro',
      date: started.today,
      technician: 'Ana Tecnica',
      diagnosis: 'Atendimento fora das categorias principais.',
      actionsDone: 'Higienizacao completa registrada.',
      finalStatus: 'ok',
    });

    expect(completed.registros[0]).toMatchObject({
      id: 'registro-outro',
      tipo: 'outro',
      tipoDescricao: 'Outro · Higienizacao',
    });
  });
});

it('preserva pecas usadas quando conclui servico com campo opcional preenchido', () => {
  const started = startServiceFromEquipment(createAppV2MockSnapshot(), 'eq-1');
  const withParts = {
    ...started,
    serviceDraft: {
      ...started.serviceDraft!,
      partsUsed: 'Filtro de ar, capacitor 35uF',
    },
  };

  const completed = completeService(withParts, {
    id: 'registro-pecas',
    date: started.today,
    technician: 'Ana Tecnica',
    diagnosis: 'Filtro saturado.',
    actionsDone: 'Limpeza e substituicao preventiva.',
    finalStatus: 'ok',
  });

  expect(completed.registros[0]).toMatchObject({
    id: 'registro-pecas',
    pecas: 'Filtro de ar, capacitor 35uF',
  });
});

it('preserva custos opcionais quando conclui servico sem criar orcamento', () => {
  const started = startServiceFromEquipment(createAppV2MockSnapshot(), 'eq-1');
  const withCosts = {
    ...started,
    serviceDraft: {
      ...started.serviceDraft!,
      partsCost: '120,00',
      laborCost: '250,00',
    },
  };

  const completed = completeService(withCosts, {
    id: 'registro-custos',
    date: started.today,
    technician: 'Ana Tecnica',
    diagnosis: 'Filtro saturado.',
    actionsDone: 'Limpeza e substituicao preventiva.',
    finalStatus: 'ok',
  });

  expect(completed.registros[0]).toMatchObject({
    id: 'registro-custos',
    custoPecas: '120,00',
    custoMaoObra: '250,00',
  });
  expect(completed.orcamentos).toHaveLength(started.orcamentos.length);
});

it('cria orcamento local a partir de registro concluido sem billing ou storage real', () => {
  const started = startServiceFromEquipment(createAppV2MockSnapshot(), 'eq-1');
  const withCosts = {
    ...started,
    serviceDraft: {
      ...started.serviceDraft!,
      partsCost: '120,00',
      laborCost: '250,00',
    },
  };
  const completed = completeService(withCosts, {
    id: 'registro-orcamento',
    date: started.today,
    technician: 'Ana Tecnica',
    diagnosis: 'Filtro saturado.',
    actionsDone: 'Limpeza e substituicao preventiva.',
    finalStatus: 'warn',
  });

  const quoted = createQuoteFromServiceRecord(completed, {
    id: 'orcamento-registro-orcamento',
    recordId: 'registro-orcamento',
  });

  expect(quoted.orcamentos[0]).toMatchObject({
    id: 'orcamento-registro-orcamento',
    numero: 'ORC-2026-002',
    status: 'rascunho',
    clienteId: 'cliente-1',
    equipamentoId: 'eq-1',
    registroId: 'registro-orcamento',
    titulo: 'Orçamento local - Split 24.000 BTU',
    total: 370,
  });
  expect(JSON.stringify(quoted.orcamentos[0])).not.toContain('billing');
  expect(JSON.stringify(quoted.orcamentos[0])).not.toContain('Supabase');
});

it('edita rascunho de orcamento local sem tocar billing ou storage real', () => {
  const state = createAppV2MockSnapshot();

  const edited = updateQuoteDraft(state, {
    id: 'orcamento-1',
    title: 'Troca revisada do controlador',
    total: '1480,50',
    status: 'enviado',
  });

  expect(edited.orcamentos.find((item) => item.id === 'orcamento-1')).toMatchObject({
    id: 'orcamento-1',
    titulo: 'Troca revisada do controlador',
    total: 1480.5,
    status: 'enviado',
  });
  expect(JSON.stringify(edited.orcamentos[0])).not.toContain('billing');
  expect(JSON.stringify(edited.orcamentos[0])).not.toContain('Supabase');
});

it('recalcula rascunho de orcamento local a partir de itens locais simples', () => {
  const state = createAppV2MockSnapshot();

  const edited = updateQuoteDraft(state, {
    id: 'orcamento-1',
    title: 'Troca de controlador com itens',
    total: '0',
    status: 'rascunho',
    items: [
      {
        description: 'Controlador digital',
        quantity: '1',
        unitValue: '980,00',
      },
      {
        description: 'Mao de obra',
        quantity: '2',
        unitValue: '150,00',
      },
    ],
  });

  expect(edited.orcamentos.find((item) => item.id === 'orcamento-1')).toMatchObject({
    id: 'orcamento-1',
    titulo: 'Troca de controlador com itens',
    total: 1280,
    itens: [
      {
        descricao: 'Controlador digital',
        quantidade: 1,
        valorUnitario: 980,
        total: 980,
      },
      {
        descricao: 'Mao de obra',
        quantidade: 2,
        valorUnitario: 150,
        total: 300,
      },
    ],
  });
  expect(JSON.stringify(edited.orcamentos[0])).not.toContain('billing');
  expect(JSON.stringify(edited.orcamentos[0])).not.toContain('Supabase');
});

it('preserva proxima manutencao e cria compromisso mockado ao concluir servico', () => {
  const started = startServiceFromEquipment(createAppV2MockSnapshot({ compromissos: [] }), 'eq-1');
  const withNextMaintenance = {
    ...started,
    serviceDraft: {
      ...started.serviceDraft!,
      nextMaintenanceDate: '2026-06-10',
    },
  };

  const completed = completeService(withNextMaintenance, {
    id: 'registro-proxima',
    date: started.today,
    technician: 'Ana Tecnica',
    diagnosis: 'Filtro saturado.',
    actionsDone: 'Limpeza e substituicao preventiva.',
    finalStatus: 'ok',
  });

  expect(completed.registros[0]).toMatchObject({
    id: 'registro-proxima',
    proximaData: '2026-06-10',
  });
  expect(completed.compromissos).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: 'compromisso-registro-proxima',
        equipamentoId: 'eq-1',
        tipo: 'preventiva',
        status: 'agendado',
        dataAlvo: '2026-06-10',
        origem: 'registro',
      }),
    ]),
  );
});
