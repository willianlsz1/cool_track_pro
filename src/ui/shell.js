import { renderShellHeader } from './shell/templates/header.js';
import { renderShellNav, shouldShowClientesInMobileNav } from './shell/templates/nav.js';
import { renderShellSidebar } from './shell/templates/sidebar.js';
import { renderShellViews } from './shell/templates/views.js';
import { renderShellModals } from './shell/templates/modals.js';
import { Profile } from '../features/profile.js';
import { PLAN_CODE_PLUS, PLAN_CODE_PRO, PLAN_CODE_FREE } from '../core/plans/subscriptionPlans.js';
import { getCachedPlan } from '../core/plans/planCache.js';
import { getClientesAccessSnapshot } from '../core/plans/clientesAccess.js';
import {
  ensureNavigationModePreference,
  getNavigationLayout,
  getNavigationMode,
  NAV_MODE_EMPRESA,
} from './shell/navigationMode.js';

const HEADER_TOTAL_HEIGHT_VAR = '--app-header-total-height';
const HEADER_HEIGHT_ALIAS_VAR = '--app-header-height';
const NAV_HEIGHT_VAR = '--app-nav-height';

let shellMetricsObserver = null;
let shellMetricsFrame = 0;
let observedShellNodes = [];
let shellMetricsListenersBound = false;

function renderShellMainLayout(planCode = getCachedPlan() || PLAN_CODE_FREE) {
  return String.raw`
    <!-- app-content vira grid 2-col em desktop (>=1024px) com sidebar a esquerda.
         Em mobile/tablet, sidebar esta hidden via CSS e bottom nav reaparece. -->
    <div class="app-content app-shell--with-sidebar">

${renderShellSidebar()}

${renderShellNav(planCode)}

      <!-- MAIN -->
      <main id="main-content" tabindex="-1">

${renderShellViews()}

      </main>
    </div>
`;
}

function _getCurrentPlanCode() {
  return getClientesAccessSnapshot().planCode || PLAN_CODE_FREE;
}

function _rerenderMobileNav(planCode = _getCurrentPlanCode()) {
  if (typeof document === 'undefined') return;
  const currentNav = document.querySelector('.app-nav');
  if (!currentNav) return;
  const showClientes = shouldShowClientesInMobileNav(planCode);
  const hasClientes = Boolean(currentNav.querySelector('#nav-clientes'));
  if (showClientes === hasClientes) return;

  const activeRoute = currentNav.querySelector('.nav-btn.is-active')?.dataset.nav || null;
  const host = document.createElement('div');
  host.innerHTML = renderShellNav(planCode);
  const nextNav = host.querySelector('.app-nav');
  if (!nextNav) return;

  if (activeRoute) {
    const nextActive = nextNav.querySelector(`[data-nav="${activeRoute}"]`);
    if (nextActive) nextActive.classList.add('is-active');
  }

  currentNav.replaceWith(nextNav);
}

/**
 * Atualiza dinamicamente o footer da sidebar (user chip + plan card).
 * Chamado no bootstrap apos profile carregar; pode ser re-chamado quando
 * profile for editado (via custom event 'profile-updated' opcional).
 */
function _getInitials(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return 'U';
  return trimmed
    .split(/\s+/)
    .map((n) => n[0] || '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const _PLAN_LABELS = {
  [PLAN_CODE_FREE]: { label: 'Plano Free', sub: 'Recursos basicos' },
  [PLAN_CODE_PLUS]: { label: 'Plano Plus', sub: 'Seu plano esta ativo' },
  [PLAN_CODE_PRO]: { label: 'Plano Pro', sub: 'Seu plano esta ativo' },
};

function _formatRenewBR(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function _setElementVisible(el, visible) {
  if (!el) return;
  el.hidden = !visible;
  if (visible) el.removeAttribute('aria-hidden');
  else el.setAttribute('aria-hidden', 'true');
}

function _applyNavigationMode() {
  if (typeof document === 'undefined') return;
  const mode = getNavigationMode();
  const layout = getNavigationLayout(mode);
  const access = getClientesAccessSnapshot();
  const isProNavigation = access.planCode === PLAN_CODE_PRO;
  const canAccessClientesRoute = access.canAccess;
  const mobilePrimary = new Set(layout.mobilePrimary || []);
  const sidebarPrimary = new Set(layout.sidebarPrimary || []);
  const mobileSecondary = new Set(layout.mobileSecondary || []);
  const sidebarSecondary = new Set(layout.sidebarSecondary || []);

  // CP-B libera a rota Clientes, mas preserva a navegacao mobile legada.
  // A nova ordem do bottom nav fica para CP-C.
  if (!isProNavigation) {
    mobilePrimary.delete('clientes');
    mobilePrimary.add('inicio');
    mobilePrimary.add('registro');
    sidebarPrimary.delete('clientes');
    sidebarSecondary.add('clientes');
    if (mode === NAV_MODE_EMPRESA) mobileSecondary.add('clientes');
  }

  const mobileAll = ['inicio', 'clientes', 'equipamentos', 'registro', 'historico', 'relatorio'];
  mobileAll.forEach((route) => {
    const el = document.getElementById(`nav-${route}`);
    _setElementVisible(el, mobilePrimary.has(route));
  });

  const sidebarAll = [
    'inicio',
    'clientes',
    'equipamentos',
    'registro',
    'historico',
    'relatorio',
    'orcamentos',
    'alertas',
  ];
  sidebarAll.forEach((route) => {
    const el = document.getElementById(`sidenav-${route}`);
    if (!el) return;
    const visible =
      sidebarPrimary.has(route) ||
      sidebarSecondary.has(route) ||
      route === 'orcamentos' ||
      route === 'alertas';
    _setElementVisible(el, visible);
    el.classList.toggle('app-sidebar__nav-item--secondary', sidebarSecondary.has(route));
  });

  _setElementVisible(document.getElementById('header-help-go-clientes'), canAccessClientesRoute);
  _setElementVisible(
    document.getElementById('header-help-clientes-upsell'),
    !canAccessClientesRoute,
  );
}

export function updateShellSidebar() {
  if (typeof document === 'undefined') return;

  const profile = Profile.get() || {};
  const name = String(profile.nome || profile.empresa || '').trim() || 'Tecnico';
  const initials = _getInitials(name);

  const avatarEl = document.getElementById('sidenav-user-avatar');
  if (avatarEl) avatarEl.textContent = initials;
  const nameEl = document.getElementById('sidenav-user-name');
  if (nameEl) nameEl.textContent = name;
  // Role: por enquanto fixo "Administrador" (single-user). Quando vier
  // multi-user (Pro), pode vir do profile.
  const roleEl = document.getElementById('sidenav-user-role');
  if (roleEl) roleEl.textContent = 'Administrador';

  // Plan card V3 — nome + status sub + (data se Plus/Pro) + CTA contextual.
  // Cache sync; data de renovacao vem do mesmo profile (subscription_current_period_end)
  // e so aparece pra planos pagos que tem essa info.
  const planCode = _getCurrentPlanCode();
  const planMeta = _PLAN_LABELS[planCode] || _PLAN_LABELS[PLAN_CODE_FREE];
  const helpMenuEl = document.getElementById('header-help-menu');
  if (helpMenuEl) helpMenuEl.dataset.plan = planCode;

  const cardEl = document.getElementById('sidenav-plan-card');
  if (cardEl) cardEl.setAttribute('data-plan', planCode);
  const planNameEl = document.getElementById('sidenav-plan-name');
  if (planNameEl) planNameEl.textContent = planMeta.label;
  const planSubEl = document.getElementById('sidenav-plan-sub');
  if (planSubEl) planSubEl.textContent = planMeta.sub;

  // Linha de "Ate dd/mm/yyyy" so aparece pra planos pagos com data valida.
  const metaEl = document.getElementById('sidenav-plan-meta');
  const renewEl = document.getElementById('sidenav-plan-renew');
  const renewStr = _formatRenewBR(profile.subscription_current_period_end);
  if (metaEl && renewEl) {
    if (planCode !== PLAN_CODE_FREE && renewStr) {
      renewEl.textContent = `Ate ${renewStr}`;
      metaEl.hidden = false;
    } else {
      metaEl.hidden = true;
    }
  }

  const ctaLabelEl = document.getElementById('sidenav-plan-cta-label');
  if (ctaLabelEl) {
    ctaLabelEl.textContent = planCode === PLAN_CODE_FREE ? 'Conhecer planos' : 'Gerenciar plano';
  }

  // Clientes e acessivel em todos os planos; o limite Free fica na criacao.
  const clientesItem = document.getElementById('sidenav-clientes');
  const clientesLock = document.getElementById('sidenav-clientes-lock');
  const canAccessClientesRoute = getClientesAccessSnapshot().canAccess;
  if (clientesLock) clientesLock.hidden = canAccessClientesRoute;
  if (clientesItem) {
    clientesItem.classList.toggle('app-sidebar__nav-item--locked', !canAccessClientesRoute);
  }
  _rerenderMobileNav(planCode);
  _applyNavigationMode();
}

export const APP_SHELL_HEADER_HTML = renderShellHeader();
export const APP_SHELL_CONTENT_HTML = [
  renderShellMainLayout(_getCurrentPlanCode()),
  renderShellModals(),
].join('\n\n');
export const APP_SHELL_HTML = [APP_SHELL_HEADER_HTML, APP_SHELL_CONTENT_HTML].join('\n\n');

function getHeaderElement() {
  if (typeof document === 'undefined') return null;
  return document.querySelector('.app-header');
}

function getBottomNavElement() {
  if (typeof document === 'undefined') return null;
  return document.querySelector('.app-nav');
}

const MOBILE_NAV_MEDIA_QUERY = '(max-width: 1023px)';
const NAV_HIDE_SCROLL_DELTA = 14;
const NAV_TOP_REVEAL_OFFSET = 8;

let navAutoHideRaf = 0;
let navAutoHideLastY = 0;
let navAutoHidePendingY = 0;
let navAutoHideBound = false;

function isBlockingModalOpen() {
  if (typeof document === 'undefined') return false;
  return Boolean(document.querySelector('.modal-overlay.is-open'));
}

function showBottomNav() {
  const nav = getBottomNavElement();
  if (!nav) return;
  nav.classList.remove('app-nav--hidden');
}

function _applyBottomNavAutoHide(nextScrollY) {
  const nav = getBottomNavElement();
  if (!nav) return;

  if (window.matchMedia && !window.matchMedia(MOBILE_NAV_MEDIA_QUERY).matches) {
    showBottomNav();
    navAutoHideLastY = nextScrollY;
    return;
  }

  if (isBlockingModalOpen()) {
    showBottomNav();
    navAutoHideLastY = nextScrollY;
    return;
  }

  const currentY = Math.max(0, nextScrollY);
  const delta = currentY - navAutoHideLastY;

  if (currentY <= NAV_TOP_REVEAL_OFFSET) {
    showBottomNav();
  } else if (Math.abs(delta) >= NAV_HIDE_SCROLL_DELTA) {
    if (delta > 0) nav.classList.add('app-nav--hidden');
    else nav.classList.remove('app-nav--hidden');
    navAutoHideLastY = currentY;
  }
}

function onBottomNavAutoHideScroll() {
  navAutoHidePendingY = window.scrollY || document.documentElement?.scrollTop || 0;
  if (navAutoHideRaf) return;
  navAutoHideRaf = window.requestAnimationFrame(() => {
    navAutoHideRaf = 0;
    _applyBottomNavAutoHide(navAutoHidePendingY);
  });
}

function bindBottomNavAutoHide() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const nav = getBottomNavElement();
  if (!nav) return;

  if (!navAutoHideBound) {
    window.addEventListener('scroll', onBottomNavAutoHideScroll, { passive: true });
    document.addEventListener('modal:opened', showBottomNav);
    document.addEventListener('modal:closed', onBottomNavAutoHideScroll);
    navAutoHideBound = true;
  }

  navAutoHideLastY = Math.max(0, window.scrollY || document.documentElement?.scrollTop || 0);
  showBottomNav();

  if (!nav.dataset.autoHideClickBound) {
    nav.dataset.autoHideClickBound = '1';
    nav.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target.closest('[data-nav]') : null;
      if (!target) return;
      showBottomNav();
    });
  }
}

function applyShellMetrics() {
  const header = getHeaderElement();
  const nav = getBottomNavElement();
  const rootStyle = document.documentElement?.style;

  if (!rootStyle) return;

  if (header) {
    const headerHeight = Math.max(0, Math.ceil(header.getBoundingClientRect().height));
    rootStyle.setProperty(HEADER_TOTAL_HEIGHT_VAR, `${headerHeight}px`);
    rootStyle.setProperty(HEADER_HEIGHT_ALIAS_VAR, `${headerHeight}px`);
  }

  if (nav) {
    const navHeight = Math.max(0, Math.ceil(nav.getBoundingClientRect().height));
    rootStyle.setProperty(NAV_HEIGHT_VAR, `${navHeight}px`);
  }
}

function scheduleShellMetricsUpdate() {
  if (typeof window === 'undefined') return;

  if (shellMetricsFrame) {
    window.cancelAnimationFrame(shellMetricsFrame);
  }

  shellMetricsFrame = window.requestAnimationFrame(() => {
    shellMetricsFrame = 0;
    applyShellMetrics();
  });
}

function bindShellMetrics() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const shellNodes = [getHeaderElement(), getBottomNavElement()].filter(Boolean);
  if (!shellNodes.length) return;

  applyShellMetrics();

  if (typeof ResizeObserver !== 'undefined') {
    if (!shellMetricsObserver) {
      shellMetricsObserver = new ResizeObserver(() => {
        scheduleShellMetricsUpdate();
      });
    }

    const hasSameTargets =
      shellNodes.length === observedShellNodes.length &&
      shellNodes.every((node, idx) => node === observedShellNodes[idx]);

    if (!hasSameTargets) {
      shellMetricsObserver.disconnect();
      shellNodes.forEach((node) => shellMetricsObserver?.observe(node));
      observedShellNodes = shellNodes;
    }
  }

  if (!shellMetricsListenersBound) {
    window.addEventListener('resize', scheduleShellMetricsUpdate, { passive: true });
    window.addEventListener('orientationchange', scheduleShellMetricsUpdate, { passive: true });
    shellMetricsListenersBound = true;
  }
}

export function initAppShell() {
  const mount = document.getElementById('app');
  if (!mount) return;

  // Header fora do shell principal: evita que qualquer wrapper/scroll da view
  // afete o posicionamento fixo do topo global.
  if (!document.querySelector('.app-header')) {
    document.body.insertAdjacentHTML('afterbegin', APP_SHELL_HEADER_HTML);
  }

  if (!mount.querySelector('#main-content')) {
    mount.innerHTML = [renderShellMainLayout(_getCurrentPlanCode()), renderShellModals()].join(
      '\n\n',
    );
  }

  _rerenderMobileNav(_getCurrentPlanCode());
  bindBottomNavAutoHide();
  ensureNavigationModePreference();
  _applyNavigationMode();
  if (!document.body.dataset.navigationModeBound) {
    document.body.dataset.navigationModeBound = '1';
    document.addEventListener('cooltrack:navigation-mode-changed', () => {
      _applyNavigationMode();
    });
  }

  if (!document.body.dataset.planChangeBound) {
    document.body.dataset.planChangeBound = '1';
    window.addEventListener('cooltrack:plan-changed', () => {
      _rerenderMobileNav(_getCurrentPlanCode());
      bindBottomNavAutoHide();
      _applyNavigationMode();
      bindShellMetrics();
      bindBottomNavAutoHide();
    });
  }

  bindShellMetrics();
  bindBottomNavAutoHide();
}
