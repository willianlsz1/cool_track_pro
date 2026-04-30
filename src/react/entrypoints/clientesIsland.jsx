import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { ClientesPage } from '../pages/ClientesPage.jsx';
import '../styles/tailwind.css';

const DEFAULT_ROOT_ID = 'clientes-root';
const roots = new WeakMap();

export function mountClientesReact(root = document.getElementById(DEFAULT_ROOT_ID), props = {}) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactClientesMounted = 'true';
  }

  flushSync(() => {
    reactRoot.render(<ClientesPage {...props} />);
  });
  return reactRoot;
}

export function unmountClientesReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactClientesMounted;
}
