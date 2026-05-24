import {
  getEquipamentosHeaderBridgePromise,
  getEquipamentosHeaderRenderGeneration,
  incrementEquipamentosHeaderRenderGeneration,
  setEquipamentosHeaderBridge,
  setEquipamentosHeaderBridgePromise,
} from '../state/bridgeState.js';
import {
  EQUIPAMENTOS_ACTIONS,
  EQUIPAMENTOS_PUBLIC_IDS,
} from '../../../viewModels/equipamentosContracts.js';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

function setHidden(el, isHidden) {
  if (!el) return;
  if (isHidden) {
    el.setAttribute('hidden', '');
  } else {
    el.removeAttribute('hidden');
  }
}

function createElement(tagName, { className, id, text, attrs = {} } = {}) {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  if (id) el.id = id;
  if (text != null) el.textContent = String(text);
  Object.entries(attrs).forEach(([name, value]) => {
    if (value == null || value === false) return;
    el.setAttribute(name, String(value));
  });
  return el;
}

function renderHero(root, hero = {}) {
  const topOrb = createElement('span', {
    className: 'equip-hero__orb equip-hero__orb--tl',
    attrs: { 'aria-hidden': 'true' },
  });
  const bottomOrb = createElement('span', {
    className: 'equip-hero__orb equip-hero__orb--br',
    attrs: { 'aria-hidden': 'true' },
  });
  const head = createElement('div', { className: 'equip-hero__head' });
  const title = createElement('h1', {
    id: EQUIPAMENTOS_PUBLIC_IDS.heroTitle,
    className: 'equip-hero__title',
    text: hero.title || 'Atencao agora',
  });
  const subtitle = createElement('p', {
    id: EQUIPAMENTOS_PUBLIC_IDS.heroSubtitle,
    className: 'equip-hero__sub',
    text: hero.subtitle || '',
  });
  const cta = createElement('div', {
    id: EQUIPAMENTOS_PUBLIC_IDS.heroCta,
    className: 'equip-hero__cta',
    attrs: { hidden: '' },
  });
  const kpis = createElement('div', {
    id: EQUIPAMENTOS_PUBLIC_IDS.heroKpis,
    className: 'equip-hero__kpis',
    attrs: { role: 'list' },
  });

  asArray(hero.items).forEach((item) => {
    const card = createElement('article', { className: 'equip-hero__kpi' });
    const name = createElement('strong', { text: item?.name || 'Equipamento' });
    const action = createElement('button', {
      className: 'equip-hero__cta-btn equip-hero__cta-btn--action',
      text: 'Registrar servico',
      attrs: {
        type: 'button',
        'data-action': EQUIPAMENTOS_ACTIONS.goRegisterEquip,
        'data-id': item?.id,
      },
    });
    card.append(name, action);
    kpis.append(card);
  });

  head.append(title, subtitle, cta);
  root.replaceChildren(topOrb, bottomOrb, head, kpis);
}

function renderFilters(filtersRoot, filters = {}) {
  if (!filtersRoot) return;

  filtersRoot.replaceChildren(
    ...asArray(filters.chips).map((chip) =>
      createElement('button', {
        className: classNames(
          'equip-filter',
          chip?.active && 'equip-filter--active',
          chip?.empty && 'equip-filter--empty',
          chip?.count > 0 && chip?.id !== 'todos' && chip?.tone && `equip-filter--${chip.tone}`,
        ),
        attrs: {
          type: 'button',
          'data-action': EQUIPAMENTOS_ACTIONS.quickFilter,
          'data-id': chip?.id,
          'aria-pressed': chip?.active ? 'true' : 'false',
          'aria-label': `${chip?.label || ''}: ${chip?.count || 0}`,
        },
      }),
    ),
  );

  asArray(filters.chips).forEach((chip, index) => {
    const button = filtersRoot.children[index];
    button.append(
      createElement('span', { className: 'equip-filter__label', text: chip?.label || '' }),
      createElement('span', {
        className: 'equip-filter__count',
        text: chip?.count || 0,
        attrs: { 'aria-hidden': 'true' },
      }),
    );
  });
}

function renderContext(contextRoot, context = {}) {
  if (!contextRoot) return;
  contextRoot.replaceChildren();
  if (!context.visible) return;

  const breadcrumb = createElement('div', { className: 'equip-breadcrumb' });
  breadcrumb.append(
    createElement('span', {
      className: 'equip-breadcrumb__item equip-breadcrumb__item--current',
      text: context.label || '',
    }),
    createElement('button', {
      className: 'equip-breadcrumb__item',
      text: 'Limpar filtro',
      attrs: {
        type: 'button',
        'data-action': EQUIPAMENTOS_ACTIONS.clearClienteFilter,
      },
    }),
  );
  contextRoot.append(breadcrumb);
}

function renderEquipamentosHeaderDom(root, { viewModel = {}, filtersRoot, contextRoot } = {}) {
  if (!root) return null;
  const safeViewModel = viewModel || {};

  root.className = 'equip-hero';
  root.setAttribute('aria-labelledby', EQUIPAMENTOS_PUBLIC_IDS.heroTitle);
  setHidden(root, !safeViewModel.hero?.visible);
  root.dataset.equipamentosHeaderMounted = 'true';

  if (filtersRoot) {
    filtersRoot.className = 'equip-filters';
    filtersRoot.setAttribute('aria-label', 'Filtrar equipamentos');
    setHidden(filtersRoot, !safeViewModel.filters?.visible);
  }

  renderHero(root, safeViewModel.hero || {});
  renderFilters(filtersRoot, safeViewModel.filters || {});
  renderContext(contextRoot, safeViewModel.context || {});

  return root;
}

function unmountEquipamentosHeaderDom(
  root = document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.hero),
) {
  if (!root?.dataset.equipamentosHeaderMounted) return null;

  const filtersRoot = document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.filters);
  const contextRoot = document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.contextChip);
  root.replaceChildren();
  filtersRoot?.replaceChildren();
  contextRoot?.replaceChildren();
  delete root.dataset.equipamentosHeaderMounted;
  return null;
}

/** @sliceTarget controller/bridges */
export function loadEquipamentosHeaderBridge() {
  let promise = getEquipamentosHeaderBridgePromise();
  if (!promise) {
    const bridge = {
      mountEquipamentosHeader: renderEquipamentosHeaderDom,
      unmountEquipamentosHeader: unmountEquipamentosHeaderDom,
    };
    setEquipamentosHeaderBridge(bridge);
    promise = Promise.resolve(bridge);
    setEquipamentosHeaderBridgePromise(promise);
  }
  return promise;
}

/** @sliceTarget ui/unmount */
export function unmountEquipamentosHeader() {
  incrementEquipamentosHeaderRenderGeneration();
  return unmountEquipamentosHeaderDom();
}

/** @sliceTarget controller/mount */
export function mountEquipamentosHeader({ viewModel, root, filtersRoot, contextRoot }) {
  if (!root) return null;
  const renderGeneration = incrementEquipamentosHeaderRenderGeneration();

  return Promise.resolve().then(() => {
    if (renderGeneration !== getEquipamentosHeaderRenderGeneration()) return null;
    return renderEquipamentosHeaderDom(root, { viewModel, filtersRoot, contextRoot });
  });
}
