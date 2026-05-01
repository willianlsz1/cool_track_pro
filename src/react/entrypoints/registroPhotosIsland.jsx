import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';

import { RegistroPhotos } from '../pages/RegistroPhotos.jsx';

const DEFAULT_ROOT_ID = 'registro-photos-root';
const roots = new WeakMap();

export function mountRegistroPhotosReact(
  root = document.getElementById(DEFAULT_ROOT_ID),
  props = {},
) {
  if (!root) return null;

  let reactRoot = roots.get(root);
  if (!reactRoot) {
    reactRoot = createRoot(root);
    roots.set(root, reactRoot);
  }

  root.dataset.reactRegistroPhotosMounted = 'true';

  flushSync(() => {
    reactRoot.render(<RegistroPhotos {...props} />);
  });

  return reactRoot;
}

export function unmountRegistroPhotosReact(root = document.getElementById(DEFAULT_ROOT_ID)) {
  if (!root) return;

  const reactRoot = roots.get(root);
  if (!reactRoot) return;

  reactRoot.unmount();
  roots.delete(root);
  delete root.dataset.reactRegistroPhotosMounted;
}
