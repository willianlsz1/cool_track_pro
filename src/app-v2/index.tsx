import React from 'react';
import { createRoot } from 'react-dom/client';
import '../react/styles/tailwind.css';
import { HomeToday } from './home/HomeToday';

export function mountAppV2(root: HTMLElement) {
  createRoot(root).render(
    <React.StrictMode>
      <HomeToday />
    </React.StrictMode>,
  );
}
