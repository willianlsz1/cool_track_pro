import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { RELATORIO_PUBLIC_IDS } from '../../ui/viewModels/relatorioContracts.js';
import { RelatorioHero } from '../pages/RelatorioHero.jsx';

const roots = new WeakMap();

export function mountRelatorioHeroReact(
  root = document.getElementById(RELATORIO_PUBLIC_IDS.hero),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
  }

  root.dataset.reactRelatorioHeroMounted = 'true';
  flushSync(() => {
    reactRoot.render(<RelatorioHero {...props} />);
  });

  return reactRoot;
}

export function unmountRelatorioHeroReact(
  root = document.getElementById(RELATORIO_PUBLIC_IDS.hero),
) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactRelatorioHeroMounted;
}
