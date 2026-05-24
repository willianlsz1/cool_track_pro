/**
 * Model puro da detail view de equipamento.
 *
 * Mantém o contrato antes montado no adapter legado, sem tocar DOM/modal/HTML.
 */

function toIsoDate(value) {
  const raw = value ? String(value).slice(0, 10) : '';
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

function addDaysIso(isoDate, days) {
  if (!isoDate || !Number.isFinite(days) || days <= 0) return null;
  const base = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  base.setDate(base.getDate() + days);
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, '0');
  const d = String(base.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function resolvePositiveNumber(...values) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function resolveDaysToNext(proximaIso, context, Utils) {
  const contextDays = Number(context?.daysToNext);
  if (Number.isFinite(contextDays)) return contextDays;
  if (!proximaIso || typeof Utils.daysDiff !== 'function') return null;
  const diff = Utils.daysDiff(proximaIso);
  return Number.isFinite(diff) ? diff : null;
}

function statusTone(status) {
  if (status === 'em_dia') return 'ok';
  if (status === 'vencido') return 'danger';
  if (status === 'sem_cronograma') return 'muted';
  return 'warn';
}

function statusText(status) {
  if (status === 'sem_cronograma') return 'Sem cronograma';
  if (status === 'sem_registro') return 'Sem registro';
  if (status === 'em_dia') return 'Em dia';
  if (status === 'atencao') return 'Atenção';
  if (status === 'vencido') return 'Vencido';
  return 'Não aplicável';
}

function recommendedActionText(status) {
  if (status === 'sem_cronograma') {
    return 'Defina a periodicidade ou registre a primeira preventiva.';
  }
  if (status === 'sem_registro') {
    return 'Registre a primeira preventiva deste equipamento.';
  }
  if (status === 'em_dia') return 'Preventiva dentro do prazo.';
  if (status === 'atencao') return 'Preventiva prevista para breve.';
  if (status === 'vencido') return 'Preventiva vencida. Registre a execução agora.';
  return 'Selecione um equipamento para avaliar preventiva.';
}

function isPreventiveServiceType(tipo) {
  const normalized = String(tipo || '')
    .trim()
    .toLowerCase();
  if (!normalized || normalized.includes('corretiv')) return false;
  return (
    normalized.includes('preventiv') ||
    normalized.includes('limpeza') ||
    normalized.includes('higieniz')
  );
}

export function buildEquipmentPreventiveContext({ eq, regs = [], context = {}, utils: Utils }) {
  const periodicidadeDias = resolvePositiveNumber(
    context?.periodicidadeDias,
    eq?.periodicidadePreventivaDias,
  );
  const preventiveRegs = regs.filter((reg) => isPreventiveServiceType(reg?.tipo));
  const lastPreventive = preventiveRegs[0] || null;
  const lastPreventiveIso = toIsoDate(lastPreventive?.data);
  const proximaFromRegistro = toIsoDate(lastPreventive?.proxima);
  const proximaFromContext = toIsoDate(context?.proximaPreventiva);
  const proximaIso =
    proximaFromRegistro ||
    proximaFromContext ||
    (lastPreventiveIso ? addDaysIso(lastPreventiveIso, periodicidadeDias) : null);
  const daysToNext = resolveDaysToNext(proximaIso, context, Utils);
  const leadAlertDays = resolvePositiveNumber(context?.leadAlertDays) ?? 15;

  let status;
  if (!periodicidadeDias && !proximaIso) {
    status = 'sem_cronograma';
  } else if (!lastPreventive) {
    status = 'sem_registro';
  } else if (daysToNext != null && daysToNext < 0) {
    status = 'vencido';
  } else if (daysToNext != null && daysToNext <= leadAlertDays) {
    status = 'atencao';
  } else {
    status = 'em_dia';
  }

  return {
    status,
    statusLabel: statusText(status),
    statusTone: statusTone(status),
    periodicidadeDias,
    periodicidadeLabel: periodicidadeDias
      ? `${periodicidadeDias} dias`
      : 'Sem periodicidade definida',
    ultimaPreventivaIso: lastPreventiveIso,
    ultimaPreventivaLabel: lastPreventiveIso
      ? Utils.formatDate(lastPreventiveIso)
      : 'Sem preventiva registrada',
    proximaPreventivaIso: proximaIso,
    proximaPreventivaLabel: proximaIso ? Utils.formatDate(proximaIso) : 'Sem próxima preventiva',
    daysToNext,
    recommendedAction: recommendedActionText(status),
    ctaLabel: 'Registrar preventiva',
  };
}

export function buildViewEquipDetailModel({
  id,
  equip: eq,
  regsForEquip,
  evaluateEquipmentHealth,
  evaluateEquipmentRisk,
  getHealthClass,
  utils: Utils,
}) {
  const regs = regsForEquip(id).sort((a, b) => b.data.localeCompare(a.data));
  const health = evaluateEquipmentHealth(eq, regs);
  const score = health.score;
  const cls = getHealthClass(score);
  const safeId = Utils.escapeAttr(id);
  const context = health.context;
  const risk = evaluateEquipmentRisk(eq, regs);
  const proximaPreventiva = context?.proximaPreventiva
    ? Utils.formatDate(context.proximaPreventiva)
    : 'Sem agenda';
  const preventiveContext = buildEquipmentPreventiveContext({ eq, regs, context, utils: Utils });
  const healthSummary = health.reasons.length
    ? Utils.escapeHtml(health.reasons.slice(0, 2).join(' | '))
    : 'Histórico dentro da rotina prevista';

  const ringR = 30;
  const ringC = +(2 * Math.PI * ringR).toFixed(1);
  const ringOffset = +(ringC * (1 - score / 100)).toFixed(1);

  return {
    id,
    eq,
    regs,
    health,
    score,
    cls,
    safeId,
    context,
    risk,
    proximaPreventiva,
    preventiveContext,
    healthSummary,
    ringR,
    ringC,
    ringOffset,
  };
}
