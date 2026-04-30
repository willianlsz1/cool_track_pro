import { createRoot } from 'react-dom/client';

import { IntegrationProbe } from '../components/IntegrationProbe.jsx';
import '../styles/tailwind.css';

const DEFAULT_ROOT_ID = 'react-integration-root';

export function mountReactIntegrationProbe(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root || root.dataset.reactMounted === 'true') return null;

  const reactRoot = createRoot(root);
  reactRoot.render(<IntegrationProbe />);
  root.dataset.reactMounted = 'true';

  return reactRoot;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountReactIntegrationProbe(), {
      once: true,
    });
  } else {
    mountReactIntegrationProbe();
  }
}
