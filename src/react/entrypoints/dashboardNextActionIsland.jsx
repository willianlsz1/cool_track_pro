import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';
import { DashboardNextAction } from '../pages/DashboardNextAction.jsx';

const DEFAULT_ROOT_ID = DASHBOARD_PUBLIC_IDS.nextActionCard;
const roots = new WeakMap();

function rootTone(props) {
  const tone = props?.nextAction?.tone;
  return tone ? String(tone) : 'ok';
}

export function mountDashboardNextActionReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactDashboardNextActionMounted = 'true';
  }

  root.dataset.tone = rootTone(props);
  flushSync(() => {
    reactRoot.render(<DashboardNextAction {...props} />);
  });
  return reactRoot;
}

export function unmountDashboardNextActionReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactDashboardNextActionMounted;
}
