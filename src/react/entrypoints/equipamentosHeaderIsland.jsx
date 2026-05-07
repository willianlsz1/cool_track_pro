import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { EQUIPAMENTOS_PUBLIC_IDS } from '../../ui/viewModels/equipamentosContracts.js';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { EquipamentosHeader } from '../pages/EquipamentosHeader.jsx';

const DEFAULT_ROOT_ID = EQUIPAMENTOS_PUBLIC_IDS.hero;
const roots = new WeakMap();

function getFiltersRoot(props) {
  return props?.filtersRoot || document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.filters);
}

function getContextRoot(props) {
  return props?.contextRoot || document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.contextChip);
}

function syncShell(root, filtersRoot, viewModel = {}) {
  root.className = 'equip-hero';
  root.setAttribute('aria-labelledby', 'equip-hero-title');
  if (viewModel.hero?.visible) {
    root.removeAttribute('hidden');
  } else {
    root.setAttribute('hidden', '');
  }

  if (filtersRoot) {
    filtersRoot.className = 'equip-filters';
    filtersRoot.setAttribute('aria-label', 'Filtrar equipamentos');
    if (viewModel.filters?.visible) {
      filtersRoot.removeAttribute('hidden');
    } else {
      filtersRoot.setAttribute('hidden', '');
    }
  }
}

export function mountEquipamentosHeaderReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  const filtersRoot = getFiltersRoot(props);
  const contextRoot = getContextRoot(props);
  const viewModel = props?.viewModel || {};

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactEquipamentosHeaderMounted = 'true';
  }

  syncShell(root, filtersRoot, viewModel);
  flushSync(() => {
    reactRoot.render(
      <ErrorBoundary name="equipamentosHeaderIsland">
        <EquipamentosHeader
          viewModel={viewModel}
          filtersRoot={filtersRoot}
          contextRoot={contextRoot}
        />
      </ErrorBoundary>,
    );
  });
  return reactRoot;
}

export function unmountEquipamentosHeaderReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const filtersRoot = document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.filters);
  const contextRoot = document.getElementById(EQUIPAMENTOS_PUBLIC_IDS.contextChip);
  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactEquipamentosHeaderMounted;
  filtersRoot?.replaceChildren();
  contextRoot?.replaceChildren();
}
