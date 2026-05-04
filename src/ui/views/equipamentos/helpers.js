const POSITIVE_FACTOR_PATTERNS = [
  'em dia',
  'preventivas consecutivas',
  'sem corretivas',
  'dentro da rotina',
  'rotina estavel',
  'estavel',
  'sem alertas',
  'historico limpo',
];

const COMPONENT_PILL_META = {
  evaporadora: { label: 'Evap.', tint: 'cyan' },
  condensadora: { label: 'Cond.', tint: 'orange' },
  unidade_unica: { label: 'Unidade unica', tint: 'neutral' },
};

export function normalizeText(value = '') {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function classifyRiskFactor(factor) {
  const normalized = normalizeText(factor);
  return POSITIVE_FACTOR_PATTERNS.some((pattern) => normalized.includes(pattern))
    ? 'positive'
    : 'neutral';
}

export function recencia(data, now = new Date()) {
  const diff = Math.round((new Date(now) - new Date(data)) / 86400000);
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 30) return `há ${diff} dias`;
  if (diff < 60) return 'há 1 mês';
  return `há ${Math.floor(diff / 30)} meses`;
}

export function ctaLabelForAction(actionCode, ACTION_CODE) {
  if (actionCode === ACTION_CODE.REGISTER_CORRECTIVE_IMMEDIATE)
    return 'Registrar serviço corretivo agora';
  if (actionCode === ACTION_CODE.REGISTER_CORRECTIVE) return 'Registrar serviço corretivo';
  if (actionCode === ACTION_CODE.REGISTER_PREVENTIVE) return 'Registrar serviço preventivo';
  if (actionCode === ACTION_CODE.SCHEDULE_PREVENTIVE) return 'Programar serviço preventivo';
  if (actionCode === ACTION_CODE.COLLECT_DATA) return 'Registrar última manutenção';
  return 'Registrar serviço';
}

export function componentPillModel(componente) {
  return COMPONENT_PILL_META[componente] || null;
}

export function preventiveTimelineModel(context = {}, daysDiffFn) {
  if (!context.proximaPreventiva) return null;
  const diff = daysDiffFn(context.proximaPreventiva);
  if (diff < 0) return { nextLabel: `vencida há ${Math.abs(diff)}d`, nextTone: 'danger' };
  if (diff === 0) return { nextLabel: 'hoje', nextTone: 'danger' };
  if (diff <= 7) return { nextLabel: `${diff} dia${diff > 1 ? 's' : ''}`, nextTone: 'warn' };
  return { nextLabel: `${diff} dias`, nextTone: 'neutral' };
}
