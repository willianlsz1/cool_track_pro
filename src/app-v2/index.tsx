import React from 'react';
import { createRoot } from 'react-dom/client';
import '../react/styles/tailwind.css';
import './styles/print.css';
import { AppV2Shell } from './shell/AppV2Shell';

export function mountAppV2(root: HTMLElement) {
  createRoot(root).render(
    <React.StrictMode>
      <AppV2Shell />
    </React.StrictMode>,
  );
}
