import { supabase } from '../supabase.js';
import {
  FEATURE_EQUIPAMENTOS_EXTRA,
  FEATURE_HISTORICO_COMPLETO,
  FEATURE_PDF_EXPORT,
  FEATURE_SETORES,
  FEATURE_SUPORTE_PRIORITARIO,
  PLAN_CODE_FREE,
  PLAN_CODE_PLUS,
  assertFeature,
  getEffectivePlan,
  hasFeature,
  hasPlusAccess,
  hasProAccess,
} from './subscriptionPlans.js';

export const PREMIUM_FEATURE_EQUIPAMENTOS = 'equipamentos';
export const PREMIUM_FEATURE_PDF_EXPORT = 'pdf_export';

let _profileSnapshot = null;

export {
  hasFeature,
  assertFeature,
  hasPlusAccess,
  FEATURE_PDF_EXPORT,
  FEATURE_EQUIPAMENTOS_EXTRA,
  FEATURE_HISTORICO_COMPLETO,
  FEATURE_SETORES,
  FEATURE_SUPORTE_PRIORITARIO,
  PLAN_CODE_PLUS,
};

function createMonetizationError(code, message, cause = null) {
  const error = new Error(message);
  error.code = code;
  if (cause) error.cause = cause;
  return error;
}

function isTokenProjectMismatch(token) {
  if (!token) return false;

  try {
    const [, payloadBase64] = token.split('.');
    if (!payloadBase64) return false;

    const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
    const tokenRef = String(payload?.ref || '').trim();
    if (!tokenRef) return false;

    const envUrl = String(import.meta.env?.VITE_SUPABASE_URL || '').trim();
    if (!envUrl) return false;

    const envRef = new URL(envUrl).hostname.split('.')[0];
    return Boolean(envRef) && tokenRef !== envRef;
  } catch {
    return false;
  }
}

export async function sanitizeSessionForCurrentProject({ supabaseClient = supabase } = {}) {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session?.access_token) return { sanitized: false, session: null };

  if (!isTokenProjectMismatch(session.access_token)) {
    return { sanitized: false, session };
  }

  await supabaseClient.auth.signOut();

  throw createMonetizationError(
    'SESSION_PROJECT_MISMATCH',
    'Sua sessao e de outro ambiente. Faca login novamente para continuar.',
  );
}

export function getPlanCodeFromProfile() {
  return PLAN_CODE_FREE;
}

export function isProUser() {
  return true;
}

export function canUsePremiumFeature(_profile, feature) {
  return feature === PREMIUM_FEATURE_EQUIPAMENTOS || feature === PREMIUM_FEATURE_PDF_EXPORT;
}

export function getCachedOperationalProfileSnapshot() {
  return _profileSnapshot;
}

export function invalidateOperationalProfileCache() {
  _profileSnapshot = null;
}

export async function fetchOperationalProfileCached() {
  if (_profileSnapshot) return _profileSnapshot;
  _profileSnapshot = await fetchOperationalProfile();
  return _profileSnapshot;
}

export async function fetchOperationalProfile({ supabaseClient = supabase } = {}) {
  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();

  if (userError || !user?.id) {
    throw createMonetizationError('NO_SESSION', 'Usuario sem sessao ativa.', userError);
  }

  const profile = {
    id: user.id,
    plan_code: PLAN_CODE_FREE,
    plan: PLAN_CODE_FREE,
    subscription_status: 'disabled',
    is_dev: false,
  };

  return { user, profile };
}

export { getEffectivePlan, hasProAccess };
