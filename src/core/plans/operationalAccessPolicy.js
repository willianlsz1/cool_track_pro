import { supabase } from '../supabase.js';

export const PLAN_CODE_FREE = 'free';
export const PLAN_CODE_PLUS = 'plus';
export const PLAN_CODE_PRO = 'pro';

export const FEATURE_EQUIPAMENTOS_EXTRA = 'equipamentos_extra';
export const FEATURE_HISTORICO_COMPLETO = 'historico_completo';
export const FEATURE_SETORES = 'setores';
export const FEATURE_CLIENTES = 'clientes';
export const FEATURE_SUPORTE_PRIORITARIO = 'suporte_prioritario';
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
    'Equipamentos sem limite nesta etapa',
    'Clientes sem limite nesta etapa',
    'Registros de serviço sem limite nesta etapa',
    'Histórico completo do equipamento',
    'Recursos de cobrança fora do app nesta etapa',
  ],
  accountTagline: 'Fluxo operacional liberado nesta versão.',
  accountChips: ['Operacional', 'Sem cobrança ativa', 'Sem limite nesta etapa'],
});

export const PLAN_CATALOG = Object.freeze({
  [PLAN_CODE_FREE]: OPERATIONAL_PLAN,
  [PLAN_CODE_PLUS]: { ...OPERATIONAL_PLAN, key: PLAN_CODE_PLUS },
  [PLAN_CODE_PRO]: { ...OPERATIONAL_PLAN, key: PLAN_CODE_PRO },
});

export function normalizePlanCode(planCode) {
  void planCode;
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

export function assertProAccess(_profile, featureName = 'operational_feature') {
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
