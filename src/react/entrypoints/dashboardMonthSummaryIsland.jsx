import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';
import { DashboardMonthSummary } from '../pages/DashboardMonthSummary.jsx';

const DEFAULT_ROOT_ID = DASHBOARD_PUBLIC_IDS.monthSection;
const roots = new WeakMap();

export function mountDashboardMonthSummaryReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactDashboardMonthSummaryMounted = 'true';
  }

  flushSync(() => {
    reactRoot.render(<DashboardMonthSummary {...props} />);
  });
  return reactRoot;
}

export function unmountDashboardMonthSummaryReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactDashboardMonthSummaryMounted;
}
