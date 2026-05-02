import { DASHBOARD_ACTIONS } from './dashboardContracts.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const NAV_MODE_EMPRESA = 'empresa';
const PLAN_CODE_PRO = 'pro';
const PLAN_CODE_PLUS = 'plus';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isRecord(value) {
  return value !== null && typeof value === 'object';
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthRange(monthsAgo = 0, now = new Date()) {
  const reference = safeDate(now) || new Date();
  const start = new Date(reference.getFullYear(), reference.getMonth() - monthsAgo, 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() - monthsAgo + 1, 1);
  return { start, end };
}

export function countDashboardRegistrosNoMes(registros = [], monthsAgo = 0, now = new Date()) {
  const { start, end } = monthRange(monthsAgo, now);
  return asArray(registros).filter((registro) => {
    const date = safeDate(registro?.data);
    return date ? date >= start && date < end : false;
  }).length;
}

function sparklineData(registros = [], months = 6, now = new Date()) {
  return Array.from({ length: months }, (_, index) =>
    countDashboardRegistrosNoMes(registros, months - 1 - index, now),
  );
}

function trendTag(current, previous) {
  if (previous === 0 && current === 0) {
    return { text: 'Sem dados anteriores', cls: 'neutral', tone: 'muted' };
  }
  if (previous === 0 && current > 0) {
    return { text: `+${current} este mês`, cls: 'up', tone: 'ok' };
  }
  const diff = current - previous;
  if (diff === 0) return { text: 'Igual ao mês passado', cls: 'neutral', tone: 'muted' };
  if (diff > 0) return { text: `+${diff} vs mês passado`, cls: 'up', tone: 'ok' };
  return { text: `-${Math.abs(diff)} vs mês passado`, cls: 'down', tone: 'warn' };
}

function planTier(planCode) {
  if (planCode === PLAN_CODE_PRO) return 'pro';
  if (planCode === PLAN_CODE_PLUS) return 'plus';
  return 'free';
}

function readHealthScore(eq, getHealthScore) {
  try {
    const score = Number(getHealthScore?.(eq));
    return Number.isFinite(score) ? score : 0;
  } catch {
    return 0;
  }
}

function fallbackHealthClass(score) {
  if (score >= 80) return 'ok';
  if (score >= 55) return 'warn';
  return 'danger';
}

function readHealthClass(score, getHealthClass) {
  try {
    const value = getHealthClass?.(score);
    return value === 'ok' || value === 'warn' || value === 'danger'
      ? value
      : fallbackHealthClass(score);
  } catch {
    return fallbackHealthClass(score);
  }
}

function toneFromHealthClass(healthClass) {
  if (healthClass === 'ok') return 'ok';
  if (healthClass === 'warn') return 'warn';
  return 'danger';
}

function efficiencyLabel(efficiency) {
  if (efficiency >= 90) return 'excelente';
  if (efficiency >= 75) return 'saudável';
  if (efficiency >= 50) return 'atenção';
  return 'intervenção';
}

function sortByDateDesc(items) {
  return [...asArray(items)].sort((a, b) => safeString(b?.data).localeCompare(safeString(a?.data)));
}

function buildLookup(items) {
  return new Map(
    asArray(items)
      .filter((item) => item?.id)
      .map((item) => [safeString(item.id), item]),
  );
}

function resolveClienteNome(clientesById, clienteId = null) {
  if (!clienteId) return '';
  return safeString(clientesById.get(safeString(clienteId))?.nome);
}

function resolveSetorNome(setoresById, setorId = null) {
  if (!setorId) return '';
  return safeString(setoresById.get(safeString(setorId))?.nome);
}

function composeEquipmentContext({
  equipamento,
  clientesById,
  setoresById,
  includeBusinessContext,
}) {
  const equipNome = safeString(equipamento?.nome, 'Equipamento') || 'Equipamento';
  if (!includeBusinessContext) return equipNome;
  const clienteNome = resolveClienteNome(clientesById, equipamento?.clienteId);
  const setorNome = resolveSetorNome(setoresById, equipamento?.setorId);
  return [clienteNome, setorNome, equipNome].filter(Boolean).join(' • ');
}

function recencia(value, now = new Date()) {
  const date = safeDate(value);
  const reference = safeDate(now) || new Date();
  if (!date) return '—';
  const diff = Math.round((reference - date) / DAY_MS);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 30) return `há ${diff} dias`;
  if (diff < 60) return 'há 1 mês';
  return `há ${Math.floor(diff / 30)} meses`;
}

function buildKpis({ equipamentos, registros, alerts, getHealthScore, getHealthClass, now }) {
  const total = equipamentos.length;
  const active = equipamentos.filter((equipamento) => equipamento?.status !== 'danger').length;
  const faults = total - active;
  const alertCount = alerts.length;
  const mesCount = countDashboardRegistrosNoMes(registros, 0, now);
  const mesPrev = countDashboardRegistrosNoMes(registros, 1, now);
  const monthSparkData = sparklineData(registros, 6, now);
  const mesTrend = trendTag(mesCount, mesPrev);
  const scores = equipamentos.map((equipamento) => readHealthScore(equipamento, getHealthScore));
  const efficiency = total
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / Math.max(scores.length, 1))
    : null;
  const efficiencyHealthClass =
    efficiency === null ? 'muted' : readHealthClass(efficiency, getHealthClass);
  const efficiencyTone =
    efficiencyHealthClass === 'muted' ? 'muted' : toneFromHealthClass(efficiencyHealthClass);

  return {
    ativos: {
      active,
      total,
      faults,
      valueLabel: total ? `${active}/${total}` : '—',
      subLabel: !total ? 'sem cadastro' : faults > 0 ? `${faults} fora` : 'estável',
      tone: faults > 0 ? 'danger' : 'ok',
    },
    eficiencia: {
      value: efficiency,
      valueLabel: efficiency === null ? '—' : `${efficiency}%`,
      subLabel: efficiency === null ? 'sem dados' : efficiencyLabel(efficiency),
      tone: efficiency === null ? 'muted' : efficiencyTone,
      sparkData: scores.slice(-6),
    },
    anomalias: {
      count: alertCount,
      valueLabel: String(alertCount),
      subLabel: !alertCount
        ? 'sem alerta'
        : alertCount === 1
          ? '1 alerta ativo'
          : `${alertCount} alertas ativos`,
      tone: alertCount > 0 ? 'danger' : 'ok',
    },
    mes: {
      count: mesCount,
      previousCount: mesPrev,
      valueLabel: String(mesCount),
      subLabel: mesTrend.text,
      tone: mesTrend.tone,
      sparkData: monthSparkData,
    },
  };
}

function buildHero({
  tier,
  hasCritical,
  userName,
  equipCount,
  mesCount,
  clienteCount,
  isEmpresaPro,
}) {
  const name = safeString(userName).trim() || 'Técnico';
  const equipLabel = `${equipCount} equipamento${equipCount === 1 ? '' : 's'}`;
  const mesLabel = `${mesCount} serviço${mesCount === 1 ? '' : 's'} no mês`;

  return {
    tier,
    tone: hasCritical ? 'alert' : 'ok',
    greeting: isEmpresaPro ? 'Operação em andamento' : `Olá, ${name}`,
    summary: isEmpresaPro
      ? `${clienteCount} clientes • ${equipCount} equipamentos • ${mesCount} serviços no mês`
      : `${equipLabel} • ${mesLabel}`,
    primaryCta: {
      nav: 'registro',
      label: 'Registrar serviço',
    },
    secondaryCta: isEmpresaPro
      ? {
          nav: 'clientes',
          label: 'Ver clientes',
        }
      : {
          action: DASHBOARD_ACTIONS.openModal,
          id: 'modal-add-eq',
          label: 'Cadastrar equipamento',
        },
  };
}

function buildEmptyState({ isEmpresaPro }) {
  return {
    icon: '🔧',
    title: isEmpresaPro
      ? 'Monte sua operação começando por cliente ou equipamento'
      : 'Cadastre seu primeiro equipamento',
    description: isEmpresaPro
      ? 'Comece vinculando cliente, setor e equipamento para ter visão completa da operação.'
      : 'Cadastre seu primeiro equipamento em menos de 1 minuto. A foto da etiqueta preenche os principais dados.',
    cta: isEmpresaPro
      ? {
          label: 'Ver clientes',
          nav: 'clientes',
          tone: 'primary',
          autoWidth: true,
          centered: true,
        }
      : {
          label: '+ Cadastrar meu primeiro equipamento',
          action: DASHBOARD_ACTIONS.openModal,
          id: 'modal-add-eq',
          tone: 'primary',
          autoWidth: true,
          centered: true,
        },
  };
}

export function selectNextDashboardAction({ alerts = [], equipamentos = [], registros = [] } = {}) {
  const safeAlerts = asArray(alerts);
  const safeEquipamentos = asArray(equipamentos);
  const safeRegistros = asArray(registros);
  const pmocLate = safeAlerts.find((alert) =>
    safeString(alert?.title).toLowerCase().includes('pmoc'),
  );
  if (pmocLate) return { priority: 1, kind: 'pmoc', alert: pmocLate };
  const critical = safeAlerts.find((alert) => alert?.kind === 'critical');
  if (critical) return { priority: 2, kind: 'critical', alert: critical };
  const overdue = safeAlerts.find((alert) => alert?.kind === 'overdue');
  if (overdue) return { priority: 3, kind: 'overdue', alert: overdue };
  const upcoming = safeAlerts.find((alert) => alert?.kind === 'upcoming');
  if (upcoming) return { priority: 4, kind: 'upcoming', alert: upcoming };
  if (safeRegistros.length) {
    return { priority: 5, kind: 'last-service', registro: safeRegistros[0] };
  }
  if (!safeEquipamentos.length) return { priority: 6, kind: 'empty-equip' };
  return { priority: 6, kind: 'none' };
}

function buildNextAction({
  action,
  equipamentosById,
  clientesById,
  setoresById,
  isEmpresaPro,
  now,
}) {
  const tone = action.priority <= 3 ? 'danger' : action.priority === 4 ? 'warn' : 'ok';
  const includeBusinessContext = Boolean(isEmpresaPro);

  if (action.alert?.eq) {
    const context = composeEquipmentContext({
      equipamento: action.alert.eq,
      clientesById,
      setoresById,
      includeBusinessContext,
    });
    return {
      tone,
      title: safeString(action.alert.title, 'Ação recomendada'),
      subtitle: `${context} • ${safeString(action.alert.subtitle, 'Exige acompanhamento')}`,
      cta: {
        action: DASHBOARD_ACTIONS.goRegisterEquip,
        id: safeString(action.alert.eq.id),
        label: action.priority <= 4 ? 'Resolver agora' : 'Ver histórico',
      },
      source: action,
    };
  }

  if (action.kind === 'last-service' && action.registro) {
    const equipamento = equipamentosById.get(safeString(action.registro.equipId));
    const context = composeEquipmentContext({
      equipamento,
      clientesById,
      setoresById,
      includeBusinessContext,
    });
    return {
      tone,
      title: 'Sem pendências urgentes',
      subtitle: `Último serviço: ${context} • ${recencia(action.registro.data, now)}`,
      cta: {
        nav: 'historico',
        label: 'Ver histórico',
      },
      source: action,
    };
  }

  return {
    tone,
    title:
      action.kind === 'empty-equip' && isEmpresaPro
        ? 'Monte sua operação começando por cliente ou equipamento'
        : action.kind === 'empty-equip'
          ? 'Cadastre seu primeiro equipamento'
          : 'Nenhuma ação urgente',
    subtitle: 'Sem pendências imediatas no momento.',
    cta: {
      nav: 'historico',
      label: 'Ver histórico',
    },
    source: action,
  };
}

function buildLastService({
  registros,
  equipamentosById,
  clientesById,
  setoresById,
  isEmpresaPro,
  now,
}) {
  if (!registros.length) return { hidden: true };
  const last = sortByDateDesc(registros)[0];
  const equipamento = equipamentosById.get(safeString(last?.equipId));
  const clienteNome = isEmpresaPro ? resolveClienteNome(clientesById, equipamento?.clienteId) : '';
  const setorNome = isEmpresaPro ? resolveSetorNome(setoresById, equipamento?.setorId) : '';
  const context = isEmpresaPro
    ? [clienteNome, setorNome, recencia(last?.data, now)].filter(Boolean).join(' • ')
    : recencia(last?.data, now);

  return {
    hidden: false,
    title: [safeString(last?.tipo, 'Serviço'), safeString(equipamento?.nome, '—')]
      .filter(Boolean)
      .join(' • '),
    subtitle: context,
    registro: last,
  };
}

function buildMonth({ registros, alerts, isEmpresaPro, now }) {
  const monthRegs = asArray(registros).filter(
    (registro) => countDashboardRegistrosNoMes([registro], 0, now) > 0,
  );
  const uniqueEquips = new Set(monthRegs.map((registro) => registro?.equipId).filter(Boolean));
  const previous = countDashboardRegistrosNoMes(registros, 1, now);
  const trend = trendTag(monthRegs.length, previous);

  return {
    label: isEmpresaPro ? 'Visão da operação' : 'Seu mês em campo',
    servicesCount: monthRegs.length,
    equipmentsCount: uniqueEquips.size,
    pendingCount: asArray(alerts).filter((alerta) => alerta?.severity !== 'info').length,
    trendLabel: trend.text,
  };
}

function buildAlertsSummary(alerts) {
  const criticalAlerts = alerts.filter(
    (alert) =>
      ['critical', 'overdue', 'attention'].includes(alert?.kind) || alert?.severity === 'danger',
  );
  return {
    total: alerts.length,
    critical: criticalAlerts.length,
    visibleCount: Math.min(alerts.length, 4),
    criticalVisibleCount: Math.min(criticalAlerts.length, 3),
    topAlerts: alerts.slice(0, 4),
    topCriticalAlerts: criticalAlerts.slice(0, 3),
  };
}

export function buildDashboardViewModel({
  equipamentos = [],
  registros = [],
  clientes = [],
  setores = [],
  alerts = [],
  planContext = {},
  navigationMode = '',
  userName = '',
  now = new Date(),
  getHealthScore,
  getHealthClass,
} = {}) {
  const safeEquipamentos = asArray(equipamentos).filter(isRecord);
  const safeRegistros = asArray(registros).filter(isRecord);
  const safeClientes = asArray(clientes).filter(isRecord);
  const safeSetores = asArray(setores).filter(isRecord);
  const safeAlerts = asArray(alerts).filter(isRecord);
  const equipamentosById = buildLookup(safeEquipamentos);
  const clientesById = buildLookup(safeClientes);
  const setoresById = buildLookup(safeSetores);
  const tier = planTier(planContext?.planCode);
  const isEmpresaPro = Boolean(planContext?.hasPro && navigationMode === NAV_MODE_EMPRESA);
  const kpis = buildKpis({
    equipamentos: safeEquipamentos,
    registros: safeRegistros,
    alerts: safeAlerts,
    getHealthScore,
    getHealthClass,
    now,
  });
  const sortedRegistros = sortByDateDesc(safeRegistros);
  const nextActionSource = selectNextDashboardAction({
    alerts: safeAlerts,
    equipamentos: safeEquipamentos,
    registros: sortedRegistros,
  });

  return {
    tier,
    isEmpresaPro,
    isEmpty: safeEquipamentos.length === 0,
    counts: {
      equipamentos: safeEquipamentos.length,
      registros: safeRegistros.length,
      clientes: safeClientes.length,
      setores: safeSetores.length,
      alerts: safeAlerts.length,
    },
    hero: buildHero({
      tier,
      hasCritical: safeAlerts.some((alert) => alert?.severity === 'danger'),
      userName,
      equipCount: safeEquipamentos.length,
      mesCount: kpis.mes.count,
      clienteCount: safeClientes.length,
      isEmpresaPro,
    }),
    kpis,
    emptyState: safeEquipamentos.length ? null : buildEmptyState({ isEmpresaPro }),
    nextAction: buildNextAction({
      action: nextActionSource,
      equipamentosById,
      clientesById,
      setoresById,
      isEmpresaPro,
      now,
    }),
    lastService: buildLastService({
      registros: safeRegistros,
      equipamentosById,
      clientesById,
      setoresById,
      isEmpresaPro,
      now,
    }),
    month: buildMonth({
      registros: safeRegistros,
      alerts: safeAlerts,
      isEmpresaPro,
      now,
    }),
    alertsSummary: buildAlertsSummary(safeAlerts),
  };
}
