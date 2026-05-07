import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { RegistroChecklist } from '../pages/RegistroChecklist.jsx';

const DEFAULT_ROOT_ID = 'r-checklist-body';
const roots = new WeakMap();

export function mountRegistroChecklistReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
  }

  root.dataset.reactRegistroChecklistMounted = 'true';

  flushSync(() => {
    reactRoot.render(
      <ErrorBoundary name="registroChecklistIsland">
        <RegistroChecklist {...props} />
      </ErrorBoundary>,
    );
  });

  return reactRoot;
}

export function unmountRegistroChecklistReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactRegistroChecklistMounted;
}
