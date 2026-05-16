import { createAppV2MockSnapshot } from './appV2MockStore';
import {
  completeService,
  registerEquipment,
  scheduleNextCommitment,
  startServiceFromEquipment,
} from './appV2Actions';
import {
  selectAppV2OperationalState,
  selectEquipmentInput,
  selectHomeTodayInput,
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
    ).toThrow('Equipamento nao encontrado. Escolha um equipamento valido antes de concluir.');
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
      'Informe uma data valida para concluir o servico.',
    );
    expect(() => completeService(state, { ...completion, date: '16/05/2026' })).toThrow(
      'Informe uma data valida para concluir o servico.',
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
