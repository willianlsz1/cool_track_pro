function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function safeCount(value) {
  const count = Number(value);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

function getAlertActionMeta(alert) {
  const id = safeString(alert?.eq?.id);
  switch (alert?.recommendedAction) {
    case 'register-now':
    case 'schedule':
    case 'start-history':
      return { action: 'go-register-equip', dataId: id };
    case 'inspect':
      return { action: 'view-equip', dataId: id };
    default:
      return { action: 'view-equip', dataId: id };
  }
}

function buildContextBanner(preventivas7dCount) {
  const count = safeCount(preventivas7dCount);
  if (!count) return null;

  return {
    count,
    icon: '⚠',
    text: `Você tem ${count} preventiva(s) nos próximos 7 dias. Agende agora para evitar parada.`,
    action: 'go-equipamentos-preventiva-7d',
    ctaLabel: 'Ver equipamentos →',
  };
}

function buildClienteTitle(item) {
  const clienteNome = safeString(item?.clienteNome);
  const daysRemaining = Number(item?.daysRemaining);
  if (daysRemaining < 0) {
    const overdueDays = Math.abs(daysRemaining);
    return `Voltar ao cliente: ${clienteNome} (vencido ha ${overdueDays} dia${overdueDays !== 1 ? 's' : ''})`;
  }
  if (daysRemaining === 0) {
    return `Voltar ao cliente hoje: ${clienteNome}`;
  }
  return `Voltar ao cliente em ${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''}: ${clienteNome}`;
}

function buildClienteCard(item, index) {
  if (!item || typeof item !== 'object') return null;
  const daysRemaining = Number(item.daysRemaining);
  if (!Number.isFinite(daysRemaining) || daysRemaining > 7) return null;

  const clienteId = safeString(item.clienteId);
  const clienteNome = safeString(item.clienteNome);
  const tone = daysRemaining < 0 ? 'critical' : daysRemaining === 0 ? 'warn' : '';

  return {
    key: `cliente:${clienteId || index}`,
    kind: 'cliente',
    action: 'go-cliente-equipamentos',
    dataId: clienteId,
    clienteNome,
    icon: '🔔',
    title: buildClienteTitle(item),
    subtitle: item.note ? safeString(item.note) : 'Alerta de retorno ao cliente.',
    equipmentLabel: 'Cliente',
    tone,
  };
}

function buildMaintenanceCard(alert, index) {
  if (!alert || typeof alert !== 'object') return null;
  const actionMeta = getAlertActionMeta(alert);

  return {
    key: `equipamento:${actionMeta.dataId || index}:${index}`,
    kind: 'equipamento',
    action: actionMeta.action,
    dataId: actionMeta.dataId,
    icon: safeString(alert.icon, '!') || '!',
    title: safeString(alert.title),
    subtitle: safeString(alert.subtitle),
    equipmentLabel: safeString(alert.eq?.nome ?? alert.equipmentName, '-'),
    tone: alert.severity === 'danger' ? 'critical' : '',
  };
}

function buildEmptyState(equipamentos) {
  if (!asArray(equipamentos).length) {
    return {
      variant: 'engaging',
      ariaLabel: 'Sem equipamentos',
      icon: '🔧',
      title: 'Cadastre um equipamento para receber alertas',
      description:
        'Alertas automáticos identificam quando um equipamento precisa de atenção - sem você precisar lembrar.',
      cta: { label: 'Cadastrar equipamento →', nav: 'equipamentos' },
    };
  }

  return {
    variant: 'engaging',
    ariaLabel: 'Sem alertas',
    icon: '✅',
    title: 'Tudo em dia!',
    description:
      'Nenhum equipamento precisa de atenção agora. Continue registrando serviços para manter o histórico atualizado.',
    cta: { label: 'Ver todos os equipamentos', nav: 'equipamentos', tone: 'outline' },
  };
}

export function buildAlertasViewModel({
  equipamentos = [],
  maintenanceAlerts = [],
  clienteAlerts = [],
  preventivas7dCount = 0,
} = {}) {
  const clienteCards = asArray(clienteAlerts).map(buildClienteCard).filter(Boolean);
  const maintenanceCards = asArray(maintenanceAlerts).map(buildMaintenanceCard).filter(Boolean);
  const cards = [...clienteCards, ...maintenanceCards];

  return {
    contextBanner: buildContextBanner(preventivas7dCount),
    cards,
    emptyState: cards.length ? null : buildEmptyState(equipamentos),
    skeletonCount: Math.min(Math.max(cards.length, 3), 5),
  };
}
