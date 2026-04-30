import { createRoot } from 'react-dom/client';

import { AlertasPage } from '../pages/AlertasPage.jsx';
import '../styles/tailwind.css';

const DEFAULT_ROOT_ID = 'view-alertas';
const roots = new WeakMap();

export function mountAlertasReact(root = document.getElementById(DEFAULT_ROOT_ID), props = {}) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactAlertasMounted = 'true';
  }

  reactRoot.render(<AlertasPage {...props} />);
  return reactRoot;
}

export function unmountAlertasReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactAlertasMounted;
}
