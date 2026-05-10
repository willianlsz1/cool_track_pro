import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import {
  DASHBOARD_ACTIONS,
  DASHBOARD_PUBLIC_CLASSES,
  DASHBOARD_PUBLIC_IDS,
} from '../ui/viewModels/dashboardContracts.js';
import {
  buildDashboardViewModel,
  selectNextDashboardAction,
} from '../ui/viewModels/dashboardViewModel.js';

const NOW = new Date('2026-04-30T12:00:00');

function buildState() {
  const equipamentos = [
    {
      id: 'eq-ok',
      nome: 'Split Recepcao',
      status: 'ok',
      clienteId: 'cliente-1',
      setorId: 'setor-1',
    },
    {
      id: 'eq-danger',
      nome: 'Chiller Central',
      status: 'danger',
      clienteId: 'cliente-1',
      setorId: 'setor-1',
    },
  ];

  return {
    equipamentos,
    clientes: [{ id: 'cliente-1', nome: 'Cliente Alpha' }],
    setores: [{ id: 'setor-1', nome: 'Sala 1', clienteId: 'cliente-1' }],
    registros: [
      {
        id: 'r-current',
        equipId: 'eq-ok',
        data: '2026-04-20T09:00:00',
        tipo: 'Preventiva',
      },
      {
        id: 'r-prev',
        equipId: 'eq-danger',
        data: '2026-03-20T09:00:00',
        tipo: 'Corretiva',
      },
    ],
    alerts: [
      {
        kind: 'critical',
        severity: 'danger',
        title: 'Falha critica',
        subtitle: 'Temperatura alta',
        eq: equipamentos[1],
      },
    ],
  };
}

function healthScore(eq) {
  if (eq.id === 'eq-ok') return 92;
  if (eq.id === 'eq-danger') return 50;
  return 0;
}

function healthClass(score) {
  if (score >= 80) return 'ok';
  if (score >= 55) return 'warn';
  return 'danger';
}

function collectKeys(value, keys = []) {
  if (!value || typeof value !== 'object') return keys;
  Object.keys(value).forEach((key) => {
    keys.push(key);
    collectKeys(value[key], keys);
  });
  return keys;
}

describe('dashboard view model', () => {
  it('representa estado sem dados sem exigir DOM ou HTML', () => {
    const vm = buildDashboardViewModel({
      equipamentos: [],
      registros: [],
      clientes: [],
      setores: [],
      alerts: [],
      userName: 'Ana',
      now: NOW,
      getHealthScore: healthScore,
      getHealthClass: healthClass,
    });

    expect(vm.isEmpty).toBe(true);
    expect(vm.tier).toBe('free');
    expect(vm.isEmpresaPro).toBe(false);
    expect(vm.hero).toMatchObject({
      greeting: 'Ol\u00e1, Ana',
      summary: '0 equipamentos \u2022 0 servi\u00e7os no m\u00eas',
      tone: 'ok',
      primaryCta: { action: 'start-service-registration' },
    });
    expect(vm.kpis.ativos).toMatchObject({
      valueLabel: '\u2014',
      subLabel: 'sem cadastro',
      tone: 'ok',
    });
    expect(vm.kpis.eficiencia).toMatchObject({
      valueLabel: '\u2014',
      subLabel: 'sem dados',
      tone: 'muted',
    });
    expect(vm.kpis.anomalias).toMatchObject({
      valueLabel: '0',
      subLabel: 'sem alerta',
      tone: 'ok',
    });
    expect(vm.nextAction).toMatchObject({
      title: 'Cadastre seu primeiro equipamento',
      cta: { nav: 'historico', label: 'Ver hist\u00f3rico' },
    });
    expect(vm.emptyState).toMatchObject({
      title: 'Cadastre seu primeiro equipamento',
      cta: { action: DASHBOARD_ACTIONS.openModal, id: 'modal-add-eq' },
    });
    expect(collectKeys(vm).join(' ')).not.toMatch(/html|innerHTML|dangerouslySetInnerHTML/i);
  });

  it('calcula KPIs, alertas resumidos e proxima acao com dados reais', () => {
    const state = buildState();
    const vm = buildDashboardViewModel({
      ...state,
      planContext: { planCode: 'pro', hasPro: true },
      navigationMode: 'empresa',
      userName: 'Ana',
      now: NOW,
      getHealthScore: healthScore,
      getHealthClass: healthClass,
    });

    expect(vm.isEmpty).toBe(false);
    expect(vm.tier).toBe('pro');
    expect(vm.isEmpresaPro).toBe(true);
    expect(vm.hero).toMatchObject({
      greeting: 'Opera\u00e7\u00e3o em andamento',
      summary: '1 clientes \u2022 2 equipamentos \u2022 1 servi\u00e7os no m\u00eas',
      tone: 'alert',
    });
    expect(vm.kpis.ativos).toMatchObject({
      valueLabel: '1/2',
      subLabel: '1 fora',
      tone: 'danger',
    });
    expect(vm.kpis.eficiencia).toMatchObject({
      valueLabel: '71%',
      subLabel: 'aten\u00e7\u00e3o',
      tone: 'warn',
      sparkData: [92, 50],
    });
    expect(vm.kpis.mes).toMatchObject({
      count: 1,
      valueLabel: '1',
      subLabel: 'Igual ao m\u00eas passado',
      tone: 'muted',
    });
    expect(vm.alertsSummary).toMatchObject({
      total: 1,
      critical: 1,
      visibleCount: 1,
    });
    expect(vm.nextAction).toMatchObject({
      tone: 'danger',
      title: 'Falha critica',
      subtitle: 'Cliente Alpha \u2022 Sala 1 \u2022 Chiller Central \u2022 Temperatura alta',
      cta: {
        action: DASHBOARD_ACTIONS.goRegisterEquip,
        id: 'eq-danger',
        label: 'Resolver agora',
      },
    });
    expect(vm.month).toMatchObject({
      label: 'Vis\u00e3o da opera\u00e7\u00e3o',
      servicesCount: 1,
      equipmentsCount: 1,
      pendingCount: 1,
      trendLabel: 'Igual ao m\u00eas passado',
    });
  });

  it('prioriza PMOC, critico, vencido, proximo, ultimo servico e vazio', () => {
    const registros = [{ id: 'r1', equipId: 'eq1', data: '2026-04-20T09:00:00' }];
    expect(
      selectNextDashboardAction({
        alerts: [{ kind: 'upcoming', title: 'PMOC atrasado' }],
        equipamentos: [{ id: 'eq1' }],
        registros,
      }),
    ).toMatchObject({ priority: 1, kind: 'pmoc' });
    expect(
      selectNextDashboardAction({
        alerts: [{ kind: 'critical', title: 'Critico' }],
        equipamentos: [{ id: 'eq1' }],
        registros,
      }),
    ).toMatchObject({ priority: 2, kind: 'critical' });
    expect(
      selectNextDashboardAction({
        alerts: [{ kind: 'overdue', title: 'Vencido' }],
        equipamentos: [{ id: 'eq1' }],
        registros,
      }),
    ).toMatchObject({ priority: 3, kind: 'overdue' });
    expect(
      selectNextDashboardAction({
        alerts: [{ kind: 'upcoming', title: 'Proximo' }],
        equipamentos: [{ id: 'eq1' }],
        registros,
      }),
    ).toMatchObject({ priority: 4, kind: 'upcoming' });
    expect(
      selectNextDashboardAction({ alerts: [], equipamentos: [{ id: 'eq1' }], registros }),
    ).toMatchObject({ priority: 5, kind: 'last-service' });
    expect(
      selectNextDashboardAction({ alerts: [], equipamentos: [], registros: [] }),
    ).toMatchObject({ priority: 6, kind: 'empty-equip' });
  });

  it('normaliza dados ausentes e invalidos sem quebrar a futura ilha', () => {
    const vm = buildDashboardViewModel({
      equipamentos: [{ id: 'bad', nome: '<script>alert(1)</script>', status: 'invalid' }],
      registros: [{ id: 'bad-reg', equipId: 'bad', data: 'not-a-date' }],
      clientes: null,
      setores: 'invalid',
      alerts: [{ severity: 'info', title: '<img onerror=alert(1)>' }],
      now: NOW,
      getHealthScore: () => {
        throw new Error('bad score');
      },
      getHealthClass: () => {
        throw new Error('bad class');
      },
    });

    expect(vm.kpis.ativos.valueLabel).toBe('1/1');
    expect(vm.kpis.eficiencia.valueLabel).toBe('0%');
    expect(vm.kpis.eficiencia.tone).toBe('danger');
    expect(vm.kpis.mes.count).toBe(0);
    expect(vm.month.servicesCount).toBe(0);
    expect(vm.alertsSummary.total).toBe(1);
    expect(collectKeys(vm).join(' ')).not.toMatch(/html|innerHTML|dangerouslySetInnerHTML/i);
  });

  it('centraliza contratos publicos e nao importa DOM ou React', () => {
    expect(DASHBOARD_PUBLIC_IDS).toMatchObject({
      view: 'view-inicio',
      root: 'dash',
      hero: 'dash-hero',
      kpiRoot: 'dash-kpis-root',
      kpiAtivos: 'dash-kpi-ativos',
      nextActionCard: 'dash-next-action-card',
      chartStatusPie: 'chart-status-pie',
    });
    expect(DASHBOARD_ACTIONS).toMatchObject({
      openModal: 'open-modal',
      startServiceRegistration: 'start-service-registration',
      goRegisterEquip: 'go-register-equip',
      continueDraft: 'continue-draft',
      discardDraft: 'discard-draft',
    });
    expect(DASHBOARD_PUBLIC_CLASSES).toEqual(
      expect.arrayContaining(['dash', 'dash__hero', 'dash__kpi', 'dash__card']),
    );

    const source = readFileSync('src/ui/viewModels/dashboardViewModel.js', 'utf8');
    expect(source).not.toMatch(/\bdocument\b|\bwindow\b|from ['"]react|react-dom|innerHTML/i);
  });
});
