import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';
import { DashboardHero } from '../pages/DashboardHero.jsx';

const DEFAULT_ROOT_ID = DASHBOARD_PUBLIC_IDS.hero;
const roots = new WeakMap();

function rootTier(props) {
  const tier = props?.hero?.tier;
  return tier ? String(tier) : 'free';
}

function rootTone(props) {
  const tone = props?.hero?.tone;
  return tone ? String(tone) : 'ok';
}

export function mountDashboardHeroReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactDashboardHeroMounted = 'true';
  }

  root.dataset.tier = rootTier(props);
  root.dataset.tone = rootTone(props);
  flushSync(() => {
    reactRoot.render(<DashboardHero {...props} />);
  });
  return reactRoot;
}

export function unmountDashboardHeroReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactDashboardHeroMounted;
}
