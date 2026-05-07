import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { DashboardOnboarding } from '../pages/DashboardOnboarding.jsx';

const DEFAULT_ROOT_ID = DASHBOARD_PUBLIC_IDS.onboarding;
const roots = new WeakMap();

function getEmptyRoot(props) {
  return props.emptyRoot || document.getElementById(DASHBOARD_PUBLIC_IDS.empty) || null;
}

function getOverflowRoot(props) {
  return props.overflowRoot || document.getElementById(DASHBOARD_PUBLIC_IDS.overflowBanner) || null;
}

export function mountDashboardOnboardingReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactDashboardOnboardingMounted = 'true';
  }

  const model = props.onboarding || {};
  const emptyRoot = getEmptyRoot(props);
  const overflowRoot = getOverflowRoot(props);

  root.setAttribute('data-tier', String(model.tier || 'free'));

  if (emptyRoot) {
    emptyRoot.hidden = !model.empty?.visible;
    emptyRoot.classList.add('dash__empty');
  }

  flushSync(() => {
    reactRoot.render(
      <ErrorBoundary name="dashboardOnboardingIsland">
        <DashboardOnboarding {...props} emptyRoot={emptyRoot} overflowRoot={overflowRoot} />
      </ErrorBoundary>,
    );
  });

  return reactRoot;
}

export function unmountDashboardOnboardingReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  const emptyRoot = document.getElementById(DASHBOARD_PUBLIC_IDS.empty);
  const overflowRoot = document.getElementById(DASHBOARD_PUBLIC_IDS.overflowBanner);

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactDashboardOnboardingMounted;
  root.removeAttribute('data-tier');

  if (emptyRoot) {
    emptyRoot.replaceChildren();
    emptyRoot.hidden = true;
  }
  if (overflowRoot) {
    overflowRoot.replaceChildren();
  }
}
