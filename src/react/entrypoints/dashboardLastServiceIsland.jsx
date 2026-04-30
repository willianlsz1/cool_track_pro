import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';
import { DashboardLastService } from '../pages/DashboardLastService.jsx';

const DEFAULT_ROOT_ID = DASHBOARD_PUBLIC_IDS.lastServiceCard;
const roots = new WeakMap();

function isHidden(props) {
  return Boolean(props?.lastService?.hidden);
}

export function mountDashboardLastServiceReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactDashboardLastServiceMounted = 'true';
  }

  root.hidden = isHidden(props);
  flushSync(() => {
    reactRoot.render(<DashboardLastService {...props} />);
  });
  return reactRoot;
}

export function unmountDashboardLastServiceReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactDashboardLastServiceMounted;
}
