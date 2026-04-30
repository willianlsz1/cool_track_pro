import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { EquipamentosListPage } from '../pages/EquipamentosListPage.jsx';
import '../styles/tailwind.css';

const DEFAULT_ROOT_ID = 'lista-equip';
const roots = new WeakMap();

export function mountEquipamentosListReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
    root.dataset.reactEquipamentosListMounted = 'true';
  }

  flushSync(() => {
    reactRoot.render(<EquipamentosListPage {...props} />);
  });
  return reactRoot;
}

export function unmountEquipamentosListReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactEquipamentosListMounted;
}
