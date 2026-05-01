import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';
import { DashboardReadOnlyBlocks } from '../pages/DashboardReadOnlyBlocks.jsx';

const DEFAULT_ROOT_ID = DASHBOARD_PUBLIC_IDS.readOnlyBlocksRoot;
const roots = new WeakMap();

export function mountDashboardReadOnlyBlocksReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactDashboardReadOnlyBlocksMounted = 'true';
  }

  if (!root.style.display) {
    root.style.display = 'contents';
  }

  flushSync(() => {
    reactRoot.render(<DashboardReadOnlyBlocks {...props} />);
  });
  return reactRoot;
}

export function unmountDashboardReadOnlyBlocksReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactDashboardReadOnlyBlocksMounted;
}
