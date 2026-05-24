export const NAV_MODE_KEY = 'cooltrack_nav_mode';
export const NAV_MODE_RAPIDO = 'rapido';
export const NAV_MODE_EMPRESA = 'empresa';

const VALID_MODES = new Set([NAV_MODE_RAPIDO, NAV_MODE_EMPRESA]);

const PRIMARY_NAV_LAYOUT = {
  mobilePrimary: ['inicio', 'clientes', 'registro', 'equipamentos', 'historico'],
  mobileSecondary: [],
  sidebarPrimary: ['inicio', 'registro', 'clientes', 'equipamentos', 'historico'],
  sidebarSecondary: [],
};

export const NAV_LAYOUT_BY_MODE = {
  [NAV_MODE_RAPIDO]: PRIMARY_NAV_LAYOUT,
  [NAV_MODE_EMPRESA]: PRIMARY_NAV_LAYOUT,
};

function normalizeMode(raw) {
  return VALID_MODES.has(raw) ? raw : NAV_MODE_RAPIDO;
}

export function getNavigationMode() {
  try {
    return normalizeMode(localStorage.getItem(NAV_MODE_KEY));
  } catch {
    return NAV_MODE_RAPIDO;
  }
}

export function hasNavigationModePreference() {
  try {
    return VALID_MODES.has(localStorage.getItem(NAV_MODE_KEY));
  } catch {
    return false;
  }
}

export function setNavigationMode(mode, { emit = true } = {}) {
  const next = normalizeMode(mode);
  try {
    localStorage.setItem(NAV_MODE_KEY, next);
  } catch {
    /* storage indisponivel */
  }
  if (emit && typeof document !== 'undefined') {
    document.dispatchEvent(
      new CustomEvent('cooltrack:navigation-mode-changed', { detail: { mode: next } }),
    );
  }
  return next;
}

export function getNavigationLayout(mode = getNavigationMode()) {
  return NAV_LAYOUT_BY_MODE[normalizeMode(mode)];
}

export function ensureNavigationModePreference() {
  if (hasNavigationModePreference()) return getNavigationMode();
  return setNavigationMode(NAV_MODE_RAPIDO, { emit: false });
}
