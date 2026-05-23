import React from 'react';
import { createRoot } from 'react-dom/client';
import '../react/styles/tailwind.css';
import './styles/print.css';
import type { AppV2DataPort } from './data/appV2DataPort';
import type { AppV2MockSnapshot } from './data/appV2MockStore';
import { AppV2Shell } from './shell/AppV2Shell';

export interface AppV2MountOptions {
  initialSnapshot?: AppV2MockSnapshot;
  dataPort?: AppV2DataPort;
}

export interface AppV2MountHandle {
  unmount(): void;
}

export function mountAppV2(root: HTMLElement, options: AppV2MountOptions = {}): AppV2MountHandle {
  const reactRoot = createRoot(root);

  reactRoot.render(
    <React.StrictMode>
      <AppV2Shell initialSnapshot={options.initialSnapshot} dataPort={options.dataPort} />
    </React.StrictMode>,
  );

  return {
    unmount: () => reactRoot.unmount(),
  };
}
