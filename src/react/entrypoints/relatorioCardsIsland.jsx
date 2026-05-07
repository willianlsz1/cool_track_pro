import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import {
  RELATORIO_PUBLIC_IDS,
  RELATORIO_VIEW_MODES,
} from '../../ui/viewModels/relatorioContracts.js';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { RelatorioCards } from '../pages/RelatorioCards.jsx';

const roots = new WeakMap();

function normalizeViewMode(viewMode) {
  return viewMode === RELATORIO_VIEW_MODES.detailed
    ? RELATORIO_VIEW_MODES.detailed
    : RELATORIO_VIEW_MODES.compact;
}

export function mountRelatorioCardsReact(
  root = document.getElementById(RELATORIO_PUBLIC_IDS.body),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
  }

  root.classList.add('rel-records');
  root.dataset.reactRelatorioCardsMounted = 'true';
  root.dataset.viewMode = normalizeViewMode(props?.cards?.viewMode);
  flushSync(() => {
    reactRoot.render(
      <ErrorBoundary name="relatorioCardsIsland">
        <RelatorioCards {...props} />
      </ErrorBoundary>,
    );
  });

  return reactRoot;
}

export function unmountRelatorioCardsReact(
  root = document.getElementById(RELATORIO_PUBLIC_IDS.body),
) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactRelatorioCardsMounted;
  delete root.dataset.viewMode;
}
