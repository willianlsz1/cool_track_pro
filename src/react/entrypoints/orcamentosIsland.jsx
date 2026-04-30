import { createRoot } from 'react-dom/client';

import { OrcamentosPage } from '../pages/OrcamentosPage.jsx';
import '../styles/tailwind.css';

const DEFAULT_ROOT_ID = 'view-orcamentos';
const roots = new WeakMap();

export function mountOrcamentosReact(root = document.getElementById(DEFAULT_ROOT_ID), props = {}) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactOrcamentosMounted = 'true';
  }

  reactRoot.render(<OrcamentosPage {...props} />);
  return reactRoot;
}

export function unmountOrcamentosReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactOrcamentosMounted;
}
