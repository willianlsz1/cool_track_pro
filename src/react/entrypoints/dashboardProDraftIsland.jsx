import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { DASHBOARD_PUBLIC_IDS } from '../../ui/viewModels/dashboardContracts.js';
import { DashboardProDraft } from '../pages/DashboardProDraft.jsx';

const DEFAULT_ROOT_ID = DASHBOARD_PUBLIC_IDS.proOpsRow;
const roots = new WeakMap();

export function mountDashboardProDraftReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactDashboardProDraftMounted = 'true';
  }

  const model = props.proDraft || {};
  root.hidden = !model.proCards?.visible;
  root.setAttribute('data-tier', String(model.tier || 'free'));

  const draftRoot =
    props.draftRoot || document.getElementById(DASHBOARD_PUBLIC_IDS.proDraftRoot) || null;

  flushSync(() => {
    reactRoot.render(<DashboardProDraft {...props} draftRoot={draftRoot} />);
  });
  return reactRoot;
}

export function unmountDashboardProDraftReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactDashboardProDraftMounted;
  root.removeAttribute('data-tier');

  const draftRoot = document.getElementById(DASHBOARD_PUBLIC_IDS.proDraftRoot);
  if (draftRoot) {
    draftRoot.replaceChildren();
  }
}
