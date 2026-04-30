import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';
import { DashboardKpis } from '../pages/DashboardKpis.jsx';

const DEFAULT_ROOT_ID = DASHBOARD_PUBLIC_IDS.kpiRoot;
const roots = new WeakMap();

export function mountDashboardKpisReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactDashboardKpisMounted = 'true';
  }

  flushSync(() => {
    reactRoot.render(<DashboardKpis {...props} />);
  });
  return reactRoot;
}

export function unmountDashboardKpisReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactDashboardKpisMounted;
}
