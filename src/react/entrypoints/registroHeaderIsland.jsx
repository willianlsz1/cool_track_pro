import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { RegistroHeader } from '../pages/RegistroHeader.jsx';

const DEFAULT_ROOT_ID = 'registro-header-root';
const roots = new WeakMap();

export function mountRegistroHeaderReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
  }

  root.dataset.reactRegistroHeaderMounted = 'true';

  flushSync(() => {
    reactRoot.render(
      <ErrorBoundary name="registroHeaderIsland">
        <RegistroHeader {...props} />
      </ErrorBoundary>,
    );
  });

  return reactRoot;
}

export function unmountRegistroHeaderReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactRegistroHeaderMounted;
}
