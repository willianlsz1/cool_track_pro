import { supabase } from '../supabase.js';

export const PLAN_CODE_FREE = 'free';
export const PLAN_CODE_PLUS = 'plus';
export const PLAN_CODE_PRO = 'pro';

export const FEATURE_PDF_EXPORT = 'pdf_export';
export const FEATURE_EQUIPAMENTOS_EXTRA = 'equipamentos_extra';
export const FEATURE_HISTORICO_COMPLETO = 'historico_completo';
export const FEATURE_SETORES = 'setores';
export const FEATURE_CLIENTES = 'clientes';
export const FEATURE_SUPORTE_PRIORITARIO = 'suporte_prioritario';
export const FEATURE_DIGITAL_SIGNATURE = 'digital_signature';
export const FEATURE_NAMEPLATE_ANALYSIS = 'nameplate_analysis';

const OPERATIONAL_LIMITS = Object.freeze({
  clientes: Number.POSITIVE_INFINITY,
  equipamentos: Number.POSITIVE_INFINITY,
  registros: Number.POSITIVE_INFINITY,
});

const OPERATIONAL_PLAN = Object.freeze({
  key: PLAN_CODE_FREE,
  label: 'Operacional',
  limits: OPERATIONAL_LIMITS,
  perks: [
    'Equipamentos sem limite comercial',
    'Clientes sem limite comercial',
    'Registros de servico sem limite comercial',
    'Histórico completo do equipamento',
    'Recursos pagos desativados ate nova etapa de billing',
  ],
  accountTagline: 'Billing e precificacao foram removidos desta versao.',
  accountChips: ['Sem checkout', 'Sem assinatura', 'Sem pricing'],
});

export const PLAN_CATALOG = Object.freeze({
  [PLAN_CODE_FREE]: OPERATIONAL_PLAN,
  [PLAN_CODE_PLUS]: { ...OPERATIONAL_PLAN, key: PLAN_CODE_PLUS },
  [PLAN_CODE_PRO]: { ...OPERATIONAL_PLAN, key: PLAN_CODE_PRO },
});

export function normalizePlanCode(planCode) {
  const lower = String(planCode || '').toLowerCase();
  if (lower === PLAN_CODE_PRO) return PLAN_CODE_PRO;
  if (lower === PLAN_CODE_PLUS) return PLAN_CODE_PLUS;
  return PLAN_CODE_FREE;
}

export function getEffectivePlan() {
  return PLAN_CODE_FREE;
}

export function planRank() {
  return 0;
}

export function isAtLeastPlan() {
  return true;
}

export function hasProAccess() {
  return true;
}

export function hasPlusAccess() {
  return true;
}

export function hasFeature(_profile, feature) {
  return Boolean(feature);
}

export function assertFeature(_profile, feature) {
  return { allowed: true, planCode: PLAN_CODE_FREE, feature };
}

export function canCreateEquipment(_profile, currentEquipmentCount = 0) {
  const parsedCurrent = Number.parseInt(String(currentEquipmentCount || '0'), 10);
  const current = Number.isFinite(parsedCurrent) && parsedCurrent > 0 ? parsedCurrent : 0;
  return {
    allowed: true,
    limit: Number.POSITIVE_INFINITY,
    current,
    planCode: PLAN_CODE_FREE,
  };
}

export function assertProAccess(_profile, featureName = 'premium_feature') {
  return { allowed: true, planCode: PLAN_CODE_FREE, feature: featureName };
}

export function getPlanForUser() {
  return PLAN_CATALOG[PLAN_CODE_FREE];
}

export async function getPlanProfileForUserId(userId, { supabaseClient = supabase } = {}) {
  if (!userId) return null;

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) return null;
  return data || null;
}

export async function getPlanCodeForUserId() {
  return PLAN_CODE_FREE;
}

export async function getPlanForAuthenticatedUser() {
  return getPlanForUser();
}

export function getLimitLabel(resource) {
  if (resource === 'clientes') return 'clientes';
  if (resource === 'equipamentos') return 'equipamentos';
  return 'registros';
}
