import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { HistoricoTimeline } from '../pages/HistoricoTimeline.jsx';

const DEFAULT_ROOT_ID = 'timeline';
const roots = new WeakMap();

export function mountHistoricoTimelineReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let state = roots.get(root);
  if (!state) {
    state = {
      root: createRoot(root),
      renderVersion: 0,
    };
    roots.set(root, state);
  }

  state.renderVersion += 1;
  root.dataset.reactHistoricoTimelineMounted = 'true';

  flushSync(() => {
    state.root.render(
      <ErrorBoundary name="historicoTimelineIsland">
        <HistoricoTimeline key={state.renderVersion} {...props} />
      </ErrorBoundary>,
    );
  });

  return state.root;
}

export function unmountHistoricoTimelineReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const state = roots.get(root);
  if (!state) return;

  state.root.unmount();
  roots.delete(root);
  delete root.dataset.reactHistoricoTimelineMounted;
}
