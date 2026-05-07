import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { HistoricoFilters } from '../pages/HistoricoFilters.jsx';

const DEFAULT_ROOT_ID = 'hist-filters-root';
const roots = new WeakMap();

export function mountHistoricoFiltersReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let state = roots.get(root);
  if (!state) {
    state = {
      root: createRoot(root),
    };
    roots.set(root, state);
  }

  root.dataset.reactHistoricoFiltersMounted = 'true';

  flushSync(() => {
    state.root.render(
      <ErrorBoundary name="historicoFiltersIsland">
        <HistoricoFilters {...props} />
      </ErrorBoundary>,
    );
  });

  return state.root;
}

export function unmountHistoricoFiltersReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const state = roots.get(root);
  if (!state) return;

  state.root.unmount();
  roots.delete(root);
  delete root.dataset.reactHistoricoFiltersMounted;
}
