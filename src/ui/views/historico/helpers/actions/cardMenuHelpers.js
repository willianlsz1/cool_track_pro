const DEFAULT_MENU_SELECTOR = '.hist-item-actions__menu';
const DEFAULT_TOGGLE_SELECTOR = '[data-hist-action="toggle-card-menu"]';

export function closeHistoricoCardMenus(
  container,
  { menuSelector = DEFAULT_MENU_SELECTOR, toggleSelector = DEFAULT_TOGGLE_SELECTOR } = {},
) {
  if (!container) return;

  container.querySelectorAll(menuSelector).forEach((menu) => {
    menu.hidden = true;
  });

  container.querySelectorAll(toggleSelector).forEach((toggle) => {
    toggle.setAttribute('aria-expanded', 'false');
  });
}

export function toggleHistoricoCardMenu(
  container,
  toggle,
  { menuSelector = DEFAULT_MENU_SELECTOR, toggleSelector = DEFAULT_TOGGLE_SELECTOR } = {},
) {
  if (!container || !toggle) return;

  const menu = toggle.parentElement?.querySelector(menuSelector);
  const isOpen = menu && !menu.hidden;

  closeHistoricoCardMenus(container, { menuSelector, toggleSelector });

  if (!isOpen && menu) {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  }
}
