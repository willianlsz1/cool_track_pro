import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { RELATORIO_PUBLIC_IDS } from '../../ui/viewModels/relatorioContracts.js';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { RelatorioControls } from '../pages/RelatorioControls.jsx';

const roots = new WeakMap();

export function mountRelatorioControlsReact(
  root = document.getElementById(RELATORIO_PUBLIC_IDS.controlsRoot),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
  }

  root.dataset.reactRelatorioControlsMounted = 'true';
  flushSync(() => {
    reactRoot.render(
      <ErrorBoundary name="relatorioControlsIsland">
        <RelatorioControls {...props} />
      </ErrorBoundary>,
    );
  });

  return reactRoot;
}

export function unmountRelatorioControlsReact(
  root = document.getElementById(RELATORIO_PUBLIC_IDS.controlsRoot),
) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactRelatorioControlsMounted;
}
